import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId } = await request.json()

    console.log("Auto-allocate API called with:", { canvasUrl, courseId, hasToken: !!apiToken })

    if (!canvasUrl || !apiToken || !courseId) {
      console.error("Missing required fields:", { canvasUrl: !!canvasUrl, apiToken: !!apiToken, courseId: !!courseId })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch current course data
    console.log("Fetching course data...")
    const courseDataResponse = await fetch("/api/canvas/course-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canvasUrl, apiToken, courseId }),
    })

    if (!courseDataResponse.ok) {
      const errorText = await courseDataResponse.text()
      console.error("Failed to fetch course data:", errorText)
      throw new Error(`Failed to fetch course data: ${errorText}`)
    }

    const courseData = await courseDataResponse.json()
    console.log("Course data fetched:", {
      totalStudents: courseData.students?.length,
      facilitators: courseData.facilitators?.length,
      unassignedStudents: courseData.unassignedStudents,
    })

    const facilitators = courseData.facilitators || []
    const unassignedStudents = courseData.students?.filter((s: any) => !s.currentSectionId) || []

    console.log("Filtered unassigned students:", unassignedStudents.length)
    console.log("Available facilitators:", facilitators.length)

    if (facilitators.length === 0) {
      console.error("No facilitators available")
      return NextResponse.json({ error: "No facilitators available for allocation" }, { status: 400 })
    }

    if (unassignedStudents.length === 0) {
      console.log("No unassigned students found")
      return NextResponse.json({
        success: true,
        message: "No unassigned students to allocate",
        results: { totalStudents: 0, allocated: 0, failed: 0, sections: 0 },
      })
    }

    const results = {
      totalStudents: unassignedStudents.length,
      allocated: 0,
      failed: 0,
      sections: 0,
      errors: [] as any[],
      createdSections: [] as any[],
    }

    console.log("Starting allocation process...")

    // Calculate optimal distribution
    const studentsPerSection = Math.ceil(unassignedStudents.length / facilitators.length)
    console.log("Students per section:", studentsPerSection)

    // Create sections and allocate students
    for (let i = 0; i < facilitators.length && results.allocated < unassignedStudents.length; i++) {
      try {
        const facilitator = facilitators[i]
        const sectionName = `Tutorial Group ${String.fromCharCode(65 + i)}` // A, B, C, etc.

        console.log(`Creating section ${sectionName} for facilitator ${facilitator.name}`)

        // Create section
        const sectionResponse = await fetch("/api/canvas/create-section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            canvasUrl,
            apiToken,
            courseId,
            name: sectionName,
            displayName: `${sectionName} - ${facilitator.name}`,
          }),
        })

        if (!sectionResponse.ok) {
          const sectionError = await sectionResponse.json()
          console.error(`Failed to create section ${sectionName}:`, sectionError)
          results.errors.push({
            section: sectionName,
            error: `Failed to create section: ${sectionError.error}`,
          })
          continue
        }

        const section = await sectionResponse.json()
        console.log(`Section ${sectionName} created with ID:`, section.section?.canvasId || section.section?.id)
        results.sections++
        results.createdSections.push(section)

        // Get students for this section
        const startIndex = i * studentsPerSection
        const endIndex = Math.min(startIndex + studentsPerSection, unassignedStudents.length)
        const sectionStudents = unassignedStudents.slice(startIndex, endIndex)

        console.log(`Assigning ${sectionStudents.length} students to ${sectionName}`)

        // Allocate students to this section
        const sectionId = section.section?.canvasId || section.section?.id
        if (!sectionId) {
          console.error("No section ID returned from section creation")
          results.errors.push({
            section: sectionName,
            error: "No section ID returned from section creation",
          })
          continue
        }

        const allocationResponse = await fetch("/api/canvas/allocate-students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            canvasUrl,
            apiToken,
            courseId,
            allocations: [
              {
                sectionId: sectionId,
                studentIds: sectionStudents.map((s: any) => s.canvasUserId),
              },
            ],
          }),
        })

        if (!allocationResponse.ok) {
          const allocationError = await allocationResponse.json()
          console.error(`Failed to allocate students to ${sectionName}:`, allocationError)
          results.errors.push({
            section: sectionName,
            error: `Failed to allocate students: ${allocationError.error}`,
          })
          continue
        }

        const allocationResult = await allocationResponse.json()
        console.log(`Allocation result for ${sectionName}:`, allocationResult)

        results.allocated += allocationResult.summary?.successful || 0
        results.failed += allocationResult.summary?.failed || 0

        if (allocationResult.errors?.length > 0) {
          results.errors.push(...allocationResult.errors)
        }

        // Assign facilitator to section (add Teacher enrollment)
        try {
          console.log(`Assigning facilitator ${facilitator.name} to section ${sectionName}`)

          const facilitatorEnrollResponse = await fetch(`${canvasUrl}/api/v1/courses/${courseId}/enrollments`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              enrollment: {
                user_id: facilitator.canvasUserId,
                course_section_id: sectionId,
                type: "TeacherEnrollment",
                enrollment_state: "active",
                limit_privileges_to_course_section: true,
                notify: false,
              },
            }),
          })

          if (!facilitatorEnrollResponse.ok) {
            const errorText = await facilitatorEnrollResponse.text()
            console.warn(`Failed to assign facilitator ${facilitator.name} to section ${sectionName}:`, errorText)
            results.errors.push({
              section: sectionName,
              error: `Failed to assign facilitator: ${errorText}`,
            })
          } else {
            console.log(`Successfully assigned facilitator ${facilitator.name} to section ${sectionName}`)
          }
        } catch (error) {
          console.warn(`Error assigning facilitator: ${error}`)
          results.errors.push({
            section: sectionName,
            error: `Error assigning facilitator: ${error instanceof Error ? error.message : "Unknown error"}`,
          })
        }
      } catch (error) {
        console.error(`Error processing section ${i}:`, error)
        results.errors.push({
          section: `Tutorial Group ${String.fromCharCode(65 + i)}`,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Log the auto-allocation for audit trail
    try {
      await logAuditToCanvas(canvasUrl, apiToken, courseId, {
        action: "Auto-Allocation Completed",
        details: `Auto-allocated ${results.allocated} students across ${results.sections} sections`,
        summary: results,
      })
    } catch (auditError) {
      console.warn("Failed to log audit event:", auditError)
    }

    console.log("Final allocation results:", results)

    return NextResponse.json({
      success: results.failed === 0 && results.sections > 0,
      message: `Auto-allocation completed. ${results.allocated} students allocated across ${results.sections} sections.`,
      results,
    })
  } catch (error) {
    console.error("Error in auto-allocation:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Auto-allocation failed" },
      { status: 500 },
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
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          ${
            event.summary
              ? `
            <h4>Summary:</h4>
            <ul>
              <li>Total Students: ${event.summary.totalStudents}</li>
              <li>Successfully Allocated: ${event.summary.allocated}</li>
              <li>Failed: ${event.summary.failed}</li>
              <li>Sections Created: ${event.summary.sections}</li>
            </ul>
          `
              : ""
          }
          ${
            event.summary?.errors?.length > 0
              ? `
            <h4>Errors:</h4>
            <ul>
              ${event.summary.errors.map((error: any) => `<li>${error.error || JSON.stringify(error)}</li>`).join("")}
            </ul>
          `
              : ""
          }
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
