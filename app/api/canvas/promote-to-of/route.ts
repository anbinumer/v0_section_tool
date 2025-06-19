import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId, userId, makeCurrentUserOF } = await request.json()

    if (!canvasUrl || !apiToken || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let targetUserId = userId

    if (makeCurrentUserOF) {
      // Get current user info
      const userResponse = await fetch(`${canvasUrl}/api/v1/users/self`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!userResponse.ok) {
        throw new Error("Failed to get current user information")
      }

      const currentUser = await userResponse.json()
      targetUserId = currentUser.id
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "No user specified" }, { status: 400 })
    }

    // First, check if user already has an enrollment in this course
    const enrollmentsResponse = await fetch(
      `${canvasUrl}/api/v1/courses/${courseId}/enrollments?user_id=${targetUserId}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!enrollmentsResponse.ok) {
      throw new Error("Failed to check existing enrollments")
    }

    const existingEnrollments = await enrollmentsResponse.json()
    const hasTeacherRole = existingEnrollments.some(
      (e: any) => e.type === "TeacherEnrollment" && e.enrollment_state === "active",
    )

    if (hasTeacherRole) {
      return NextResponse.json({
        success: true,
        message: "User already has Teacher (OF) role",
        alreadyHasRole: true,
      })
    }

    // Add Teacher role as additional enrollment (user will have multiple roles)
    const enrollResponse = await fetch(`${canvasUrl}/api/v1/courses/${courseId}/enrollments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enrollment: {
          user_id: targetUserId,
          type: "TeacherEnrollment",
          role: "TeacherEnrollment", // This specifies the Teacher role specifically
          enrollment_state: "active",
          notify: false, // Don't send notification email
        },
      }),
    })

    if (!enrollResponse.ok) {
      const errorText = await enrollResponse.text()
      let errorMessage = `Failed to add Teacher role: ${enrollResponse.status}`

      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.errors && errorJson.errors.length > 0) {
          errorMessage = errorJson.errors[0].message || errorMessage
        }
      } catch {
        // Use default error message
      }

      // If the error is about duplicate enrollment, that's actually okay
      if (errorText.includes("already enrolled") || errorText.includes("duplicate")) {
        return NextResponse.json({
          success: true,
          message: "User already has the necessary permissions",
          alreadyHasRole: true,
        })
      }

      throw new Error(errorMessage)
    }

    const enrollment = await enrollResponse.json()

    // Get user info for response
    const userResponse = await fetch(`${canvasUrl}/api/v1/users/${targetUserId}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    })

    const userInfo = userResponse.ok ? await userResponse.json() : { name: "User" }

    return NextResponse.json({
      success: true,
      message: `Successfully added Teacher (OF) role to ${userInfo.name}. They now have both their original role and Teacher permissions.`,
      enrollment,
      multipleRoles: true,
    })
  } catch (error) {
    console.error("Error promoting to OF:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add Teacher role" },
      { status: 500 },
    )
  }
}
