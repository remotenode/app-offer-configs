import { Env } from '../types';
import { ConfigHandler } from '../handlers/config';
import { HealthHandler } from '../handlers/health';
import { DocsHandler } from '../handlers/docs';

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

  constructor(env: Env) {
    this.configHandler = new ConfigHandler(env);
    this.healthHandler = new HealthHandler(env);
    this.docsHandler = new DocsHandler(env);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // API Routes
    this.addRoute('POST', '/api/v1/config', this.configHandler.handleConfigRequest.bind(this.configHandler));
    this.addRoute('OPTIONS', '/api/v1/config', this.configHandler.handleOptionsRequest.bind(this.configHandler));

    // Health Routes
    this.addRoute('GET', '/health', this.healthHandler.handleHealthCheck.bind(this.healthHandler));
    this.addRoute('GET', '/health/ready', this.healthHandler.handleReadinessCheck.bind(this.healthHandler));
    this.addRoute('GET', '/health/live', this.healthHandler.handleLivenessCheck.bind(this.healthHandler));

    // Documentation Routes
    this.addRoute('GET', '/docs', this.docsHandler.handleDocsIndex.bind(this.docsHandler));
    this.addRoute('GET', '/docs/swagger', this.docsHandler.handleSwaggerUI.bind(this.docsHandler));
    this.addRoute('GET', '/docs/redoc', this.docsHandler.handleReDoc.bind(this.docsHandler));
    this.addRoute('GET', '/docs/openapi.json', this.docsHandler.handleOpenAPISpec.bind(this.docsHandler));
    this.addRoute('GET', '/docs/markdown', this.docsHandler.handleMarkdownViewer.bind(this.docsHandler));
    this.addRoute('GET', '/docs/markdown/', this.docsHandler.handleMarkdownViewer.bind(this.docsHandler));
    this.addRoute('GET', '/docs/markdown/requirements', () => this.docsHandler.handleMarkdownFile('requirements/app-requirements.md'));
    this.addRoute('GET', '/docs/markdown/configuration', () => this.docsHandler.handleMarkdownFile('configuration/config-request.md'));
    this.addRoute('GET', '/docs/markdown/notifications', () => this.docsHandler.handleMarkdownFile('notifications/push-notifications.md'));
    this.addRoute('GET', '/docs/markdown/user-experience', () => this.docsHandler.handleMarkdownFile('user-experience/user-scenarios.md'));

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
    return new Response(JSON.stringify({
      name: 'App Offer Configuration API',
      version: '1.0.0',
      environment: env.ENVIRONMENT || 'development',
      endpoints: {
        config: 'POST /api/v1/config',
        health: 'GET /health',
        readiness: 'GET /health/ready',
        liveness: 'GET /health/live',
        docs: 'GET /docs',
        swagger: 'GET /docs/swagger',
        redoc: 'GET /docs/redoc',
        openapi: 'GET /docs/openapi.json',
        markdown: 'GET /docs/markdown',
      },
      documentation: 'https://github.com/your-org/app-offer-config-worker',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
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
        'GET /health',
        'GET /health/ready',
        'GET /health/live',
        'GET /docs',
        'GET /docs/swagger',
        'GET /docs/redoc',
        'GET /docs/openapi.json',
        'GET /docs/markdown',
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