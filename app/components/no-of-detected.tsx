"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, UserPlus, Users, Shield, X, CheckCircle } from "lucide-react"
import { useCanvasApi } from "../lib/canvas-api-context"

interface NoOFDetectedProps {
  courseData: any
}

export function NoOFDetected({ courseData }: NoOFDetectedProps) {
  const { syncWithCanvas } = useCanvasApi()
  const [isPromoting, setIsPromoting] = useState(false)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const [promotionResult, setPromotionResult] = useState<string | null>(null)

  const handlePromoteSelf = async () => {
    setIsPromoting(true)
    setPromotionResult(null)

    try {
      const response = await fetch("/api/canvas/promote-to-of", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasUrl: "placeholder", // This would come from context
          apiToken: "placeholder",
          courseId: courseData.courseId,
          makeCurrentUserOF: true,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPromotionResult(result.message)
        await syncWithCanvas()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to promote self to OF:", error)
      setPromotionResult(`Error: ${error instanceof Error ? error.message : "Failed to add Teacher role"}`)
    } finally {
      setIsPromoting(false)
    }
  }

  const handlePromoteStaff = async (staffMember: any) => {
    setIsPromoting(true)
    setPromotionResult(null)

    try {
      const response = await fetch("/api/canvas/promote-to-of", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasUrl: "placeholder",
          apiToken: "placeholder",
          courseId: courseData.courseId,
          userId: staffMember.canvasUserId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPromotionResult(result.message)
        await syncWithCanvas()
        setShowPromoteDialog(false)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to promote staff to OF:", error)
      setPromotionResult(`Error: ${error instanceof Error ? error.message : "Failed to add Teacher role"}`)
    } finally {
      setIsPromoting(false)
    }
  }

  const promotableStaff = courseData.otherStaff?.filter((staff: any) => staff.canBePromotedToOF) || []

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-amber-900">
          <AlertTriangle className="w-5 h-5" />
          <span>No Online Facilitators Detected</span>
        </CardTitle>
        <CardDescription className="text-amber-800">
          This course has {courseData.totalStudents} students but no Online Facilitators (Teachers) assigned.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show promotion result */}
        {promotionResult && (
          <Alert
            className={promotionResult.includes("Error") ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
          >
            {promotionResult.includes("Error") ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={promotionResult.includes("Error") ? "text-red-800" : "text-green-800"}>
              {promotionResult}
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-amber-300 bg-amber-100">
          <Users className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>Current Course Staff:</strong>
            <div className="mt-2 space-y-1">
              {courseData.lic && (
                <div className="flex items-center justify-between">
                  <span>• {courseData.lic.name}</span>
                  <div className="flex space-x-1">
                    {courseData.lic.roles?.map((role: string) => (
                      <Badge key={role} variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                        {role}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                      LIC
                    </Badge>
                  </div>
                </div>
              )}
              {courseData.otherStaff?.map((staff: any) => (
                <div key={staff.id} className="flex items-center justify-between">
                  <span>• {staff.name}</span>
                  <div className="flex space-x-1">
                    {staff.roles?.map((role: string) => (
                      <Badge key={role} variant="outline" className="bg-gray-100 text-gray-800 text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-white p-4 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-3">Recommended Actions:</h4>
          <div className="space-y-3">
            {/* Option 1: LIC becomes OF */}
            {courseData.lic && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                <div>
                  <p className="font-medium text-blue-900">Option 1: Add Teacher Role to LIC</p>
                  <p className="text-sm text-blue-700">
                    Add Teacher role to {courseData.lic.name} (keeps existing {courseData.lic.roles?.join(", ")} role
                    {courseData.lic.roles?.length > 1 ? "s" : ""})
                  </p>
                </div>
                <Button
                  onClick={handlePromoteSelf}
                  disabled={isPromoting}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {isPromoting ? "Adding..." : "Add Teacher Role"}
                </Button>
              </div>
            )}

            {/* Option 2: Promote existing staff */}
            {promotableStaff.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                <div>
                  <p className="font-medium text-green-900">Option 2: Add Teacher Role to Staff</p>
                  <p className="text-sm text-green-700">
                    Add Teacher role to existing staff members (they keep their current roles)
                  </p>
                </div>
                <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100" size="sm">
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add Teacher Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Teacher Role to Staff</DialogTitle>
                      <DialogDescription>
                        Select a staff member to add the Teacher (Online Facilitator) role. They will keep their
                        existing roles.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      {promotableStaff.map((staff: any) => (
                        <div
                          key={staff.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-gray-600">{staff.email}</p>
                            <div className="flex space-x-1 mt-1">
                              {staff.roles?.map((role: string) => (
                                <Badge key={role} variant="outline" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => handlePromoteStaff(staff)}
                            disabled={isPromoting}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isPromoting ? "Adding..." : "Add Teacher Role"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Option 3: Manual setup */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Option 3: Manual Setup</p>
                <p className="text-sm text-gray-600">Add Teacher roles manually in Canvas, then sync this tool</p>
              </div>
              <Button variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-1" />
                Manual Setup
              </Button>
            </div>
          </div>
        </div>

        <Alert className="border-red-200 bg-red-50">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Cannot proceed with section allocation</strong> until at least one Online Facilitator is assigned.
            Students need OFs to manage their sections effectively.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
