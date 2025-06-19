import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId, studentId, fromSectionId, toSectionId, justification } = await request.json()

    if (!canvasUrl || !apiToken || !courseId || !studentId || !toSectionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get current enrollment
    const currentEnrollmentResponse = await fetch(
      `${canvasUrl}/api/v1/courses/${courseId}/enrollments?user_id=${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!currentEnrollmentResponse.ok) {
      throw new Error("Failed to fetch current enrollment")
    }

    const enrollments = await currentEnrollmentResponse.json()
    const currentEnrollment = enrollments.find((e: any) => 
      e.type === "StudentEnrollment" && e.course_section_id === fromSectionId
    )

    if (!currentEnrollment) {
      return NextResponse.json({ error: "Student not found in source section" }, { status: 404 })
    }

    // Create new enrollment in target section
    const newEnrollmentResponse = await fetch(
      `${canvasUrl}/api/v1/courses/${courseId}/enrollments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollment: {
            user_id: studentId,
            course_section_id: toSectionId,
            enrollment_state: "active",
            notify: false,
          },
        }),
      }
    )

    if (!newEnrollmentResponse.ok) {
      const errorText = await newEnrollmentResponse.text()
      throw new Error(`Failed to create new enrollment: ${errorText}`)
    }

    const newEnrollment = await newEnrollmentResponse.json()

    // Delete old enrollment
    const deleteResponse = await fetch(
      `${canvasUrl}/api/v1/courses/${courseId}/enrollments/${currentEnrollment.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: "delete",
        }),
      }
    )

    if (!deleteResponse.ok) {
      // Rollback: delete the new enrollment
      await fetch(
        `${canvasUrl}/api/v1/courses/${courseId}/enrollments/${newEnrollment.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ task: "delete" }),
        }
      )
      throw new Error("Failed to remove old enrollment")
    }

    // Log the move for audit trail using Canvas announcements
    await logAuditToCanvas(canvasUrl, apiToken, courseId, {
      action: "Student Moved",
      details: `Student ${studentId} moved from section ${fromSectionId} to ${toSectionId}`,
      justification: justification || "No justification provided",
      metadata: {
        studentId,
        fromSectionId,
        toSectionId,
        oldEnrollmentId: currentEnrollment.id,
        newEnrollmentId: newEnrollment.id,
      },
    })

    return NextResponse.json({
      success: true,
      oldEnrollmentId: currentEnrollment.id,
      newEnrollmentId: newEnrollment.id,
      message: "Student moved successfully",
    })
  } catch (error) {
    console.error("Error moving student:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to move student" },
      { status: 500 }
    )
  }
}

// Helper function to log audit events to Canvas
async function logAuditToCanvas(canvasUrl: string, apiToken: string, courseId: string, event: any) {
  try {
    // Create announcement for audit trail
    await fetch(`${canvasUrl}/api/v1/courses/${courseId}/discussion_topics`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `[Audit] ${event.action} - ${new Date().toISOString()}`,
        message: `
          <p><strong>Action:</strong> ${event.action}</p>
          <p><strong>Details:</strong> ${event.details}</p>
          <p><strong>Justification:</strong> ${event.justification || 'Not provided'}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          ${event.metadata ? `<p><strong>Metadata:</strong> ${JSON.stringify(event.metadata, null, 2)}</p>` : ''}
        `,
        is_announcement: true,
        require_initial_post: false,
        published: false, // Keep audit logs private
      }),
    })
  } catch (error) {
    console.error("Failed to log audit event:", error)
    // Don't fail the main operation if audit logging fails
  }
} 