"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Shuffle,
  Target,
  Clock,
  Users,
  Settings,
  GripVertical,
  Play,
  Bug,
  Info,
} from "lucide-react"
import { useCanvasApi } from "../lib/canvas-api-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CourseData {
  totalStudents: number
  existingCanvasSections: number
  toolCreatedSections: number
  unassignedStudents: number
  detectedOFs: number
  newEnrollmentsSinceLastCheck: number
  recommendedSections: number
  censusDate: Date
  isCensusLocked: boolean
  facilitators: any[]
  students: any[]
  originalSections?: any[]
}

interface StudentAllocationProps {
  courseData: CourseData
}

export function StudentAllocation({ courseData }: StudentAllocationProps) {
  const { autoAllocateStudents, allocateStudents, moveStudent, isLoading } = useCanvasApi()
  const [allocationMode, setAllocationMode] = useState<"auto" | "manual">("auto")
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [previewAllocation, setPreviewAllocation] = useState<any>(null)
  const [isAllocating, setIsAllocating] = useState(false)
  const [allocationProgress, setAllocationProgress] = useState(0)
  const [allocationStatus, setAllocationStatus] = useState<string>("")
  const [allocationResult, setAllocationResult] = useState<any>(null)
  const [draggedStudent, setDraggedStudent] = useState<any>(null)
  const [localStudentAssignments, setLocalStudentAssignments] = useState<Map<string, string>>(new Map())
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [settings, setSettings] = useState({
    targetRatio: 25,
    sectionNamingPattern: "Tutorial Group {letter}",
    autoCreateSections: true,
    respectCensusDate: true,
  })

  // Get students available for allocation - those NOT in tool-created sections
  const getUnassignedStudents = () => {
    console.log("Getting students available for allocation...")
    console.log("Course data students:", courseData.students?.length)
    console.log("Unassigned count from courseData:", courseData.unassignedStudents)

    if (courseData.students && courseData.students.length > 0) {
      // Students are "unassigned" if they're not in tool-created sections
      const unassigned = courseData.students.filter((s: any) => {
        // Use the isUnassignedForTool flag if available
        if (s.hasOwnProperty("isUnassignedForTool")) {
          return s.isUnassignedForTool
        }

        // Fallback: check if student is not in a tool-created section
        const isInToolSection = s.hasOwnProperty("isInToolSection") ? s.isInToolSection : false
        return !isInToolSection
      })

      console.log("Students available for allocation:", unassigned.length)
      console.log("Sample student:", unassigned[0])

      return unassigned
    }

    // Fallback: return empty array if no student data
    console.log("No student data available")
    return []
  }

  const handleDragStart = (e: React.DragEvent, student: any) => {
    setDraggedStudent(student)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML)
    e.dataTransfer.setData("text/plain", student.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, facilitator: any) => {
    e.preventDefault()

    if (!draggedStudent) return

    try {
      setAllocationStatus(`Moving ${draggedStudent.name} to ${facilitator.name}'s section...`)

      // Update local state immediately for UI feedback
      setLocalStudentAssignments((prev) => {
        const newMap = new Map(prev)
        newMap.set(draggedStudent.id, facilitator.canvasUserId)
        return newMap
      })

      const studentCanvasId = draggedStudent.canvasUserId || draggedStudent.id

      // Check if this is a real student
      if (!draggedStudent.canvasUserId) {
        setAllocationStatus(`Cannot move student without Canvas ID. Please refresh data.`)
        // Revert local state
        setLocalStudentAssignments((prev) => {
          const newMap = new Map(prev)
          newMap.delete(draggedStudent.id)
          return newMap
        })
        return
      }

      // For manual assignment, we'll use the allocate students API
      const allocation = [
        {
          facilitatorId: facilitator.canvasUserId,
          studentIds: [studentCanvasId],
        },
      ]

      await handleManualAllocation(allocation)

      setAllocationStatus(`Successfully assigned ${draggedStudent.name} to ${facilitator.name}'s section`)

      // Reset dragged student
      setDraggedStudent(null)
    } catch (error) {
      // Revert local state on error
      setLocalStudentAssignments((prev) => {
        const newMap = new Map(prev)
        newMap.delete(draggedStudent.id)
        return newMap
      })

      setAllocationStatus(`Error assigning student: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleAutoAllocation = async () => {
    setIsAllocating(true)
    setAllocationProgress(0)
    setAllocationStatus("Calculating optimal allocation...")
    setAllocationResult(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAllocationProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Use actual course data for allocation preview
      const availableOFs = courseData.facilitators || []
      const unassignedStudents = getUnassignedStudents()

      console.log("Auto allocation preview:")
      console.log("- Available OFs:", availableOFs.length)
      console.log("- Students available for allocation:", unassignedStudents.length)

      if (availableOFs.length === 0) {
        throw new Error("No facilitators available for allocation")
      }

      if (unassignedStudents.length === 0) {
        throw new Error("No students available for allocation. All students may already be in tool-created sections.")
      }

      setAllocationStatus("Generating allocation preview...")

      // Calculate optimal distribution
      const studentsPerSection = Math.ceil(unassignedStudents.length / availableOFs.length)

      const allocation = availableOFs
        .map((of, index) => {
          const startIndex = index * studentsPerSection
          const endIndex = Math.min(startIndex + studentsPerSection, unassignedStudents.length)
          const sectionStudents = unassignedStudents.slice(startIndex, endIndex)

          return {
            sectionName: `Tutorial Group ${String.fromCharCode(65 + index)}`, // A, B, C, etc.
            facilitator: of,
            students: sectionStudents,
            ratio: `1:${sectionStudents.length}`,
            studentCount: sectionStudents.length,
          }
        })
        .filter((section) => section.students.length > 0)

      clearInterval(progressInterval)
      setAllocationProgress(100)
      setAllocationStatus("Preview ready - Click 'Confirm & Execute Allocation' to implement in Canvas")
      setPreviewAllocation(allocation)

      console.log("Preview allocation created:", allocation)
    } catch (error) {
      setAllocationStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsAllocating(false)
    }
  }

  const handleConfirmAllocation = async () => {
    if (!previewAllocation) return

    setIsAllocating(true)
    setAllocationProgress(0)
    setAllocationStatus("Creating sections in Canvas...")
    setDebugInfo(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAllocationProgress((prev) => Math.min(prev + 15, 90))
      }, 500)

      // Call the auto-allocation API which will create sections and assign students
      console.log("Calling autoAllocateStudents API...")
      const result = await autoAllocateStudents()
      console.log("API response:", result)

      clearInterval(progressInterval)
      setAllocationProgress(100)

      // Store debug info
      setDebugInfo({
        apiResponse: result,
        timestamp: new Date().toISOString(),
        previewData: previewAllocation,
        unassignedStudents: getUnassignedStudents(),
        courseData: {
          totalStudents: courseData.totalStudents,
          unassignedStudents: courseData.unassignedStudents,
          facilitators: courseData.facilitators?.length || 0,
          originalSections: courseData.originalSections?.length || 0,
        },
      })

      setAllocationResult(result.results || result)

      // Check if allocation was actually successful
      const actualResults = result.results || result
      if (actualResults && (actualResults.sections > 0 || actualResults.allocated > 0)) {
        setAllocationStatus("✅ Allocation completed successfully! Sections created and students assigned in Canvas.")
      } else {
        setAllocationStatus("⚠️ Allocation completed but no sections were created. Check debug info below.")
      }

      setPreviewAllocation(null) // Clear preview after allocation attempt
    } catch (error) {
      console.error("Allocation error:", error)
      setAllocationStatus(`❌ Error: ${error instanceof Error ? error.message : "Allocation failed"}`)
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsAllocating(false)
    }
  }

  const handleManualAllocation = async (allocations: any[]) => {
    setIsAllocating(true)
    setAllocationStatus("Processing manual allocations...")

    try {
      const result = await allocateStudents(allocations)
      setAllocationResult(result)
      setAllocationStatus("Manual allocation completed!")
    } catch (error) {
      setAllocationStatus(`Error: ${error instanceof Error ? error.message : "Manual allocation failed"}`)
    } finally {
      setIsAllocating(false)
    }
  }

  const handleProceedWithAutoAllocation = async () => {
    console.log("Auto-allocation button clicked!")
    console.log("Facilitators:", courseData.facilitators)
    console.log("Students:", courseData.students)

    if (!courseData.facilitators || courseData.facilitators.length === 0) {
      console.log("No facilitators available")
      setAllocationStatus("Error: No facilitators available for allocation")
      return
    }

    const unassignedStudents = getUnassignedStudents()
    if (unassignedStudents.length === 0) {
      console.log("No students available for allocation")
      setAllocationStatus("No students available for allocation. All students may already be in tool-created sections.")
      return
    }

    console.log("Proceeding with auto allocation...")
    // First generate preview
    await handleAutoAllocation()
  }

  const handleManualAssignmentMode = () => {
    console.log("Manual assignment mode button clicked!")
    console.log("Course data students:", courseData.students)
    console.log("Students available for allocation:", getUnassignedStudents())
    setManualMode(true)
    setAllocationMode("manual")
  }

  const handleAdjustSettings = () => {
    console.log("Adjust settings button clicked!")
    setShowSettingsModal(true)
  }

  const SettingsModal = () => (
    <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Allocation Settings</DialogTitle>
          <DialogDescription>Configure allocation preferences and ratios</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-ratio">Target Student:Facilitator Ratio</Label>
            <Input
              id="target-ratio"
              type="number"
              value={settings.targetRatio}
              onChange={(e) => setSettings((prev) => ({ ...prev, targetRatio: Number.parseInt(e.target.value) || 25 }))}
              min="1"
              max="50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="naming-pattern">Section Naming Pattern</Label>
            <Input
              id="naming-pattern"
              value={settings.sectionNamingPattern}
              onChange={(e) => setSettings((prev) => ({ ...prev, sectionNamingPattern: e.target.value }))}
              placeholder="Tutorial Group {letter}"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{letter}"} for A, B, C... or {"{number}"} for 1, 2, 3...
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-create"
              checked={settings.autoCreateSections}
              onChange={(e) => setSettings((prev) => ({ ...prev, autoCreateSections: e.target.checked }))}
            />
            <Label htmlFor="auto-create">Automatically create sections in Canvas</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="respect-census"
              checked={settings.respectCensusDate}
              onChange={(e) => setSettings((prev) => ({ ...prev, respectCensusDate: e.target.checked }))}
            />
            <Label htmlFor="respect-census">Respect census date restrictions</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowSettingsModal(false)} className="bg-purple-600 hover:bg-purple-700">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  const unassignedStudents = getUnassignedStudents()
  // Filter out locally assigned students
  const availableStudents = unassignedStudents.filter((student) => !localStudentAssignments.has(student.id))

  return (
    <div className="space-y-6">
      {/* Course Context Information */}
      {courseData.originalSections && courseData.originalSections.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Course Structure:</strong> This tool will create new sections to distribute students from the
            original section(s) among Online Facilitators.
            <div className="mt-2 space-y-1">
              {courseData.originalSections.map((section: any) => (
                <div key={section.id} className="text-sm">
                  • <strong>{section.name}</strong>: {section.studentCount} students (will remain as backup/reference)
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Allocation Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            <span>Student Allocation</span>
          </CardTitle>
          <CardDescription>Create new sections and distribute students among Online Facilitators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shuffle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Auto-Allocate Students</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically create sections and distribute students
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleProceedWithAutoAllocation}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid="auto-allocate-btn"
                >
                  Proceed with Auto-Allocation
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Manual Assignment</h3>
                    <p className="text-sm text-muted-foreground">Manually assign students to specific sections</p>
                  </div>
                </div>
                <Button
                  onClick={handleManualAssignmentMode}
                  variant="outline"
                  className="w-full"
                  data-testid="manual-mode-btn"
                >
                  Manual Assignment Mode
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Adjust Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure ratios and section preferences</p>
                  </div>
                </div>
                <Button onClick={handleAdjustSettings} variant="outline" className="w-full" data-testid="settings-btn">
                  Adjust Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Debug Status Display */}
      {allocationStatus && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Status:</span>
            </div>
            <p className="text-sm text-blue-800 mt-1">{allocationStatus}</p>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Debug Information */}
      {debugInfo && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-orange-600" />
              <span>Debug Information</span>
            </CardTitle>
            <CardDescription>Technical details for troubleshooting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm">Timestamp:</h4>
                <p className="text-xs text-gray-600">{debugInfo.timestamp}</p>
              </div>

              {debugInfo.courseData && (
                <div>
                  <h4 className="font-semibold text-sm">Course Data Summary:</h4>
                  <div className="text-xs bg-gray-100 p-2 rounded">
                    <div>Total Students: {debugInfo.courseData.totalStudents}</div>
                    <div>Students Available for Allocation: {debugInfo.courseData.unassignedStudents}</div>
                    <div>Facilitators: {debugInfo.courseData.facilitators}</div>
                    <div>Original Sections: {debugInfo.courseData.originalSections}</div>
                  </div>
                </div>
              )}

              {debugInfo.unassignedStudents && (
                <div>
                  <h4 className="font-semibold text-sm">Students Available for Allocation:</h4>
                  <div className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-auto">
                    {debugInfo.unassignedStudents.length > 0 ? (
                      debugInfo.unassignedStudents.map((student: any, index: number) => (
                        <div key={index} className="mb-1">
                          {student.name} (Canvas ID: {student.canvasUserId || "N/A"})
                        </div>
                      ))
                    ) : (
                      <div>No students available for allocation</div>
                    )}
                  </div>
                </div>
              )}

              {debugInfo.apiResponse && (
                <div>
                  <h4 className="font-semibold text-sm">API Response:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(debugInfo.apiResponse, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.error && (
                <div>
                  <h4 className="font-semibold text-sm text-red-700">Error:</h4>
                  <p className="text-xs text-red-600">{debugInfo.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-Allocation Interface */}
      {allocationMode === "auto" && (
        <Card>
          <CardHeader>
            <CardTitle>Automatic Allocation Settings</CardTitle>
            <CardDescription>Configure automatic student distribution parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {courseData.facilitators && courseData.facilitators.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-ratio">Target Student:OF Ratio</Label>
                    <Input id="target-ratio" value="1:25" readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sections-count">Number of Sections</Label>
                    <Input id="sections-count" value={courseData.facilitators.length} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unassigned-count">Students to Allocate</Label>
                    <Input id="unassigned-count" value={unassignedStudents.length} readOnly className="bg-gray-50" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Available Online Facilitators:</h4>
                  <div className="space-y-2">
                    {courseData.facilitators.map((of: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{of.name}</span>
                          {of.isMultiRole && (
                            <span className="text-xs text-blue-600 ml-2">({of.roles?.join(", ")})</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{of.email}</span>
                          <Badge variant="outline" className="text-xs">
                            {of.currentStudents || 0}/{of.maxStudents || 25}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Show current student detection status */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Student Allocation Status:</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      Total Students in Course: <strong>{courseData.totalStudents}</strong>
                    </div>
                    <div>
                      Students Available for Allocation: <strong>{unassignedStudents.length}</strong>
                    </div>
                    <div>
                      Students Already in Tool Sections:{" "}
                      <strong>{courseData.totalStudents - unassignedStudents.length}</strong>
                    </div>
                    <div>
                      Tool-Created Sections: <strong>{courseData.toolCreatedSections}</strong>
                    </div>
                  </div>
                  {unassignedStudents.length === 0 && (
                    <Alert className="mt-2 border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        No students available for allocation. All students may already be allocated to tool-created
                        sections.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Progress Display */}
                {(isAllocating || allocationProgress > 0) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Allocation Progress</span>
                      <span className="text-sm text-muted-foreground">{allocationProgress}%</span>
                    </div>
                    <Progress value={allocationProgress} className="h-2" />
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {allocationStatus}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAutoAllocation}
                    disabled={isAllocating || unassignedStudents.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isAllocating ? "Calculating..." : "Generate Allocation Preview"}
                  </Button>

                  {previewAllocation && (
                    <Button
                      onClick={handleConfirmAllocation}
                      disabled={isAllocating}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                      size="lg"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isAllocating ? "Implementing in Canvas..." : "Confirm & Execute Allocation"}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  No Online Facilitators detected. Please add Teacher roles to staff members before proceeding with
                  allocation.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rest of the component remains the same... */}
      {manualMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Manual Student Assignment</span>
              </span>
              <Button variant="outline" size="sm" onClick={() => setManualMode(false)}>
                Back to Auto Mode
              </Button>
            </CardTitle>
            <CardDescription>Drag and drop students to assign them to specific sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Students Available for Allocation */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Students Available for Allocation ({unassignedStudents.length})
                </h4>
                <div className="border rounded-lg p-3 max-h-96 overflow-y-auto space-y-2">
                  {availableStudents.length > 0 ? (
                    availableStudents.map((student) => (
                      <Card
                        key={student.id}
                        className="p-3 cursor-move hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                        draggable
                        onDragStart={(e) => handleDragStart(e, student)}
                      >
                        <div className="flex items-center space-x-3">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                            <div className="text-xs text-gray-400">Canvas ID: {student.canvasUserId || "N/A"}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Available
                          </Badge>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No students available for allocation</p>
                      <p className="text-xs mt-1">All students may already be in tool-created sections</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Facilitator Sections */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Online Facilitators
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {courseData.facilitators?.map((facilitator, index) => {
                    // Get students assigned to this facilitator locally
                    const assignedStudents = unassignedStudents.filter(
                      (student) => localStudentAssignments.get(student.id) === facilitator.canvasUserId,
                    )

                    return (
                      <Card
                        key={index}
                        className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, facilitator)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium text-sm">{facilitator.name}</div>
                              <div className="text-xs text-muted-foreground">{facilitator.email}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {assignedStudents.length}/{settings.targetRatio}
                            </Badge>
                          </div>

                          {/* Show assigned students */}
                          {assignedStudents.length > 0 && (
                            <div className="mb-3 space-y-1">
                              {assignedStudents.map((student) => (
                                <div
                                  key={student.id}
                                  className="text-xs bg-green-100 p-2 rounded border-l-2 border-green-500"
                                >
                                  <div className="font-medium">{student.name}</div>
                                  <div className="text-gray-600">{student.email}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <div className="text-center text-xs text-gray-500">
                              <Target className="w-4 h-4 mx-auto mb-1" />
                              Drop students here to assign
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Target className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Drag students from the left panel to facilitator sections on the right. This will create new sections in
                Canvas and assign students accordingly.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Allocation Preview and Results sections remain the same... */}
      {previewAllocation && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Allocation Preview</span>
            </CardTitle>
            <CardDescription>Review the proposed section allocation before implementing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {previewAllocation.map((section: any, index: number) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{section.sectionName}</h4>
                        <p className="text-sm text-muted-foreground">
                          OF: {section.facilitator.name}
                          {section.facilitator.isMultiRole && (
                            <span className="text-xs text-blue-600 ml-1">
                              (Multiple roles: {section.facilitator.roles?.join(", ")})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{section.facilitator.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={`mb-1 ${
                            section.studentCount <= 25
                              ? "bg-green-100 text-green-800"
                              : section.studentCount <= 35
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {section.ratio}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{section.studentCount} students</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          section.studentCount <= 25
                            ? "bg-green-500"
                            : section.studentCount <= 35
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={`text-sm ${
                          section.studentCount <= 25
                            ? "text-green-700"
                            : section.studentCount <= 35
                              ? "text-yellow-700"
                              : "text-red-700"
                        }`}
                      >
                        {section.studentCount <= 25
                          ? "Optimal ratio maintained"
                          : section.studentCount <= 35
                            ? "Acceptable ratio"
                            : "Exceeds recommended ratio"}
                      </span>
                    </div>

                    {/* Show some student names as preview */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600 mb-1">Students to be assigned:</p>
                      <div className="flex flex-wrap gap-1">
                        {section.students.slice(0, 3).map((student: any, idx: number) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {student.name}
                          </span>
                        ))}
                        {section.students.length > 3 && (
                          <span className="text-xs text-gray-500">+{section.students.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert
              className={`${
                previewAllocation.every((s: any) => s.studentCount <= 25)
                  ? "border-green-200 bg-green-50"
                  : previewAllocation.every((s: any) => s.studentCount <= 35)
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-red-200 bg-red-50"
              }`}
            >
              <CheckCircle
                className={`h-4 w-4 ${
                  previewAllocation.every((s: any) => s.studentCount <= 25)
                    ? "text-green-600"
                    : previewAllocation.every((s: any) => s.studentCount <= 35)
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              />
              <AlertDescription
                className={`${
                  previewAllocation.every((s: any) => s.studentCount <= 25)
                    ? "text-green-800"
                    : previewAllocation.every((s: any) => s.studentCount <= 35)
                      ? "text-yellow-800"
                      : "text-red-800"
                }`}
              >
                {previewAllocation.every((s: any) => s.studentCount <= 25)
                  ? "All sections maintain optimal ratios. Ready to implement allocation."
                  : previewAllocation.every((s: any) => s.studentCount <= 35)
                    ? "All sections are within acceptable limits. Ready to implement allocation."
                    : "Some sections exceed recommended ratios. Consider adding more Online Facilitators or review allocation."}
              </AlertDescription>
            </Alert>

            {/* Prominent Execute Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleConfirmAllocation}
                disabled={isAllocating}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-3"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                {isAllocating ? "Creating Sections in Canvas..." : "🚀 Confirm & Execute Allocation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Allocation Results */}
      {allocationResult && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Allocation Results</span>
            </CardTitle>
            <CardDescription>Summary of the completed allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Total Students</span>
                </div>
                <p className="text-lg font-bold text-blue-900">{allocationResult.totalStudents || 0}</p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Successfully Allocated</span>
                </div>
                <p className="text-lg font-bold text-green-900">{allocationResult.allocated || 0}</p>
              </div>

              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Failed</span>
                </div>
                <p className="text-lg font-bold text-red-900">{allocationResult.failed || 0}</p>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Sections Created</span>
                </div>
                <p className="text-lg font-bold text-purple-900">{allocationResult.sections || 0}</p>
              </div>
            </div>

            {allocationResult.errors && allocationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-900">Errors Encountered:</h4>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 max-h-40 overflow-y-auto">
                  {allocationResult.errors.map((error: any, index: number) => (
                    <div key={index} className="text-sm text-red-800 mb-1">
                      • {error.error || error.message || JSON.stringify(error)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showSettingsModal && <SettingsModal />}
    </div>
  )
}
