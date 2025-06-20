import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId, page = 1, limit = 50, severity, action } = await request.json()

    if (!canvasUrl || !apiToken || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch discussion topics (announcements) from Canvas
    const discussionsResponse = await fetch(
      `${canvasUrl}/api/v1/courses/${courseId}/discussion_topics?only_announcements=true&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!discussionsResponse.ok) {
      throw new Error(`Failed to fetch discussions: ${discussionsResponse.status}`)
    }

    const discussions = await discussionsResponse.json()

    // Filter for audit logs (topics that start with "[Audit]")
    const auditLogs = discussions
      .filter((topic: any) => topic.title?.startsWith('[Audit]'))
      .map((topic: any) => {
        // Parse the audit log data from the title and message
        const titleMatch = topic.title.match(/\[Audit\]\s(.+?)\s-\s(.+)/)
        const actionType = titleMatch ? titleMatch[1] : 'Unknown Action'
        const timestamp = titleMatch ? new Date(titleMatch[2]) : new Date(topic.posted_at)

        // Parse message for additional details
        const message = topic.message || ''
        const detailsMatch = message.match(/<strong>Details:<\/strong>\s*(.+?)<\/p>/)
        const justificationMatch = message.match(/<strong>Justification:<\/strong>\s*(.+?)<\/p>/)
        
        // Determine severity based on action type
        let logSeverity = 'info'
        if (actionType.toLowerCase().includes('failed') || actionType.toLowerCase().includes('error')) {
          logSeverity = 'critical'
        } else if (actionType.toLowerCase().includes('moved') || actionType.toLowerCase().includes('override')) {
          logSeverity = 'warning'
        }

        return {
          id: topic.id,
          timestamp,
          user: topic.author?.display_name || 'System',
          action: actionType,
          details: detailsMatch ? detailsMatch[1].replace(/<[^>]*>/g, '') : actionType,
          type: getActionType(actionType),
          severity: logSeverity,
          justification: justificationMatch ? justificationMatch[1].replace(/<[^>]*>/g, '') : null,
          canvasTopicId: topic.id,
          rawMessage: message,
        }
      })
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply filters
    let filteredLogs = auditLogs
    
    if (severity && severity !== 'all') {
      filteredLogs = filteredLogs.filter((log: any) => log.severity === severity)
    }
    
    if (action && action !== 'all') {
      filteredLogs = filteredLogs.filter((log: any) => log.type === action)
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / limit),
      },
      summary: {
        info: auditLogs.filter((log: any) => log.severity === 'info').length,
        warning: auditLogs.filter((log: any) => log.severity === 'warning').length,
        critical: auditLogs.filter((log: any) => log.severity === 'critical').length,
      },
    })

  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}

// Helper function to categorize action types
function getActionType(actionText: string): string {
  const action = actionText.toLowerCase()
  
  if (action.includes('created') || action.includes('section')) {
    return 'create'
  } else if (action.includes('allocated') || action.includes('allocation')) {
    return 'allocation'
  } else if (action.includes('moved') || action.includes('move')) {
    return 'move'
  } else if (action.includes('override') || action.includes('promoted')) {
    return 'override'
  } else if (action.includes('enrolled') || action.includes('enrollment')) {
    return 'enrollment'
  } else {
    return 'other'
  }
}
