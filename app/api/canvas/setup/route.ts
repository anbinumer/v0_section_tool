import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId } = await request.json()

    // Validate inputs
    if (!canvasUrl || !apiToken || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Test Canvas API connection
    const testUrl = `${canvasUrl}/api/v1/courses/${courseId}`
    const response = await fetch(testUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Canvas API Error: ${response.status} ${response.statusText}`

      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.errors && errorJson.errors.length > 0) {
          errorMessage = errorJson.errors[0].message || errorMessage
        }
      } catch {
        // Use default error message
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const courseData = await response.json()

    return NextResponse.json({
      success: true,
      course: {
        id: courseData.id,
        name: courseData.name,
        course_code: courseData.course_code,
      },
    })
  } catch (error) {
    console.error("Canvas setup error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect to Canvas" },
      { status: 500 },
    )
  }
}
