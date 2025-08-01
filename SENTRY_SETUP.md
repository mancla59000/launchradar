# Sentry Error Tracking Setup for LaunchRadar

## Current Status ✅
- **Sentry SDK** installed and configured
- **Configuration files** created (client, server, edge)
- **Next.js integration** configured with withSentryConfig
- **Environment variables** prepared for production
- **Error filtering** configured to exclude development errors

## To Complete Sentry Setup

### 1. Create Sentry Project
1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project for "Next.js"
3. Copy the DSN provided

### 2. Update Environment Variables
Replace placeholders in production environment:

```bash
# In .env.production and start-standalone.sh
SENTRY_DSN=https://your-actual-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-actual-dsn@sentry.io/project-id
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=launchradar
SENTRY_AUTH_TOKEN=your-auth-token-for-uploads
```

### 3. Test Error Tracking
Create a test error:
```javascript
// In any component or API route
throw new Error('Test Sentry integration')
```

### 4. Source Maps (Optional)
For better error debugging, configure source map uploads:
- Generate a Sentry auth token with project permissions
- Add token to environment variables
- Source maps will be uploaded during build

## Features Configured

### Error Filtering
- Development errors are filtered out
- Sensitive data (variables) removed from stack traces
- Privacy-focused configuration

### Performance Monitoring
- Transaction sampling enabled
- Custom performance metrics can be added

### Session Replay (Client-side)
- Configured with privacy settings
- Records user sessions for debugging
- Masked sensitive content

## Monitoring Endpoints

### Health Check Integration
The existing `/api/health` endpoint can be extended to include Sentry health:

```javascript
import * as Sentry from '@sentry/nextjs'

// Add to health check
const sentryHealth = Sentry.getCurrentHub().getClient() ? 'healthy' : 'unhealthy'
```

### Error Boundaries
Sentry automatically catches React errors and sends them to the dashboard.

## Production Benefits

1. **Real-time Error Monitoring**: Get notified immediately when errors occur
2. **Performance Insights**: Track API response times and page load speeds
3. **User Context**: See which users are affected by issues
4. **Release Tracking**: Monitor error rates across deployments
5. **Custom Alerts**: Set up notifications for critical errors

## Configuration Files Created

- `sentry.client.config.ts` - Browser-side error tracking
- `sentry.server.config.ts` - Server-side error tracking  
- `sentry.edge.config.ts` - Edge runtime error tracking
- `next.config.js` - Updated with Sentry webpack plugin

## Ready for Production 🚀

Once DSN is configured, Sentry will automatically:
- Capture unhandled errors
- Track performance metrics
- Record user sessions (when errors occur)
- Provide detailed error reports with context