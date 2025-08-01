import { NextRequest, NextResponse } from 'next/server'
import { CollectorManagerService } from '@/lib/services/collector-manager.service'

// Global collector manager instance
let collectorManager: CollectorManagerService | null = null

function getCollectorManager(): CollectorManagerService {
  if (!collectorManager) {
    collectorManager = new CollectorManagerService()
  }
  return collectorManager
}

export async function GET() {
  try {
    const manager = getCollectorManager()
    const status = await manager.getStatus()

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('Collectors status API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to get collectors status'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, service } = await request.json()

    const manager = getCollectorManager()

    switch (action) {
      case 'start':
        if (service === 'twitter') {
          await manager.startTwitter()
        } else if (service === 'reddit') {
          await manager.startReddit()
        } else if (service === 'all') {
          await manager.startAll()
        } else {
          return NextResponse.json({
            success: false,
            error: 'Invalid service. Use "twitter", "reddit", or "all"'
          }, { status: 400 })
        }
        break

      case 'stop':
        if (service === 'twitter') {
          manager.stopTwitter()
        } else if (service === 'reddit') {
          manager.stopReddit()
        } else if (service === 'all') {
          manager.stopAll()
        } else {
          return NextResponse.json({
            success: false,
            error: 'Invalid service. Use "twitter", "reddit", or "all"'
          }, { status: 400 })
        }
        break

      case 'collect':
        const result = await manager.collectOnce()
        return NextResponse.json({
          success: true,
          message: `Collected ${result.total.posts} posts, created ${result.total.opportunities} opportunities`,
          data: result
        })

      case 'process':
        const processed = await manager.processUnprocessed()
        return NextResponse.json({
          success: true,
          message: `Processed ${processed} opportunities from unprocessed posts`,
          data: { processed }
        })

      case 'cleanup':
        const cleaned = await manager.cleanup()
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${cleaned} old posts`,
          data: { cleaned }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "start", "stop", "collect", "process", or "cleanup"'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully executed ${action} for ${service}`
    })

  } catch (error) {
    console.error('Collectors control API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to control collectors'
    }, { status: 500 })
  }
}