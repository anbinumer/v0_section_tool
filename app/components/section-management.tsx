"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Plus, Edit, Trash2, Users, AlertTriangle, Eye, EyeOff, Shield } from "lucide-react"

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

interface SectionManagementProps {
  courseData: CourseData
}

// Mock section data
const mockSections = [
  {
    id: 1,
    name: "Tutorial Group A",
    displayName: "Tutorial Group A",
    isVisible: true,
    of: "Dr. Sarah Johnson",
    studentCount: 24,
    ratio: "1:24",
    status: "active",
    createdBy: "tool",
    lastModified: new Date(),
  },
  {
    id: 2,
    name: "Tutorial Group B",
    displayName: "Tutorial Group B",
    isVisible: true,
    of: "Prof. Michael Chen",
    studentCount: 25,
    ratio: "1:25",
    status: "active",
    createdBy: "tool",
    lastModified: new Date(),
  },
  {
    id: 3,
    name: "Default Section",
    displayName: "Default Section",
    isVisible: true,
    of: "Multiple",
    studentCount: 26,
    ratio: "N/A",
    status: "existing",
    createdBy: "canvas",
    lastModified: new Date(),
  },
]

export function SectionManagement({ courseData }: SectionManagementProps) {
  const [sections, setSections] = useState(mockSections)
  const [isCreating, setIsCreating] = useState(false)
  const [editingSection, setEditingSection] = useState<any>(null)
  const [newSectionName, setNewSectionName] = useState("")
  const [newDisplayName, setNewDisplayName] = useState("")
  const [nameConflict, setNameConflict] = useState(false)

  const handleCreateSection = () => {
    // Simulate name validation
    const hasConflict = sections.some((s) => s.name.toLowerCase() === newSectionName.toLowerCase())
    if (hasConflict) {
      setNameConflict(true)
      return
    }

    const newSection = {
      id: sections.length + 1,
      name: newSectionName,
      displayName: newDisplayName || newSectionName,
      isVisible: true,
      of: "Unassigned",
      studentCount: 0,
      ratio: "1:0",
      status: "active",
      createdBy: "tool",
      lastModified: new Date(),
    }

    setSections([...sections, newSection])
    setNewSectionName("")
    setNewDisplayName("")
    setIsCreating(false)
    setNameConflict(false)
  }

  const toggleSectionVisibility = (sectionId: number) => {
    setSections(sections.map((s) => (s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s)))
  }

  const getRatioColor = (ratio: string) => {
    if (ratio === "N/A") return "bg-gray-100 text-gray-800"
    const count = Number.parseInt(ratio.split(":")[1])
    if (count <= 25) return "bg-green-100 text-green-800"
    if (count <= 35) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      {/* Section Management Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <span>Section Management</span>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="bg-purple-700 hover:bg-purple-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Section</DialogTitle>
                  <DialogDescription>
                    Add a new section to organize students and assign Online Facilitators
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="section-name">Section Name (Internal)</Label>
                    <Input
                      id="section-name"
                      value={newSectionName}
                      onChange={(e) => {
                        setNewSectionName(e.target.value)
                        setNameConflict(false)
                      }}
                      placeholder="e.g., Tutorial Group C"
                      className={nameConflict ? "border-red-500" : ""}
                    />
                    {nameConflict && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Section name already exists. Please choose a different name.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name (Student-Facing)</Label>
                    <Input
                      id="display-name"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="Leave blank to use section name"
                    />
                    <p className="text-xs text-muted-foreground">Optional: Different name shown to students</p>
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={handleCreateSection} disabled={!newSectionName}>
                      Create Section
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Manage course sections, assign Online Facilitators, and control student visibility
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Existing Canvas Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Existing Canvas Sections</span>
          </CardTitle>
          <CardDescription>Sections created outside this tool (read-only)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sections
              .filter((s) => s.createdBy === "canvas")
              .map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-semibold">{section.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {section.studentCount} students • Created in Canvas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-white">
                      Read-only
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">{section.studentCount} students</Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Tool-Created Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Tool-Created Sections</span>
          </CardTitle>
          <CardDescription>Sections created and managed by this tool</CardDescription>
        </CardHeader>
        <CardContent>
          {sections.filter((s) => s.createdBy === "tool").length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sections created yet</h3>
              <p className="text-gray-600 mb-4">Create your first section to start organizing students</p>
              <Button onClick={() => setIsCreating(true)} className="bg-purple-700 hover:bg-purple-800">
                <Plus className="w-4 h-4 mr-2" />
                Create First Section
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sections
                .filter((s) => s.createdBy === "tool")
                .map((section) => (
                  <Card key={section.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{section.name}</h4>
                              {section.displayName !== section.name && (
                                <Badge variant="outline" className="text-xs">
                                  Display: {section.displayName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              OF: {section.of} • {section.studentCount} students
                            </p>
                            <p className="text-xs text-gray-500">
                              Last modified: {section.lastModified.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSectionVisibility(section.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Badge className={getRatioColor(section.ratio)}>{section.ratio}</Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {!section.isVisible && (
                        <Alert className="mt-3 border-yellow-200 bg-yellow-50">
                          <EyeOff className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800">
                            This section is hidden from students
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Validation Warnings */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Section Validation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              All section names are validated against existing Canvas sections to prevent conflicts. Duplicate names
              will be automatically detected and rejected.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
