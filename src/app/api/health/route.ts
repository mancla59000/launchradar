import { NextResponse } from 'next/server'
import { CollectorManagerService } from '@/lib/services/collector-manager.service'
import { validateConfig } from '@/lib/config'

export async function GET() {
  try {
    // Validate configuration
    const configValid = (() => {
      try {
        validateConfig()
        return true
      } catch {
        return false
      }
    })()

    // Check services health
    let servicesHealth = null
    if (configValid) {
      try {
        const manager = new CollectorManagerService()
        servicesHealth = await manager.healthCheck()
      } catch (error) {
        console.error('Health check failed:', error)
      }
    }

    const overall = configValid && servicesHealth?.overall === 'healthy' 
      ? 'healthy' 
      : servicesHealth?.overall || 'unhealthy'

    return NextResponse.json({
      status: overall,
      timestamp: new Date().toISOString(),
      service: 'launchradar-backend',
      version: '0.1.0',
      config: {
        valid: configValid,
        missing: configValid ? [] : ['Environment variables not configured']
      },
      services: servicesHealth || {
        overall: 'unknown',
        services: {
          twitter: 'unknown',
          reddit: 'unknown', 
          database: 'unknown'
        },
        issues: ['Services health check unavailable']
      }
    })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'launchradar-backend',
      version: '0.1.0',
      error: error instanceof Error ? error.message : 'Unknown error',
      config: { valid: false },
      services: {
        overall: 'unhealthy',
        services: {
          twitter: 'unknown',
          reddit: 'unknown',
          database: 'unknown'
        },
        issues: ['Health check endpoint failed']
      }
    }, { status: 500 })
  }
}