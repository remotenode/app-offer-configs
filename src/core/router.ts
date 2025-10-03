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
    
    // Get system statistics
    const dbService = new DatabaseService(env);
    const stats = await dbService.getMobilePhoneRequestStats();
    const pushStats = await dbService.getPushTokenStats();
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Offer Configuration API - Mobile App Management Platform</title>
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
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            text-align: center;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 3rem 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .logo {
            font-size: 3rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
        }
        
        .subtitle {
            color: #666;
            font-size: 1.3rem;
            margin-bottom: 1rem;
            font-weight: 300;
        }
        
        .description {
            color: #555;
            font-size: 1.1rem;
            max-width: 800px;
            margin: 0 auto 2rem;
        }
        
        .version {
            background: #f8f9fa;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            display: inline-block;
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 1rem;
        }
        
        .environment {
            padding: 0.5rem 1rem;
            background: #e8f5e8;
            border-radius: 20px;
            color: #2d5a2d;
            font-size: 0.9rem;
            display: inline-block;
            margin-left: 1rem;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .card-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .card-content {
            color: #666;
        }
        
        .links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
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
            text-align: center;
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
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .stat-item {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1rem;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #667eea;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #666;
            margin-top: 0.5rem;
        }
        
        .endpoint {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 0.75rem;
            margin: 0.5rem 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9rem;
            border-left: 4px solid #667eea;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .method {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-right: 1rem;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .feature {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .feature-icon {
            font-size: 1.5rem;
        }
        
        .feature-text {
            font-size: 0.9rem;
            color: #666;
        }
        
        .code-block {
            background: #f1f3f4;
            border-radius: 8px;
            padding: 1rem;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            margin: 1rem 0;
        }
        
        .badge {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .header {
                padding: 2rem 1rem;
            }
            
            .logo {
                font-size: 2rem;
            }
            
            .grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                🚀 App Offer Configuration API
            </div>
            <div class="subtitle">Mobile App Management Platform</div>
            <div class="description">
                A comprehensive system for managing mobile app configurations, push notifications, and user tracking. 
                Integrates with AppsFlyer for attribution and Firebase for notifications.
            </div>
            <div>
                <span class="version">Version 1.0.0</span>
                <span class="environment">Environment: ${env.ENVIRONMENT || 'development'}</span>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <div class="card-title">
                    📚 Documentation
                </div>
                <div class="card-content">
                    <div class="links">
                        <a href="${baseUrl}/docs/swagger" class="link-card">
                            <div class="link-icon">📖</div>
                            <div class="link-title">Swagger UI</div>
                            <div class="link-desc">Interactive API docs</div>
                        </a>
                        <a href="${baseUrl}/docs/redoc" class="link-card">
                            <div class="link-icon">📋</div>
                            <div class="link-title">ReDoc</div>
                            <div class="link-desc">Clean documentation</div>
                        </a>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">
                    📊 System Statistics
                </div>
                <div class="card-content">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">${stats.total}</div>
                            <div class="stat-label">Total Requests</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${pushStats.active}</div>
                            <div class="stat-label">Active Tokens</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${stats.recent_count}</div>
                            <div class="stat-label">Recent (24h)</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${Object.keys(pushStats.by_platform).length}</div>
                            <div class="stat-label">Platforms</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <div class="card-title">
                    🔧 API Endpoints
                </div>
                <div class="card-content">
                    <div class="endpoint">
                        <span><span class="method">POST</span>/api/v1/config</span>
                        <span>Mobile app configuration</span>
                    </div>
                    <div class="endpoint">
                        <span><span class="method">POST</span>/api/v1/notifications/send</span>
                        <span>Send push notification</span>
                    </div>
                    <div class="endpoint">
                        <span><span class="method">POST</span>/api/v1/notifications/bulk</span>
                        <span>Send bulk notifications</span>
                    </div>
                    <div class="endpoint">
                        <span><span class="method">GET</span>/api/v1/notifications/stats</span>
                        <span>Notification statistics</span>
                    </div>
                    <div class="endpoint">
                        <span><span class="method">GET</span>/health</span>
                        <span>Health check</span>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">
                    ⚡ Key Features
                </div>
                <div class="card-content">
                    <div class="features">
                        <div class="feature">
                            <div class="feature-icon">📱</div>
                            <div class="feature-text">Mobile App Configuration</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">🔔</div>
                            <div class="feature-text">Push Notifications</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">📊</div>
                            <div class="feature-text">AppsFlyer Integration</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">🔥</div>
                            <div class="feature-text">Firebase Integration</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">🗄️</div>
                            <div class="feature-text">D1 Database Storage</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">🌐</div>
                            <div class="feature-text">WebView Management</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">
                🚀 Quick Start Example
            </div>
            <div class="card-content">
                <p>Send a mobile app configuration request:</p>
                <div class="code-block">
curl -X POST ${baseUrl}/api/v1/config \\
  -H "Content-Type: application/json" \\
  -d '{
    "af_id": "1688042316289-7152592750959506765",
    "bundle_id": "com.example.app",
    "os": "Android",
    "store_id": "com.example.app",
    "locale": "en_US",
    "push_token": "your_firebase_token",
    "af_status": "Non-organic",
    "campaign": "Test Campaign",
    "is_first_launch": true
  }'
                </div>
                <p>Send a push notification:</p>
                <div class="code-block">
curl -X POST ${baseUrl}/api/v1/notifications/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "your_firebase_token",
    "title": "Great offer!",
    "body": "Check out this amazing deal!",
    "data": {"url": "https://example.com/offer"}
  }'
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">
                📈 Request Statistics
            </div>
            <div class="card-content">
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${stats.by_type['offer_config'] || 0}</div>
                        <div class="stat-label">Offer Configs</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${stats.by_type['notification'] || 0}</div>
                        <div class="stat-label">Notifications</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${stats.by_status['processed'] || 0}</div>
                        <div class="stat-label">Processed</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${stats.by_status['pending'] || 0}</div>
                        <div class="stat-label">Pending</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">
                🔗 Platform Distribution
            </div>
            <div class="card-content">
                <div class="stats-grid">
                    ${Object.entries(pushStats.by_platform).map(([platform, count]) => `
                        <div class="stat-item">
                            <div class="stat-number">${count}</div>
                            <div class="stat-label">${platform.toUpperCase()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
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
