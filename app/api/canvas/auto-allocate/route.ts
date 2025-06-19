import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId } = await request.json()

    if (!canvasUrl || !apiToken || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch current course data
    const courseDataResponse = await fetch('/api/canvas/course-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canvasUrl, apiToken, courseId })
    })

    if (!courseDataResponse.ok) {
      throw new Error('Failed to fetch course data')
    }

    const courseData = await courseDataResponse.json()
    const facilitators = courseData.facilitators || []
    const unassignedStudents = courseData.students?.filter((s: any) => !s.currentSectionId) || []

    if (facilitators.length === 0) {
      return NextResponse.json({ error: "No facilitators available for allocation" }, { status: 400 })
    }

    if (unassignedStudents.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No unassigned students to allocate",
        results: { totalStudents: 0, allocated: 0, failed: 0, sections: 0 }
      })
    }

    const results = {
      totalStudents: unassignedStudents.length,
      allocated: 0,
      failed: 0,
      sections: 0,
      errors: [] as any[]
    }

    // Calculate optimal distribution
    const studentsPerSection = Math.ceil(unassignedStudents.length / facilitators.length)
    
    // Create sections and allocate students
    for (let i = 0; i < facilitators.length && results.allocated < unassignedStudents.length; i++) {
      try {
        const facilitator = facilitators[i]
        const sectionName = `Tutorial Group ${String.fromCharCode(65 + i)}` // A, B, C, etc.
        
        // Create section
        const sectionResponse = await fetch('/api/canvas/create-section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            canvasUrl, 
            apiToken, 
            courseId, 
            name: sectionName,
            displayName: `${sectionName} - ${facilitator.name}`
          })
        })

        if (!sectionResponse.ok) {
          const sectionError = await sectionResponse.json()
          results.errors.push({
            section: sectionName,
            error: `Failed to create section: ${sectionError.error}`
          })
          continue
        }

        const section = await sectionResponse.json()
        results.sections++

        // Get students for this section
        const startIndex = i * studentsPerSection
        const endIndex = Math.min(startIndex + studentsPerSection, unassignedStudents.length)
        const sectionStudents = unassignedStudents.slice(startIndex, endIndex)

        // Allocate students to this section
        const allocationResponse = await fetch('/api/canvas/allocate-students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            canvasUrl,
            apiToken,
            courseId,
            allocations: [{
              sectionId: section.section.canvasId,
              studentIds: sectionStudents.map((s: any) => s.canvasUserId)
            }]
          })
        })

        if (!allocationResponse.ok) {
          const allocationError = await allocationResponse.json()
          results.errors.push({
            section: sectionName,
            error: `Failed to allocate students: ${allocationError.error}`
          })
          continue
        }

        const allocationResult = await allocationResponse.json()
        results.allocated += allocationResult.summary?.successful || 0
        results.failed += allocationResult.summary?.failed || 0

        if (allocationResult.errors?.length > 0) {
          results.errors.push(...allocationResult.errors)
        }

        // Assign facilitator to section (add Teacher enrollment)
        try {
          const facilitatorEnrollResponse = await fetch(
            `${canvasUrl}/api/v1/courses/${courseId}/enrollments`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                enrollment: {
                  user_id: facilitator.canvasUserId,
                  course_section_id: section.section.canvasId,
                  type: "TeacherEnrollment",
                  enrollment_state: "active",
                  limit_privileges_to_course_section: true,
                  notify: false,
                },
              }),
            }
          )

          if (!facilitatorEnrollResponse.ok) {
            console.warn(`Failed to assign facilitator ${facilitator.name} to section ${sectionName}`)
          }
        } catch (error) {
          console.warn(`Error assigning facilitator: ${error}`)
        }

      } catch (error) {
        results.errors.push({
          section: `Tutorial Group ${String.fromCharCode(65 + i)}`,
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    // Log the auto-allocation for audit trail
    await logAuditToCanvas(canvasUrl, apiToken, courseId, {
      action: "Auto-Allocation Completed",
      details: `Auto-allocated ${results.allocated} students across ${results.sections} sections`,
      summary: results,
    })

    return NextResponse.json({
      success: results.failed === 0,
      message: `Auto-allocation completed. ${results.allocated} students allocated across ${results.sections} sections.`,
      results
    })

  } catch (error) {
    console.error("Error in auto-allocation:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Auto-allocation failed" },
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
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          ${event.summary ? `
            <h4>Summary:</h4>
            <ul>
              <li>Total Students: ${event.summary.totalStudents}</li>
              <li>Successfully Allocated: ${event.summary.allocated}</li>
              <li>Failed: ${event.summary.failed}</li>
              <li>Sections Created: ${event.summary.sections}</li>
            </ul>
          ` : ''}
          ${event.summary?.errors?.length > 0 ? `
            <h4>Errors:</h4>
            <ul>
              ${event.summary.errors.map((error: any) => `<li>${error.error || JSON.stringify(error)}</li>`).join('')}
            </ul>
          ` : ''}
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