"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Key, Globe, AlertTriangle, CheckCircle, Users, TestTube } from "lucide-react"
import { useCanvasApi } from "../lib/canvas-api-context"

export function CourseSetup() {
  const { setupCanvas, isLoading, error } = useCanvasApi()
  const [canvasUrl, setCanvasUrl] = useState("https://acu.instructure.com")
  const [apiToken, setApiToken] = useState("")
  const [courseId, setCourseId] = useState("")
  const [validationError, setValidationError] = useState("")
  const [isDemoMode, setIsDemoMode] = useState(false)

  const handleSetup = async () => {
    setValidationError("")

    if (isDemoMode) {
      // Demo mode setup with mock data
      try {
        await setupCanvas({
          canvasUrl: "https://demo.instructure.com",
          apiToken: "demo-token",
          courseId: 12345,
        })
      } catch (err) {
        setValidationError("Demo mode setup failed")
      }
      return
    }

    // Real Canvas setup validation
    if (!canvasUrl || !apiToken || !courseId) {
      setValidationError("All fields are required")
      return
    }

    if (!canvasUrl.includes("instructure.com")) {
      setValidationError("Please enter a valid Canvas URL (should contain 'instructure.com')")
      return
    }

    if (!/^\d+$/.test(courseId)) {
      setValidationError("Course ID should be a number")
      return
    }

    try {
      await setupCanvas({
        canvasUrl: canvasUrl.replace(/\/$/, ""), // Remove trailing slash
        apiToken,
        courseId: Number.parseInt(courseId),
      })
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Setup failed")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Canvas Section Management Tool</CardTitle>
          <CardDescription>Connect to your Canvas LMS to start managing course sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Mode Toggle */}
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                id="demo-mode"
                checked={isDemoMode}
                onChange={(e) => setIsDemoMode(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="demo-mode" className="text-sm font-medium flex items-center space-x-2">
                <TestTube className="w-4 h-4" />
                <span>Use Demo Mode (for testing without Canvas)</span>
              </Label>
            </div>
            {isDemoMode && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Demo mode uses simulated data. No real Canvas operations will be performed. Perfect for testing the
                  interface!
                </AlertDescription>
              </Alert>
            )}
          </div>

          {!isDemoMode && (
            <>
              {/* Canvas URL */}
              <div className="space-y-2">
                <Label htmlFor="canvas-url" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Canvas URL</span>
                </Label>
                <Input
                  id="canvas-url"
                  type="url"
                  value={canvasUrl}
                  onChange={(e) => setCanvasUrl(e.target.value)}
                  placeholder="https://your-institution.instructure.com"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Your institution's Canvas URL (e.g., https://acu.instructure.com)
                </p>
              </div>

              {/* API Token */}
              <div className="space-y-2">
                <Label htmlFor="api-token" className="flex items-center space-x-2">
                  <Key className="w-4 h-4" />
                  <span>Canvas API Token</span>
                </Label>
                <Textarea
                  id="api-token"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Paste your Canvas API token here..."
                  className="text-sm font-mono"
                  rows={3}
                />
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 mb-2">
                    <strong>How to get your Canvas API token:</strong>
                  </p>
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Go to Canvas → Account → Settings</li>
                    <li>Scroll to "Approved Integrations"</li>
                    <li>Click "+ New Access Token"</li>
                    <li>Enter purpose: "Section Management Tool"</li>
                    <li>Copy the generated token</li>
                  </ol>
                </div>
              </div>

              {/* Course ID */}
              <div className="space-y-2">
                <Label htmlFor="course-id" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Course ID</span>
                </Label>
                <Input
                  id="course-id"
                  type="number"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  placeholder="12345"
                  className="text-sm"
                />
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-green-800 mb-2">
                    <strong>How to find your Course ID:</strong>
                  </p>
                  <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
                    <li>Go to your Canvas course</li>
                    <li>
                      Look at the URL: /courses/<strong>12345</strong>
                    </li>
                    <li>The number after "/courses/" is your Course ID</li>
                  </ol>
                </div>
              </div>
            </>
          )}

          {/* Error Display */}
          {(validationError || error) && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{validationError || error}</AlertDescription>
            </Alert>
          )}

          {/* Setup Button */}
          <Button
            onClick={handleSetup}
            disabled={isLoading}
            className="w-full bg-purple-700 hover:bg-purple-800"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{isDemoMode ? "Setting up demo..." : "Connecting to Canvas..."}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>{isDemoMode ? "Start Demo" : "Connect to Canvas"}</span>
              </div>
            )}
          </Button>

          {!isDemoMode && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Security:</strong> Your API token is processed server-side and used only to communicate with
                Canvas. This tool requires admin-level permissions to manage course sections.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
