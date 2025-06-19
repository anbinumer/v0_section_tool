"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Download, User, Calendar, Activity, Shield, AlertTriangle, CheckCircle } from "lucide-react"

// Mock audit data
const mockAuditLogs = [
  {
    id: 1,
    timestamp: new Date("2024-01-15T10:30:00"),
    user: "Dr. Sarah Johnson",
    action: "Section Created",
    details: 'Created section "Tutorial Group A"',
    type: "create",
    severity: "info",
    justification: null,
  },
  {
    id: 2,
    timestamp: new Date("2024-01-15T10:32:00"),
    user: "Dr. Sarah Johnson",
    action: "Student Allocated",
    details: "Allocated 24 students to Tutorial Group A via auto-allocation",
    type: "allocation",
    severity: "info",
    justification: null,
  },
  {
    id: 3,
    timestamp: new Date("2024-01-15T14:15:00"),
    user: "Dr. Sarah Johnson",
    action: "Student Moved",
    details: "Moved Student John Smith from Tutorial Group A to Tutorial Group B",
    type: "move",
    severity: "warning",
    justification: "Student requested transfer due to scheduling conflict",
  },
  {
    id: 4,
    timestamp: new Date("2024-01-16T09:00:00"),
    user: "Dr. Sarah Johnson",
    action: "Ratio Override",
    details: "Approved 36 students for Tutorial Group C (exceeds 35 limit)",
    type: "override",
    severity: "critical",
    justification: "Emergency enrollment surge - additional OF to be assigned next week",
  },
  {
    id: 5,
    timestamp: new Date("2024-01-16T11:20:00"),
    user: "System",
    action: "Post-Census Enrollment",
    details: "New student enrollment detected after census date",
    type: "enrollment",
    severity: "warning",
    justification: null,
  },
]

export function AuditTrail() {
  const [logs, setLogs] = useState(mockAuditLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || log.type === filterType
    const matchesSeverity = filterSeverity === "all" || log.severity === filterSeverity

    return matchesSearch && matchesType && matchesSeverity
  })

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "info":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "info":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-blue-100 text-blue-800"
      case "allocation":
        return "bg-purple-100 text-purple-800"
      case "move":
        return "bg-orange-100 text-orange-800"
      case "override":
        return "bg-red-100 text-red-800"
      case "enrollment":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Audit Trail Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Audit Trail</span>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Logs</span>
            </Button>
          </CardTitle>
          <CardDescription>Complete history of all section management activities and changes</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="create">Section Created</SelectItem>
                <SelectItem value="allocation">Student Allocation</SelectItem>
                <SelectItem value="move">Student Move</SelectItem>
                <SelectItem value="override">Ratio Override</SelectItem>
                <SelectItem value="enrollment">Enrollment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Info</span>
              </div>
              <p className="text-lg font-bold text-green-900">{logs.filter((l) => l.severity === "info").length}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Warning</span>
              </div>
              <p className="text-lg font-bold text-yellow-900">{logs.filter((l) => l.severity === "warning").length}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Critical</span>
              </div>
              <p className="text-lg font-bold text-red-900">{logs.filter((l) => l.severity === "critical").length}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Total</span>
              </div>
              <p className="text-lg font-bold text-purple-900">{logs.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className={`border-l-4 ${getSeverityColor(log.severity)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(log.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{log.action}</h4>
                          <Badge variant="outline" className={getTypeColor(log.type)}>
                            {log.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{log.details}</p>
                        {log.justification && (
                          <div className="bg-gray-50 p-2 rounded text-sm">
                            <strong>Justification:</strong> {log.justification}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{log.user}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{log.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Compliance & Retention</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Data Retention</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Section data: Until course end + 1 year</li>
                <li>• Audit logs: 5 years minimum</li>
                <li>• Justification records: 7 years</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Privacy Compliance</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• FERPA compliant</li>
                <li>• Encrypted data storage</li>
                <li>• Access audit trail</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
