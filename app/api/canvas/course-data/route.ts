import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId } = await request.json()

    if (!canvasUrl || !apiToken || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch course info
    const courseResponse = await fetch(`${canvasUrl}/api/v1/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!courseResponse.ok) {
      throw new Error(`Failed to fetch course: ${courseResponse.status} ${courseResponse.statusText}`)
    }

    const course = await courseResponse.json()

    // Fetch enrollments with more detailed role information
    const enrollmentsResponse = await fetch(
      `${canvasUrl}/api/v1/courses/${courseId}/enrollments?per_page=100&type[]=StudentEnrollment&type[]=TeacherEnrollment&type[]=TaEnrollment&type[]=DesignerEnrollment&type[]=ObserverEnrollment`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!enrollmentsResponse.ok) {
      throw new Error(`Failed to fetch enrollments: ${enrollmentsResponse.status} ${enrollmentsResponse.statusText}`)
    }

    const enrollments = await enrollmentsResponse.json()

    // Fetch sections
    const sectionsResponse = await fetch(`${canvasUrl}/api/v1/courses/${courseId}/sections`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!sectionsResponse.ok) {
      throw new Error(`Failed to fetch sections: ${sectionsResponse.status} ${sectionsResponse.statusText}`)
    }

    const sections = await sectionsResponse.json()

    // Process students
    const students = enrollments
      .filter((e: any) => e.type === "StudentEnrollment" && e.enrollment_state === "active")
      .map((e: any) => ({
        id: e.id,
        name: e.user.name,
        email: e.user.email || `${e.user.login_id}@acu.edu.au`,
        enrollmentDate: new Date(e.created_at),
        isNewEnrollment: new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        hasDiscussionActivity: false,
        currentSectionId: e.course_section_id,
        canvasUserId: e.user_id,
      }))

    // Group enrollments by user to handle multiple roles per person
    const userEnrollments = new Map()
    enrollments.forEach((e: any) => {
      if (e.enrollment_state === "active") {
        if (!userEnrollments.has(e.user_id)) {
          userEnrollments.set(e.user_id, {
            user: e.user,
            roles: [],
            enrollments: [],
          })
        }
        userEnrollments.get(e.user_id).roles.push(e.type.replace("Enrollment", ""))
        userEnrollments.get(e.user_id).enrollments.push(e)
      }
    })

    // Process Online Facilitators - users with Teacher role (may have multiple roles)
    const onlineFacilitators: any[] = []
    const licCandidates: any[] = []
    const otherStaff: any[] = []

    userEnrollments.forEach((userData, userId) => {
      const hasTeacherRole = userData.roles.includes("Teacher")
      const hasDesignerRole = userData.roles.includes("Designer")
      const hasStudentRole = userData.roles.includes("Student")

      // Skip if only student
      if (hasStudentRole && userData.roles.length === 1) {
        return
      }

      const userInfo = {
        canvasUserId: userId,
        name: userData.user.name,
        email: userData.user.email || `${userData.user.login_id}@acu.edu.au`,
        roles: userData.roles,
        primaryRole: userData.roles[0], // First role as primary
        enrollments: userData.enrollments,
      }

      if (hasTeacherRole) {
        // This person is an Online Facilitator
        onlineFacilitators.push({
          id: userData.enrollments[0].id,
          canvasUserId: userId,
          name: userData.user.name,
          email: userData.user.email || `${userData.user.login_id}@acu.edu.au`,
          maxStudents: 25,
          currentStudents: 0,
          roles: userData.roles,
          isMultiRole: userData.roles.length > 1,
        })
      } else if (hasDesignerRole) {
        // Potential LIC
        licCandidates.push(userInfo)
      } else {
        // Other staff
        otherStaff.push({
          ...userInfo,
          id: userData.enrollments[0].id,
          canBePromotedToOF: userData.roles.some((role: string) => ["Teacher", "Ta", "Designer"].includes(role)),
        })
      }
    })

    // Identify LIC (prefer Designer role, but could be other roles)
    const lic =
      licCandidates.length > 0
        ? {
            id: licCandidates[0].enrollments[0].id,
            canvasUserId: licCandidates[0].canvasUserId,
            name: licCandidates[0].name,
            email: licCandidates[0].email,
            roles: licCandidates[0].roles,
            primaryRole: licCandidates[0].primaryRole,
          }
        : null

    // Process sections
    const processedSections = sections.map((s: any) => ({
      id: s.id,
      canvasId: s.id,
      name: s.name,
      displayName: s.name,
      isVisible: true,
      facilitatorId: null,
      studentCount: students.filter((st: any) => st.currentSectionId === s.id).length,
      ratio: `1:${students.filter((st: any) => st.currentSectionId === s.id).length}`,
      status: "active",
      createdBy: s.name.includes("Section Management") ? "tool" : "canvas",
      lastModified: new Date(s.created_at || Date.now()),
    }))

    // Calculate metrics
    const toolSections = processedSections.filter((s: any) => s.createdBy === "tool")
    const unassignedStudents =
      toolSections.length === 0
        ? students.length
        : students.filter((s: any) => !toolSections.some((ts: any) => ts.canvasId === s.currentSectionId)).length

    const courseData = {
      courseId: Number.parseInt(courseId),
      courseName: course.name,
      totalStudents: students.length,
      existingCanvasSections: processedSections.filter((s: any) => s.createdBy === "canvas").length,
      toolCreatedSections: processedSections.filter((s: any) => s.createdBy === "tool").length,
      unassignedStudents,
      detectedOFs: onlineFacilitators.length,
      newEnrollmentsSinceLastCheck: students.filter((s: any) => s.isNewEnrollment).length,
      recommendedSections: onlineFacilitators.length > 0 ? Math.ceil(students.length / 25) : 0,
      censusDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isCensusLocked: false,
      students,
      sections: processedSections,
      facilitators: onlineFacilitators,
      lic,
      otherStaff,
      hasOFs: onlineFacilitators.length > 0,
      lastSyncTime: new Date(),
    }

    return NextResponse.json(courseData)
  } catch (error) {
    console.error("Error fetching course data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch course data" },
      { status: 500 },
    )
  }
}
