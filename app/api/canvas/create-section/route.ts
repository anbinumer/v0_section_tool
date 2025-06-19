import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId, name, displayName } = await request.json()

    if (!canvasUrl || !apiToken || !courseId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for duplicate names first
    const sectionsResponse = await fetch(`${canvasUrl}/api/v1/courses/${courseId}/sections`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!sectionsResponse.ok) {
      throw new Error("Failed to fetch existing sections")
    }

    const existingSections = await sectionsResponse.json()
    const duplicateName = existingSections.find((s: any) => s.name.toLowerCase() === name.toLowerCase())

    if (duplicateName) {
      return NextResponse.json({ error: `Section name "${name}" already exists in Canvas` }, { status: 409 })
    }

    // Create the section
    const sectionData = {
      course_section: {
        name: name,
        sis_section_id: `SM_${Date.now()}`,
      },
    }

    const createResponse = await fetch(`${canvasUrl}/api/v1/courses/${courseId}/sections`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sectionData),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`Failed to create section: ${createResponse.status} ${errorText}`)
    }

    const section = await createResponse.json()

    return NextResponse.json({
      success: true,
      section: {
        id: section.id,
        name: section.name,
        canvasId: section.id,
      },
    })
  } catch (error) {
    console.error("Error creating section:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create section" },
      { status: 500 },
    )
  }
}
