"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Download, User, Calendar, Activity, Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { useCanvasApi } from "../lib/canvas-api-context"

export function AuditTrail() {
  const { getAuditLogs, isLoading } = useCanvasApi()
  const [logs, setLogs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [summary, setSummary] = useState({ info: 0, warning: 0, critical: 0 })

  // Load audit logs on component mount
  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = async () => {
    setIsLoadingLogs(true)
    try {
      const result = await getAuditLogs({
        severity: filterSeverity === 'all' ? undefined : filterSeverity,
        action: filterType === 'all' ? undefined : filterType,
      })
      
      if (result && Array.isArray(result)) {
        setLogs(result)
      } else if (result && (result as any).logs && Array.isArray((result as any).logs)) {
        setLogs((result as any).logs)
        setSummary((result as any).summary || { info: 0, warning: 0, critical: 0 })
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error)
      // Fallback to empty array if Canvas audit logs fail
      setLogs([])
    } finally {
      setIsLoadingLogs(false)
    }
  }

  // Reload logs when filters change
  useEffect(() => {
    loadAuditLogs()
  }, [filterType, filterSeverity])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
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

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Details', 'Severity', 'Justification'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user,
        log.action,
        `"${log.details.replace(/"/g, '""')}"`,
        log.severity,
        log.justification ? `"${log.justification.replace(/"/g, '""')}"` : ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
              {isLoadingLogs && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={loadAuditLogs}
                disabled={isLoadingLogs}
                className="flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportLogs}
                disabled={filteredLogs.length === 0}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Logs</span>
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Complete history of all section management activities stored in Canvas
            {logs.length > 0 && ` (${logs.length} total logs)`}
          </CardDescription>
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
                <SelectItem value="override">Override/Promotion</SelectItem>
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
              <p className="text-lg font-bold text-green-900">{summary.info}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Warning</span>
              </div>
              <p className="text-lg font-bold text-yellow-900">{summary.warning}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Critical</span>
              </div>
              <p className="text-lg font-bold text-red-900">{summary.critical}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{filteredLogs.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            {filteredLogs.length === 0 
              ? isLoadingLogs 
                ? "Loading audit logs..." 
                : "No audit logs found matching your criteria"
              : `Showing ${filteredLogs.length} log entries`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading audit logs from Canvas...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {logs.length === 0 ? (
                <div>
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No audit logs found.</p>
                  <p className="text-sm">Activity will be logged here as you use the tool.</p>
                </div>
              ) : (
                <div>
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No logs match your search criteria.</p>
                  <p className="text-sm">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-shrink-0">
                    {getSeverityIcon(log.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Badge variant="outline" className={getTypeColor(log.type)}>
                          {log.action}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{log.details}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <User className="w-3 h-3 mr-1" />
                      <span className="mr-3">By: {log.user}</span>
                      {log.justification && (
                        <span className="italic">Reason: {log.justification}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
