# App Offer Configuration Cloudflare Worker

A scalable and efficient Cloudflare Worker for handling app offer configuration requests with AppsFlyer and Firebase integration.

## Features

- **AppsFlyer Integration**: Process conversion data and determine organic vs non-organic installs
- **Firebase Integration**: Handle push notification registration and configuration
- **Request Validation**: Comprehensive input validation using Zod schemas
- **Health Monitoring**: Built-in health checks and monitoring endpoints
- **Error Handling**: Robust error handling with detailed logging
- **CORS Support**: Full CORS support for web applications
- **TypeScript**: Fully typed with TypeScript for better development experience

## API Endpoints

### Configuration Request
```
POST /api/v1/config
Content-Type: application/json
```

**Request Body:**
```json
{
  "af_id": "1688042316289-7152592750959506765",
  "bundle_id": "com.example.app",
  "os": "Android",
  "store_id": "com.example.app",
  "locale": "en",
  "push_token": "dl28EJCAT4a7UNl86egX-U:APA91bEC1a5aGJL8ZyQHlm-B9togw60MLWP4_zU0ExSXLSa_HiL82Iurj0d-1zJmkMdUcvgCRXTrXtbWQHxmJh49BibLiqZVXPNyrCdZW-_ROTt98f0WCLtt531RYPhWSDOkykcaykE3",
  "firebase_project_id": "8934278530",
  "af_status": "Non-organic",
  "is_first_launch": true,
  "campaign": "Test Campaign",
  "media_source": "Facebook Ads"
}
```

**Response:**
```json
{
  "ok": true,
  "url": "https://test-web.syndi-test.net/?af_id=1688042316289-7152592750959506765&bundle_id=com.example.app&os=Android&locale=en&campaign=Test%20Campaign&media_source=Facebook%20Ads&quality_score=85&timestamp=1703123456789",
  "expires": 1703209856,
  "config": {
    "url": "https://test-web.syndi-test.net/?af_id=1688042316289-7152592750959506765&bundle_id=com.example.app&os=Android&locale=en&campaign=Test%20Campaign&media_source=Facebook%20Ads&quality_score=85&timestamp=1703123456789",
    "expires": 1703209856,
    "showWebView": true,
    "notificationSettings": {
      "enabled": true,
      "customIcon": "notification_icon",
      "imageSupport": true
    },
    "appSettings": {
      "allowRotation": true,
      "safeAreaSupport": true,
      "javascriptEnabled": true,
      "cookieSupport": true,
      "sessionSupport": true,
      "autoplayVideo": true,
      "protectedContent": true,
      "fileUpload": true
    }
  }
}
```

### Health Check
```
GET /health
```

### Readiness Check
```
GET /health/ready
```

### Liveness Check
```
GET /health/live
```

## Setup

### Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Set secrets in Cloudflare Workers
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
wrangler secret put APPSFLYER_API_TOKEN
wrangler secret put ADMIN_API_KEY
```

3. Update `wrangler.toml` with your Cloudflare account ID and zone ID.

### Development

Start local development server:
```bash
npm run dev
```

### Deployment

Deploy to different environments:

```bash
# Development
npm run deploy

# Staging
npm run deploy:staging

# Production
npm run deploy:production
```

## Configuration

### Environment Variables

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token for analytics
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Firebase service account JSON key
- `APPSFLYER_API_TOKEN`: AppsFlyer API token
- `ADMIN_API_KEY`: Admin API key for protected endpoints
- `ENVIRONMENT`: Environment name (development/staging/production)

### App Configuration

To add support for new apps, update the `getBaseUrlForApp` method in `src/services/config.ts`:

```typescript
private getBaseUrlForApp(bundleId: string): string {
  const appUrls: Record<string, string> = {
    'com.example.app': 'https://test-web.syndi-test.net/',
    'com.yournewapp.app': 'https://your-offer-url.com/',
  };

  return appUrls[bundleId] || 'https://test-web.syndi-test.net/';
}
```

## Business Logic

### Non-Organic Install Detection

The worker determines if an install is non-organic based on:

1. `af_status === 'Non-organic'`
2. `is_first_launch === true` (for non-organic)
3. `is_paid === true`
4. Media source indicates paid advertising

### Offer URL Generation

Offer URLs are generated with:
- Base URL for the app
- AppsFlyer parameters
- Campaign information
- Quality score
- Timestamp

### Notification Settings

Notification settings are determined by:
- Platform (Android/iOS)
- App configuration
- Firebase project setup

## Monitoring

The worker includes comprehensive logging and monitoring:

- Request/response logging
- Performance metrics
- Error tracking
- Health checks

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License