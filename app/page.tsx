"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, UserPlus, Settings, AlertTriangle, Clock, BarChart3, FileText, Shield, Target } from "lucide-react"
import { SectionOverview } from "./components/section-overview"
import { StudentAllocation } from "./components/student-allocation"
import { SectionManagement } from "./components/section-management"
import { AuditTrail } from "./components/audit-trail"
import { CourseSetup } from "./components/course-setup"
import { CanvasApiProvider, useCanvasApi } from "./lib/canvas-api-context"

export default function CanvasSectionTool() {
  return (
    <CanvasApiProvider>
      <CanvasSectionToolContent />
    </CanvasApiProvider>
  )
}

function CanvasSectionToolContent() {
  const { courseData, isConfigured, isLoading, error } = useCanvasApi()
  const [activeTab, setActiveTab] = useState("overview")

  if (!isConfigured) {
    return <CourseSetup />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Canvas API Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    )
  }

  const daysUntilCensus = Math.ceil((courseData.censusDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-700 rounded flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Section Management Tool</h1>
                <p className="text-sm text-gray-500">
                  {courseData.courseName} (ID: {courseData.courseId})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge
                variant={daysUntilCensus > 7 ? "default" : "destructive"}
                className="bg-purple-100 text-purple-800"
              >
                <Clock className="w-3 h-3 mr-1" />
                {daysUntilCensus} days to census
              </Badge>
              <SyncButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert for new enrollments */}
        {courseData.newEnrollmentsSinceLastCheck > 0 && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>{courseData.newEnrollmentsSinceLastCheck} new enrollments</strong> detected since your last check.
              Review and allocate these students to sections.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseData.totalStudents}</div>
              <p className="text-xs text-muted-foreground">{courseData.unassignedStudents} unassigned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Facilitators</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseData.detectedOFs}</div>
              <p className="text-xs text-muted-foreground">Detected in course</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sections</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseData.toolCreatedSections}</div>
              <p className="text-xs text-muted-foreground">{courseData.recommendedSections} recommended</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Optimal Ratio</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1:25</div>
              <p className="text-xs text-muted-foreground">Students per OF</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Allocation</span>
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Sections</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Audit Trail</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SectionOverview courseData={courseData} />
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <StudentAllocation courseData={courseData} />
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <SectionManagement courseData={courseData} />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AuditTrail />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SyncButton() {
  const { syncWithCanvas, isLoading } = useCanvasApi()

  return (
    <Button onClick={syncWithCanvas} disabled={isLoading} className="bg-purple-700 hover:bg-purple-800">
      {isLoading ? "Syncing with Canvas..." : "Sync with Canvas"}
    </Button>
  )
}
