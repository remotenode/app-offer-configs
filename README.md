# App Offer Configuration API

A Cloudflare Worker that provides configuration management for mobile applications, including offers, tracking, and documentation endpoints.

## Features

- **API Configuration**: Get app configurations with offers, tracking settings, and UI preferences
- **Health Checks**: Comprehensive health monitoring endpoints
- **Interactive Documentation**: Swagger UI and ReDoc for API exploration
- **Markdown Documentation**: Online viewing of project documentation
- **OpenAPI Specification**: Complete API specification in OpenAPI 3.0 format

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account and Wrangler CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app-offer-configs
```

2. Install dependencies:
```bash
npm install
```

3. Install Wrangler CLI (if not already installed):
```bash
npm install -g wrangler
```

4. Authenticate with Cloudflare:
```bash
wrangler login
```

### Development

Start the development server:
```bash
npm run dev
```

The worker will be available at `http://localhost:8787`

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## API Endpoints

### Configuration
- `POST /api/v1/config` - Get app configuration
- `OPTIONS /api/v1/config` - CORS preflight

### Health Checks
- `GET /health` - Health check
- `GET /health/ready` - Readiness check  
- `GET /health/live` - Liveness check

### Documentation
- `GET /docs` - Documentation index
- `GET /docs/swagger` - Swagger UI
- `GET /docs/redoc` - ReDoc documentation
- `GET /docs/openapi.json` - OpenAPI specification
- `GET /docs/markdown` - Markdown documentation viewer

### Markdown Documentation
- `GET /docs/markdown/requirements` - App requirements
- `GET /docs/markdown/configuration` - Configuration guide
- `GET /docs/markdown/notifications` - Push notifications
- `GET /docs/markdown/user-experience` - User scenarios

## Configuration Request Example

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api/v1/config \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "com.example.app",
    "platform": "ios",
    "version": "1.0.0",
    "country": "US",
    "language": "en",
    "is_first_launch": true
  }'
```

## Environment Variables

Set these as secrets in Cloudflare Workers:

```bash
wrangler secret put APPSFLYER_API_TOKEN
wrangler secret put FIREBASE_PROJECT_ID
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put FIREBASE_CLIENT_EMAIL
```

## Documentation Features

### Swagger UI
Interactive API documentation with:
- Request/response examples
- Schema definitions
- Try-it-out functionality
- Authentication testing

### ReDoc
Clean, responsive documentation with:
- Detailed schema information
- Code examples
- Mobile-friendly design
- Search functionality

### Markdown Viewer
Browse project documentation including:
- Technical requirements
- API configuration guides
- Push notification setup
- User experience scenarios

## Development

### Project Structure

```
src/
├── handlers/          # Request handlers
│   ├── config.ts     # Configuration endpoint
│   ├── health.ts     # Health check endpoints
│   └── docs.ts       # Documentation endpoints
├── services/         # Business logic services
│   ├── config.ts     # Configuration service
│   ├── appsflyer.ts  # AppsFlyer integration
│   └── firebase.ts   # Firebase integration
├── types/            # TypeScript type definitions
│   └── index.ts      # Main types
├── utils/            # Utility functions
│   ├── validation.ts # Input validation
│   └── analytics.ts  # Analytics helpers
└── index.ts          # Main worker entry point
```

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Linting

Check code style:
```bash
npm run lint
```

Type checking:
```bash
npm run type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions and support:
- Check the documentation at `/docs`
- Review the API specification at `/docs/openapi.json`
- Open an issue in the repository