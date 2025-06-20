"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { canvasApi, type CanvasConfig, type CourseData } from "./canvas-api"

interface CanvasApiContextType {
  courseData: CourseData | null
  isConfigured: boolean
  isLoading: boolean
  error: string | null
  setupCanvas: (config: CanvasConfig) => Promise<void>
  syncWithCanvas: () => Promise<void>
  createSection: (name: string, displayName?: string) => Promise<any>
  allocateStudents: (allocations: any[]) => Promise<any>
  autoAllocateStudents: () => Promise<any>
  moveStudent: (studentId: number, fromSectionId: number, toSectionId: number, justification?: string) => Promise<void>
  getAuditLogs: (filters?: any) => Promise<any[]>
  batchOperations: Map<string, any>
}

const CanvasApiContext = createContext<CanvasApiContextType | undefined>(undefined)

export function CanvasApiProvider({ children }: { children: ReactNode }) {
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [batchOperations, setBatchOperations] = useState(new Map())

  const setupCanvas = async (config: CanvasConfig) => {
    setIsLoading(true)
    setError(null)

    try {
      // Configure the API client
      canvasApi.configure(config)

      // Test the connection first
      await canvasApi.testConnection()

      // If connection successful, fetch and cache course data
      const data = await canvasApi.getCourseData()
      setCourseData(data)
      setIsConfigured(true)

      // Store config securely (consider encryption for production)
      localStorage.setItem("canvas-config", JSON.stringify(config))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Canvas")
      setIsConfigured(false)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const syncWithCanvas = async () => {
    if (!isConfigured) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await canvasApi.getCourseData()
      setCourseData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed")
    } finally {
      setIsLoading(false)
    }
  }

  const createSection = async (name: string, displayName?: string) => {
    if (!isConfigured) throw new Error("Canvas not configured")

    try {
      const section = await canvasApi.createSection(name, displayName)
      await syncWithCanvas() // Refresh data
      return section
    } catch (err) {
      throw err
    }
  }

  const allocateStudents = async (allocations: any[]) => {
    if (!isConfigured) throw new Error("Canvas not configured")

    setIsLoading(true)
    try {
      const response = await fetch("/api/canvas/allocate-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...canvasApi.getConfig(),
          allocations,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Allocation failed")
      }

      const result = await response.json()
      await syncWithCanvas() // Refresh data
      return result
    } catch (err) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const autoAllocateStudents = async () => {
    if (!isConfigured || !courseData) throw new Error("Canvas not configured")

    setIsLoading(true)
    try {
      const response = await fetch("/api/canvas/auto-allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...canvasApi.getConfig(),
          courseId: courseData.courseId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Auto-allocation failed")
      }

      const result = await response.json()
      await syncWithCanvas() // Refresh data
      return result
    } catch (err) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const moveStudent = async (studentId: number, fromSectionId: number, toSectionId: number, justification?: string) => {
    if (!isConfigured || !courseData) throw new Error("Canvas not configured")

    try {
      const response = await fetch("/api/canvas/move-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...canvasApi.getConfig(), // This ensures the Canvas URL and API token are passed
          courseId: courseData.courseId,
          studentId,
          fromSectionId,
          toSectionId,
          justification,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to move student")
      }

      await syncWithCanvas() // Refresh data
    } catch (err) {
      throw err
    }
  }

  const getAuditLogs = async (filters: any = {}) => {
    if (!isConfigured || !courseData) return []

    try {
      // For now, we'll use Canvas announcements as audit logs
      // TODO: Implement proper Canvas-based audit logging
      const response = await fetch("/api/canvas/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...canvasApi.getConfig(),
          courseId: courseData.courseId,
          ...filters,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs")
      }

      return await response.json()
    } catch (err) {
      console.error("Error fetching audit logs:", err)
      return []
    }
  }

  // Periodic sync every 5 minutes when configured
  useEffect(() => {
    if (!isConfigured) return

    const interval = setInterval(
      () => {
        syncWithCanvas().catch(console.error)
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [isConfigured])

  // Try to restore config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("canvas-config")
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setupCanvas(config).catch(() => {
          // If restoration fails, clear saved config
          localStorage.removeItem("canvas-config")
        })
      } catch {
        localStorage.removeItem("canvas-config")
      }
    }
  }, [])

  return (
    <CanvasApiContext.Provider
      value={{
        courseData,
        isConfigured,
        isLoading,
        error,
        setupCanvas,
        syncWithCanvas,
        createSection,
        allocateStudents,
        autoAllocateStudents,
        moveStudent,
        getAuditLogs,
        batchOperations,
      }}
    >
      {children}
    </CanvasApiContext.Provider>
  )
}

export function useCanvasApi() {
  const context = useContext(CanvasApiContext)
  if (context === undefined) {
    throw new Error("useCanvasApi must be used within a CanvasApiProvider")
  }
  return context
}
