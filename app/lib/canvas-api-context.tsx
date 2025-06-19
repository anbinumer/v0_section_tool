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
  allocateStudents: (allocations: any[]) => Promise<void>
  moveStudent: (studentId: number, fromSectionId: number, toSectionId: number) => Promise<void>
}

const CanvasApiContext = createContext<CanvasApiContextType | undefined>(undefined)

export function CanvasApiProvider({ children }: { children: ReactNode }) {
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setupCanvas = async (config: CanvasConfig) => {
    setIsLoading(true)
    setError(null)

    try {
      // Configure the API client
      canvasApi.configure(config)

      // Test the connection first
      await canvasApi.testConnection()

      // If connection successful, fetch course data
      const data = await canvasApi.getCourseData()
      setCourseData(data)
      setIsConfigured(true)

      // Store config in localStorage for persistence
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

    try {
      await canvasApi.allocateStudents(allocations)
      await syncWithCanvas() // Refresh data
    } catch (err) {
      throw err
    }
  }

  const moveStudent = async (studentId: number, fromSectionId: number, toSectionId: number) => {
    if (!isConfigured) throw new Error("Canvas not configured")

    try {
      await canvasApi.moveStudent(studentId, fromSectionId, toSectionId)
      await syncWithCanvas() // Refresh data
    } catch (err) {
      throw err
    }
  }

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
        moveStudent,
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
