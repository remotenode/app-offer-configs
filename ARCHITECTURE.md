# Scalable Architecture

## Overview

The application has been refactored into a scalable, modular architecture that follows best practices for maintainability and extensibility.

## Architecture Components

### 1. **Core Layer** (`src/core/`)

#### Router (`router.ts`)
- Centralized route management
- Clean separation of concerns
- Easy to add new routes
- Consistent error handling

#### Response Builder (`response-builder.ts`)
- Standardized API responses
- Consistent error formatting
- HTML response generation
- CORS handling

#### Middleware Manager (`middleware.ts`)
- Pluggable middleware system
- Built-in middlewares (CORS, logging, rate limiting)
- Easy to extend with custom middleware
- Request/response pipeline

#### Config Manager (`config-manager.ts`)
- Environment configuration management
- Validation and type safety
- Centralized configuration access

### 2. **Handler Layer** (`src/handlers/`)

#### Config Handler
- Business logic for configuration requests
- Request validation
- Response generation

#### Health Handler
- Health check endpoints
- System monitoring
- Status reporting

#### Docs Handler
- Documentation serving
- Markdown rendering
- Swagger/ReDoc integration

### 3. **Service Layer** (`src/services/`)

#### Config Service
- Configuration data management
- External service integration

#### AppsFlyer Service
- AppsFlyer API integration
- Event tracking

#### Firebase Service
- Firebase integration
- Push notifications

### 4. **Utility Layer** (`src/utils/`)

#### Validation
- Input validation
- Data sanitization

#### Analytics
- Event tracking
- Error logging

## Key Benefits

### 🚀 **Scalability**
- Modular architecture allows easy scaling
- Middleware system for cross-cutting concerns
- Centralized configuration management

### 🔧 **Maintainability**
- Clear separation of concerns
- Consistent code patterns
- Easy to test and debug

### 📈 **Extensibility**
- Plugin-based middleware system
- Easy to add new routes and handlers
- Configurable response formats

### 🛡️ **Reliability**
- Centralized error handling
- Consistent response formats
- Built-in validation and logging

## Usage Examples

### Adding a New Route
```typescript
// In router.ts
this.addRoute('GET', '/api/v1/new-endpoint', this.handleNewEndpoint.bind(this));
```

### Adding Custom Middleware
```typescript
// In index.ts
middlewareManager.add(customMiddleware);
```

### Using Response Builder
```typescript
// Success response
return ResponseBuilder.success(data);

// Error response
return ResponseBuilder.error('Error message', 400);

// HTML response
return ResponseBuilder.html(content, 'Page Title');
```

## File Structure

```
src/
├── core/                    # Core architecture components
│   ├── router.ts           # Centralized routing
│   ├── response-builder.ts # Response standardization
│   ├── middleware.ts       # Middleware system
│   └── config-manager.ts   # Configuration management
├── handlers/               # Request handlers
│   ├── config.ts          # Configuration endpoint
│   ├── health.ts          # Health checks
│   └── docs.ts            # Documentation
├── services/              # Business logic services
│   ├── config.ts          # Configuration service
│   ├── appsflyer.ts       # AppsFlyer integration
│   └── firebase.ts        # Firebase integration
├── utils/                 # Utility functions
│   ├── validation.ts      # Input validation
│   └── analytics.ts       # Analytics helpers
├── types/                 # TypeScript definitions
│   └── index.ts           # Main types
└── index.ts               # Main entry point
```

## Current Branch

We're currently on: `cursor/integrate-documentation-tools-and-serve-md-files-8d0b`

## Deployment Status

- ✅ **Local Development**: Working perfectly
- ✅ **Build**: Successful compilation
- ✅ **All Endpoints**: Functional
- ⏳ **Cloudflare Deployment**: Requires authentication

The application is ready for deployment and can be easily extended with new features while maintaining code quality and scalability.