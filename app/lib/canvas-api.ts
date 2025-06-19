export interface CanvasConfig {
  canvasUrl: string
  apiToken: string
  courseId: number
}

export interface CourseData {
  courseId: number
  courseName: string
  totalStudents: number
  existingCanvasSections: number
  toolCreatedSections: number
  unassignedStudents: number
  detectedOFs: number
  newEnrollmentsSinceLastCheck: number
  recommendedSections: number
  censusDate: Date
  isCensusLocked: boolean
  students: Student[]
  sections: Section[]
  facilitators: Facilitator[]
  lic: LIC | null
  otherStaff: StaffMember[]
  hasOFs: boolean
  lastSyncTime: Date
}

export interface Student {
  id: number
  name: string
  email: string
  enrollmentDate: Date
  isNewEnrollment: boolean
  hasDiscussionActivity: boolean
  currentSectionId: number | null
  canvasUserId: number
}

export interface Section {
  id: number
  canvasId: number
  name: string
  displayName: string
  isVisible: boolean
  facilitatorId: number | null
  studentCount: number
  ratio: string
  status: "active" | "inactive"
  createdBy: "tool" | "canvas"
  lastModified: Date
}

export interface Facilitator {
  id: number
  canvasUserId: number
  name: string
  email: string
  maxStudents: number
  currentStudents: number
  role: string
}

export interface LIC {
  id: number
  canvasUserId: number
  name: string
  email: string
  role: string
}

export interface StaffMember {
  id: number
  canvasUserId: number
  name: string
  email: string
  role: string
  canBePromotedToOF: boolean
}

class CanvasAPI {
  private config: CanvasConfig | null = null

  configure(config: CanvasConfig) {
    this.config = config
  }

  getConfig() {
    return this.config
  }

  private async makeApiRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`/api/canvas${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify({
        ...this.config,
        ...(options.body ? JSON.parse(options.body as string) : {}),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  async testConnection(): Promise<any> {
    if (!this.config) {
      throw new Error("Canvas API not configured")
    }

    try {
      const result = await this.makeApiRequest("/setup")
      return result
    } catch (error) {
      console.error("Connection test failed:", error)
      throw error
    }
  }

  async getCourseData(): Promise<CourseData> {
    if (!this.config) {
      throw new Error("Canvas API not configured")
    }

    try {
      const data = await this.makeApiRequest("/course-data")

      // Convert date strings back to Date objects
      return {
        ...data,
        censusDate: new Date(data.censusDate),
        lastSyncTime: new Date(data.lastSyncTime),
        students: data.students.map((s: any) => ({
          ...s,
          enrollmentDate: new Date(s.enrollmentDate),
        })),
        sections: data.sections.map((s: any) => ({
          ...s,
          lastModified: new Date(s.lastModified),
        })),
      }
    } catch (error) {
      console.error("Error fetching course data:", error)
      throw error
    }
  }

  async createSection(name: string, displayName?: string): Promise<any> {
    if (!this.config) {
      throw new Error("Canvas API not configured")
    }

    try {
      const result = await this.makeApiRequest("/create-section", {
        body: JSON.stringify({ name, displayName }),
      })
      return result
    } catch (error) {
      console.error("Error creating section:", error)
      throw error
    }
  }

  async promoteToOF(userId?: number, makeCurrentUserOF?: boolean): Promise<any> {
    if (!this.config) {
      throw new Error("Canvas API not configured")
    }

    try {
      const result = await this.makeApiRequest("/promote-to-of", {
        body: JSON.stringify({ userId, makeCurrentUserOF }),
      })
      return result
    } catch (error) {
      console.error("Error promoting to OF:", error)
      throw error
    }
  }
}

export const canvasApi = new CanvasAPI()
