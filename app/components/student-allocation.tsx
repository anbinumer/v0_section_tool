"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { UserPlus, AlertTriangle, CheckCircle, Shuffle, Target, Clock, Users } from "lucide-react"
import { useCanvasApi } from "../lib/canvas-api-context"

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
}

interface StudentAllocationProps {
  courseData: CourseData
}

export function StudentAllocation({ courseData }: StudentAllocationProps) {
  const { autoAllocateStudents, allocateStudents, isLoading } = useCanvasApi()
  const [allocationMode, setAllocationMode] = useState<"auto" | "manual">("auto")
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [previewAllocation, setPreviewAllocation] = useState<any>(null)
  const [isAllocating, setIsAllocating] = useState(false)
  const [allocationProgress, setAllocationProgress] = useState(0)
  const [allocationStatus, setAllocationStatus] = useState<string>("")
  const [allocationResult, setAllocationResult] = useState<any>(null)

  const handleAutoAllocation = async () => {
    setIsAllocating(true)
    setAllocationProgress(0)
    setAllocationStatus("Calculating optimal allocation...")
    setAllocationResult(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAllocationProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // Use actual course data for allocation preview
      const availableOFs = courseData.facilitators || []
      const unassignedStudents = courseData.students?.filter(s => !s.currentSectionId) || []

      if (availableOFs.length === 0) {
        throw new Error('No facilitators available for allocation')
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
      setAllocationStatus("Preview ready")
      setPreviewAllocation(allocation)

    } catch (error) {
      setAllocationStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAllocating(false)
    }
  }

  const handleConfirmAllocation = async () => {
    if (!previewAllocation) return

    setIsAllocating(true)
    setAllocationProgress(0)
    setAllocationStatus("Implementing allocation in Canvas...")

    try {
      // Call the auto-allocation API
      const result = await autoAllocateStudents()
      
      setAllocationResult(result.results)
      setAllocationStatus("Allocation completed successfully!")
      setPreviewAllocation(null) // Clear preview after successful allocation
      
    } catch (error) {
      setAllocationStatus(`Error: ${error instanceof Error ? error.message : 'Allocation failed'}`)
    } finally {
      setIsAllocating(false)
      setAllocationProgress(100)
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
      setAllocationStatus(`Error: ${error instanceof Error ? error.message : 'Manual allocation failed'}`)
    } finally {
      setIsAllocating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Allocation Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            <span>Student Allocation</span>
          </CardTitle>
          <CardDescription>Choose how to allocate students to sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer transition-all ${allocationMode === "auto" ? "ring-2 ring-purple-500 bg-purple-50" : "hover:shadow-md"}`}
              onClick={() => setAllocationMode("auto")}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shuffle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Auto-Allocation</h3>
                    <p className="text-sm text-muted-foreground">Automatically balance students across sections</p>
                  </div>
                </div>
                {allocationMode === "auto" && (
                  <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                    ✓ Selected - Maintains optimal 1:25 ratio
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${allocationMode === "manual" ? "ring-2 ring-purple-500 bg-purple-50" : "hover:shadow-md"}`}
              onClick={() => setAllocationMode("manual")}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Manual Assignment</h3>
                    <p className="text-sm text-muted-foreground">Manually assign students to specific sections</p>
                  </div>
                </div>
                {allocationMode === "manual" && (
                  <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-800">
                    ✓ Selected - Full control over assignments
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

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
                    <Label htmlFor="unassigned-count">Unassigned Students</Label>
                    <Input 
                      id="unassigned-count" 
                      value={courseData.students?.filter(s => !s.currentSectionId).length || 0} 
                      readOnly 
                      className="bg-gray-50" 
                    />
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
                    disabled={isAllocating || !courseData.students?.some(s => !s.currentSectionId)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isAllocating ? "Calculating..." : "Generate Allocation Preview"}
                  </Button>
                  
                  {previewAllocation && (
                    <Button
                      onClick={handleConfirmAllocation}
                      disabled={isAllocating}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isAllocating ? "Implementing..." : "Confirm & Execute Allocation"}
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

      {/* Allocation Preview */}
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
                            section.studentCount <= 25 ? 'bg-green-100 text-green-800' :
                            section.studentCount <= 35 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
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

      {/* Manual Allocation Interface */}
      {allocationMode === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Student Assignment</CardTitle>
            <CardDescription>Drag and drop students to assign them to specific sections</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-blue-200 bg-blue-50">
              <Target className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Manual allocation interface coming soon. This will allow you to drag and drop individual students 
                between sections, set custom section sizes, and override automatic recommendations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* New Enrollments Alert */}
      {courseData.newEnrollmentsSinceLastCheck > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>New Enrollments Detected</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-amber-200 bg-amber-50 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>{courseData.newEnrollmentsSinceLastCheck} students</strong> have enrolled since your last
                allocation. These students need to be assigned to sections.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {courseData.students
                ?.filter((s) => s.isNewEnrollment)
                .map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <p className="text-xs text-amber-700">Enrolled: {student.enrollmentDate.toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      Unassigned
                    </Badge>
                  </div>
                ))}
            </div>

            <div className="mt-4 flex space-x-3">
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={handleAutoAllocation}
                disabled={isAllocating}
              >
                Auto-Allocate New Students
              </Button>
              <Button 
                variant="outline"
                onClick={() => setAllocationMode("manual")}
              >
                Manual Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
