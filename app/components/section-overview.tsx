"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, AlertTriangle, CheckCircle, TrendingUp, Zap, Target, Info } from "lucide-react"
import { NoOFDetected } from "./no-of-detected"

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
  hasOFs: boolean
  lic?: any
  otherStaff?: any[]
  originalSections?: any[]
}

interface SectionOverviewProps {
  courseData: CourseData
}

export function SectionOverview({ courseData }: SectionOverviewProps) {
  const allocationProgress =
    courseData.toolCreatedSections > 0
      ? ((courseData.totalStudents - courseData.unassignedStudents) / courseData.totalStudents) * 100
      : 0

  // If no OFs detected, show the special component
  if (!courseData.hasOFs || courseData.detectedOFs === 0) {
    return (
      <div className="space-y-6">
        <NoOFDetected courseData={courseData} />
      </div>
    )
  }

  const optimalRatio = Math.ceil(courseData.totalStudents / courseData.detectedOFs)

  return (
    <div className="space-y-6">
      {/* Course Overview Card */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span>Course Overview</span>
          </CardTitle>
          <CardDescription>Current section allocation status and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Original Section Info */}
          {courseData.originalSections && courseData.originalSections.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Original Course Structure:</strong> This course has {courseData.originalSections.length}{" "}
                existing section(s) with all {courseData.totalStudents} students. The tool will create new sections to
                distribute students among Online Facilitators.
                <div className="mt-2 space-y-1">
                  {courseData.originalSections.map((section: any) => (
                    <div key={section.id} className="text-sm">
                      • <strong>{section.name}</strong>: {section.studentCount} students
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Students:</span>
                <span className="text-lg font-bold">{courseData.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Original Canvas Sections:</span>
                <span className="text-lg font-bold">{courseData.existingCanvasSections}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tool-Created Sections:</span>
                <span className="text-lg font-bold">{courseData.toolCreatedSections}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Students to Allocate:</span>
                <Badge variant={courseData.unassignedStudents > 0 ? "destructive" : "default"}>
                  {courseData.unassignedStudents}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Online Facilitators:</span>
                <Badge className="bg-green-100 text-green-800">{courseData.detectedOFs} detected</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Recommendation</h4>
                <p className="text-sm text-purple-800 mb-3">
                  Create <strong>{courseData.recommendedSections} sections</strong> with approximately{" "}
                  <strong>
                    {Math.ceil(courseData.unassignedStudents / courseData.recommendedSections)} students each
                  </strong>
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-green-700">Optimal 1:25 ratio maintained</span>
                </div>
              </div>

              {courseData.newEnrollmentsSinceLastCheck > 0 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>{courseData.newEnrollmentsSinceLastCheck} new enrollments</strong> since last check
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Progress Display - only show if tool sections exist */}
          {courseData.toolCreatedSections > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Allocation Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(allocationProgress)}% complete</span>
              </div>
              <Progress value={allocationProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Auto-Allocate Students</h3>
                <p className="text-sm text-muted-foreground">Automatically distribute students across new sections</p>
              </div>
            </div>
            <Button
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
              onClick={() => {
                // Switch to allocation tab and trigger auto-allocation
                const allocationTab = document.querySelector('[value="allocation"]') as HTMLElement
                if (allocationTab) {
                  allocationTab.click()
                  // Small delay to ensure tab switch completes
                  setTimeout(() => {
                    const autoAllocateBtn = document.querySelector('[data-testid="auto-allocate-btn"]') as HTMLElement
                    if (autoAllocateBtn) {
                      autoAllocateBtn.click()
                    }
                  }, 100)
                }
              }}
            >
              Proceed with Auto-Allocation
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Manual Assignment</h3>
                <p className="text-sm text-muted-foreground">Manually assign students to specific sections</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => {
                // Switch to allocation tab and enable manual mode
                const allocationTab = document.querySelector('[value="allocation"]') as HTMLElement
                if (allocationTab) {
                  allocationTab.click()
                  // Small delay to ensure tab switch completes
                  setTimeout(() => {
                    const manualBtn = document.querySelector('[data-testid="manual-mode-btn"]') as HTMLElement
                    if (manualBtn) {
                      manualBtn.click()
                    }
                  }, 100)
                }
              }}
            >
              Manual Assignment Mode
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Adjust Settings</h3>
                <p className="text-sm text-muted-foreground">Configure ratios and section preferences</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => {
                // Switch to allocation tab and open settings
                const allocationTab = document.querySelector('[value="allocation"]') as HTMLElement
                if (allocationTab) {
                  allocationTab.click()
                  // Small delay to ensure tab switch completes
                  setTimeout(() => {
                    const settingsBtn = document.querySelector('[data-testid="settings-btn"]') as HTMLElement
                    if (settingsBtn) {
                      settingsBtn.click()
                    }
                  }, 100)
                }
              }}
            >
              Adjust Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Best Practice Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Best Practice Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium text-green-900">IDEAL</p>
                <p className="text-sm text-green-700">1-25 students per OF</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <p className="font-medium text-yellow-900">ACCEPTABLE</p>
                <p className="text-sm text-yellow-700">26-35 students per OF</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <p className="font-medium text-red-900">REQUIRES JUSTIFICATION</p>
                <p className="text-sm text-red-700">36+ students per OF</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
