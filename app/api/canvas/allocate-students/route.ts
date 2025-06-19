import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId, allocations } = await request.json()

    if (!canvasUrl || !apiToken || !courseId || !allocations) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const results = []
    const errors = []

    // Process allocations in batches to avoid rate limiting
    for (const allocation of allocations) {
      try {
        const { sectionId, studentIds } = allocation
        
        for (const studentId of studentIds) {
          // Move student to new section
          const enrollmentResponse = await fetch(
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
                  course_section_id: sectionId,
                  enrollment_state: "active",
                  notify: false,
                },
              }),
            }
          )

          if (!enrollmentResponse.ok) {
            const errorText = await enrollmentResponse.text()
            errors.push({
              studentId,
              sectionId,
              error: `Failed to enroll: ${errorText}`,
            })
            continue
          }

          const enrollment = await enrollmentResponse.json()
          results.push({
            studentId,
            sectionId,
            enrollmentId: enrollment.id,
            success: true,
          })

          // Log to Canvas as announcement for audit trail
          await logAuditToCanvas(canvasUrl, apiToken, courseId, {
            action: "Student Allocated",
            details: `Student ${studentId} allocated to section ${sectionId}`,
            enrollmentId: enrollment.id
          })
        }
      } catch (error) {
        errors.push({
          allocation,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: allocations.reduce((sum: number, a: any) => sum + a.studentIds.length, 0),
        successful: results.length,
        failed: errors.length,
      },
    })
  } catch (error) {
    console.error("Error allocating students:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to allocate students" },
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
        message: `<p><strong>Action:</strong> ${event.action}</p><p><strong>Details:</strong> ${event.details}</p><p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>`,
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