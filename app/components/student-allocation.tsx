"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, AlertTriangle, CheckCircle, Shuffle, Target } from "lucide-react"

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
}

interface StudentAllocationProps {
  courseData: CourseData
}

// Mock student data
const mockStudents = Array.from({ length: 75 }, (_, i) => ({
  id: i + 1,
  name: `Student ${i + 1}`,
  email: `student${i + 1}@acu.edu.au`,
  enrollmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  isNewEnrollment: i >= 73, // Last 2 are new enrollments
  hasDiscussionActivity: Math.random() > 0.7,
  currentSection: null,
}))

const mockOFs = [
  { id: 1, name: "Dr. Sarah Johnson", email: "sarah.johnson@acu.edu.au", maxStudents: 25 },
  { id: 2, name: "Prof. Michael Chen", email: "michael.chen@acu.edu.au", maxStudents: 25 },
  { id: 3, name: "Dr. Emma Wilson", email: "emma.wilson@acu.edu.au", maxStudents: 25 },
]

export function StudentAllocation({ courseData }: StudentAllocationProps) {
  const [allocationMode, setAllocationMode] = useState<"auto" | "manual">("auto")
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [previewAllocation, setPreviewAllocation] = useState<any>(null)
  const [isAllocating, setIsAllocating] = useState(false)

  const handleAutoAllocation = async () => {
    setIsAllocating(true)

    // Simulate allocation algorithm
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const studentsPerSection = Math.ceil(courseData.totalStudents / courseData.recommendedSections)
    const allocation = mockOFs.map((of, index) => ({
      sectionName: `Section ${index + 1}`,
      of: of,
      students: mockStudents.slice(index * studentsPerSection, (index + 1) * studentsPerSection),
      ratio: `1:${Math.min(studentsPerSection, mockStudents.length - index * studentsPerSection)}`,
    }))

    setPreviewAllocation(allocation)
    setIsAllocating(false)
  }

  const handleConfirmAllocation = async () => {
    setIsAllocating(true)
    // Simulate Canvas API calls
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsAllocating(false)
    // Reset preview
    setPreviewAllocation(null)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-ratio">Target Student:OF Ratio</Label>
                <Input id="target-ratio" value="1:25" readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sections-count">Number of Sections</Label>
                <Input id="sections-count" value={courseData.recommendedSections} readOnly className="bg-gray-50" />
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Auto-allocation will create <strong>{courseData.recommendedSections} sections</strong> with
                approximately{" "}
                <strong>{Math.ceil(courseData.totalStudents / courseData.recommendedSections)} students each</strong>,
                maintaining optimal ratios.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button
                onClick={handleAutoAllocation}
                disabled={isAllocating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isAllocating ? "Calculating..." : "Generate Allocation Preview"}
              </Button>
            </div>
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
                        <p className="text-sm text-muted-foreground">OF: {section.of.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {section.ratio}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{section.students.length} students</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-700">Optimal ratio maintained</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                All sections maintain optimal ratios. Ready to implement allocation.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button
                onClick={handleConfirmAllocation}
                disabled={isAllocating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isAllocating ? "Implementing..." : "Confirm & Implement Allocation"}
              </Button>
              <Button variant="outline" onClick={() => setPreviewAllocation(null)} disabled={isAllocating}>
                Cancel
              </Button>
            </div>
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
              {mockStudents
                .filter((s) => s.isNewEnrollment)
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

            <div className="mt-4">
              <Button className="bg-amber-600 hover:bg-amber-700">Allocate New Students</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
