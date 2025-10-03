import { Env } from '../types';
import { ConfigHandler } from '../handlers/config';
import { HealthHandler } from '../handlers/health';
import { DocsHandler } from '../handlers/docs';
import { NotificationHandler } from '../handlers/notifications';

export interface Route {
  path: string;
  method: string;
  handler: (request: Request, env: Env) => Promise<Response>;
}

export class Router {
  private routes: Route[] = [];
  private configHandler: ConfigHandler;
  private healthHandler: HealthHandler;
  private docsHandler: DocsHandler;
  private notificationHandler: NotificationHandler;

  constructor(env: Env) {
    this.configHandler = new ConfigHandler(env);
    this.healthHandler = new HealthHandler(env);
    this.docsHandler = new DocsHandler(env);
    this.notificationHandler = new NotificationHandler(env);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // API Routes
    this.addRoute('POST', '/api/v1/config', this.configHandler.handleConfigRequest.bind(this.configHandler));
    this.addRoute('OPTIONS', '/api/v1/config', this.configHandler.handleOptionsRequest.bind(this.configHandler));

    // Notification Routes
    this.addRoute('POST', '/api/v1/notifications/send', this.notificationHandler.sendNotification.bind(this.notificationHandler));
    this.addRoute('POST', '/api/v1/notifications/bulk', this.notificationHandler.sendBulkNotifications.bind(this.notificationHandler));
    this.addRoute('GET', '/api/v1/notifications/stats', this.notificationHandler.getNotificationStats.bind(this.notificationHandler));

    // Health Routes
    this.addRoute('GET', '/health', this.healthHandler.handleHealthCheck.bind(this.healthHandler));
    this.addRoute('GET', '/health/ready', this.healthHandler.handleReadinessCheck.bind(this.healthHandler));
    this.addRoute('GET', '/health/live', this.healthHandler.handleLivenessCheck.bind(this.healthHandler));

    // Documentation Routes
    this.addRoute('GET', '/docs', this.docsHandler.handleDocsIndex.bind(this.docsHandler));
    this.addRoute('GET', '/docs/swagger', this.docsHandler.handleSwaggerUI.bind(this.docsHandler));
    this.addRoute('GET', '/docs/redoc', this.docsHandler.handleReDoc.bind(this.docsHandler));
    this.addRoute('GET', '/docs/openapi.json', this.docsHandler.handleOpenAPISpec.bind(this.docsHandler));

    // Root Route
    this.addRoute('GET', '/', this.handleRoot.bind(this));
  }

  private addRoute(method: string, path: string, handler: (request: Request, env: Env) => Promise<Response>): void {
    this.routes.push({ method, path, handler });
  }

  async handleRequest(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Find matching route
    const route = this.routes.find(r => r.path === path && r.method === method);
    
    if (route) {
      try {
        return await route.handler(request, env);
      } catch (error) {
        return this.handleError(error);
      }
    }

    // Handle 404
    return this.handleNotFound(path);
  }

  private async handleRoot(request: Request, env: Env): Promise<Response> {
    const baseUrl = new URL(request.url).origin;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Offer Configuration API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 3rem;
            max-width: 600px;
            width: 90%;
            text-align: center;
        }
        
        .logo {
            font-size: 2.5rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            color: #666;
            font-size: 1.1rem;
            margin-bottom: 2rem;
        }
        
        .version {
            background: #f8f9fa;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            display: inline-block;
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 2rem;
        }
        
        .links {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .link-card {
            background: #f8f9fa;
            border: 2px solid transparent;
            border-radius: 15px;
            padding: 1.5rem;
            text-decoration: none;
            color: #333;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }
        
        .link-card:hover {
            border-color: #667eea;
            background: #667eea;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .link-icon {
            font-size: 2rem;
        }
        
        .link-title {
            font-weight: 600;
            font-size: 1.1rem;
        }
        
        .link-desc {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .api-info {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 1.5rem;
            margin-top: 1rem;
        }
        
        .api-title {
            font-weight: 600;
            margin-bottom: 1rem;
            color: #333;
        }
        
        .endpoint {
            background: white;
            border-radius: 8px;
            padding: 0.75rem;
            margin: 0.5rem 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9rem;
            border-left: 4px solid #667eea;
        }
        
        .environment {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #e8f5e8;
            border-radius: 20px;
            color: #2d5a2d;
            font-size: 0.9rem;
            display: inline-block;
        }
        
        @media (max-width: 600px) {
            .links {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀 App Offer Configuration API</div>
        <div class="subtitle">Configure and manage app offers with ease</div>
        
        <div class="version">Version 1.0.0</div>
        
        <div class="links">
            <a href="${baseUrl}/docs/swagger" class="link-card">
                <div class="link-icon">📚</div>
                <div class="link-title">Swagger UI</div>
                <div class="link-desc">Interactive API documentation</div>
            </a>
            
            <a href="${baseUrl}/docs/redoc" class="link-card">
                <div class="link-icon">📖</div>
                <div class="link-title">ReDoc</div>
                <div class="link-desc">Clean API documentation</div>
            </a>
        </div>
        
        <div class="api-info">
            <div class="api-title">Available Endpoints</div>
            <div class="endpoint">POST /api/v1/config - Mobile app configuration</div>
            <div class="endpoint">POST /api/v1/notifications/send - Send push notification</div>
            <div class="endpoint">POST /api/v1/notifications/bulk - Send bulk notifications</div>
            <div class="endpoint">GET /api/v1/notifications/stats - Notification statistics</div>
            <div class="endpoint">GET /health - Health check</div>
            <div class="endpoint">GET /health/ready - Readiness check</div>
            <div class="endpoint">GET /health/live - Liveness check</div>
            <div class="endpoint">GET /docs/openapi.json - OpenAPI specification</div>
        </div>
        
        <div class="environment">Environment: ${env.ENVIRONMENT || 'development'}</div>
    </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  private handleNotFound(path: string): Response {
    return new Response(JSON.stringify({
      error: 'Not found',
      message: `The requested resource ${path} was not found`,
      availableEndpoints: [
        'POST /api/v1/config',
        'POST /api/v1/notifications/send',
        'POST /api/v1/notifications/bulk',
        'GET /api/v1/notifications/stats',
        'GET /health',
        'GET /health/ready',
        'GET /health/live',
        'GET /docs',
        'GET /docs/swagger',
        'GET /docs/redoc',
        'GET /docs/openapi.json',
        'GET /',
      ],
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  private handleError(error: unknown): Response {
    console.error('Unhandled error in router:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}