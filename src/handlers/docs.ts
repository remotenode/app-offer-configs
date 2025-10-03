import { Env } from '../types';

export class DocsHandler {
  constructor(private env: Env) {}

  async handleDocsIndex(): Promise<Response> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Offer Configuration API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
        }
        .nav {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 3rem;
        }
        .nav-card {
            background: #f8f9fa;
            border: 2px solid transparent;
            border-radius: 10px;
            padding: 1.5rem;
            text-decoration: none;
            color: #333;
            transition: all 0.3s ease;
        }
        .nav-card:hover {
            border-color: #667eea;
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }
        .section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 10px;
        }
        .endpoint {
            background: white;
            border-radius: 8px;
            padding: 1rem;
            margin: 0.5rem 0;
            border-left: 4px solid #667eea;
        }
        .method {
            font-weight: bold;
            color: #667eea;
        }
        .code {
            background: #f1f3f4;
            padding: 1rem;
            border-radius: 5px;
            font-family: 'Monaco', 'Menlo', monospace;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 App Offer Configuration API</h1>
        <p>Mobile app configuration and notification management system</p>
        <p>Environment: ${this.env.ENVIRONMENT || 'development'}</p>
    </div>

    <div class="nav">
        <a href="/docs/swagger" class="nav-card">
            <h3>📚 Swagger UI</h3>
            <p>Interactive API documentation</p>
        </a>
        <a href="/docs/redoc" class="nav-card">
            <h3>📖 ReDoc</h3>
            <p>Clean API documentation</p>
        </a>
        <a href="/docs/openapi.json" class="nav-card">
            <h3>🔧 OpenAPI Spec</h3>
            <p>Raw API specification</p>
        </a>
    </div>

    <div class="section">
        <h2>📋 API Endpoints</h2>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <strong>/api/v1/config</strong>
            <p>Mobile app configuration endpoint. Accepts AppsFlyer conversion data and returns WebView URL.</p>
        </div>

        <div class="endpoint">
            <div class="method">POST</div>
            <strong>/api/v1/notifications/send</strong>
            <p>Send push notification to a single device.</p>
        </div>

        <div class="endpoint">
            <div class="method">POST</div>
            <strong>/api/v1/notifications/bulk</strong>
            <p>Send push notifications to multiple devices.</p>
        </div>

        <div class="endpoint">
            <div class="method">GET</div>
            <strong>/api/v1/notifications/stats</strong>
            <p>Get notification and push token statistics.</p>
        </div>

        <div class="endpoint">
            <div class="method">GET</div>
            <strong>/health</strong>
            <p>Health check endpoint.</p>
        </div>

        <div class="endpoint">
            <div class="method">GET</div>
            <strong>/health/ready</strong>
            <p>Readiness check endpoint.</p>
        </div>

        <div class="endpoint">
            <div class="method">GET</div>
            <strong>/health/live</strong>
            <p>Liveness check endpoint.</p>
        </div>
    </div>

    <div class="section">
        <h2>🔧 Configuration Request Example</h2>
        <div class="code">
POST /api/v1/config
Content-Type: application/json

{
  "af_id": "1688042316289-7152592750959506765",
  "bundle_id": "com.example.app",
  "os": "Android",
  "store_id": "com.example.app",
  "locale": "en_US",
  "push_token": "dl28EJCAT4a7UNl86egX-U:APA91bEC1a5aGJL8ZyQHlm-B9togw60MLWP4_zU0ExSXLSa_HiL82Iurj0d-1zJmkMdUcvgCRXTrXtbWQHxmJh49BibLiqZVXPNyrCdZW-_ROTt98f0WCLtt531RYPhWSDOkykcaykE3",
  "firebase_project_id": "8934278530",
  "af_status": "Non-organic",
  "campaign": "Test Campaign",
  "media_source": "Facebook Ads",
  "is_first_launch": true
}
        </div>
    </div>

    <div class="section">
        <h2>📱 Notification Request Example</h2>
        <div class="code">
POST /api/v1/notifications/send
Content-Type: application/json

{
  "token": "dl28EJCAT4a7UNl86egX-U:APA91bEC1a5aGJL8ZyQHlm-B9togw60MLWP4_zU0ExSXLSa_HiL82Iurj0d-1zJmkMdUcvgCRXTrXtbWQHxmJh49BibLiqZVXPNyrCdZW-_ROTt98f0WCLtt531RYPhWSDOkykcaykE3",
  "title": "Great offer!",
  "body": "Check out this amazing deal!",
  "image_url": "https://example.com/image.jpg",
  "icon_url": "https://example.com/icon.png",
  "data": {
    "url": "https://example.com/offer"
  }
}
        </div>
    </div>

    <div class="section">
        <h2>📚 Documentation Structure</h2>
        <p>This API follows the documented project structure:</p>
        <ul>
            <li><strong>AppsFlyer Integration:</strong> Tracks app installs and user events</li>
            <li><strong>Firebase Integration:</strong> Handles push notifications</li>
            <li><strong>Configuration API:</strong> Provides app URLs and settings</li>
            <li><strong>WebView Management:</strong> Manages mobile app content display</li>
            <li><strong>Push Token Storage:</strong> Stores and manages notification tokens</li>
        </ul>
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

  async handleSwaggerUI(): Promise<Response> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Swagger UI - App Offer Configuration API</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/docs/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
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

  async handleReDoc(): Promise<Response> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReDoc - App Offer Configuration API</title>
    <style>
        body {
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    <redoc spec-url="/docs/openapi.json"></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@2.1.3/bundles/redoc.standalone.js"></script>
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

  async handleOpenAPISpec(): Promise<Response> {
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'App Offer Configuration API',
        description: 'Mobile app configuration and notification management system',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          url: 'https://github.com/your-org/app-offer-config-worker',
        },
      },
      servers: [
        {
          url: '/',
          description: 'Current server',
        },
      ],
      paths: {
        '/api/v1/config': {
          post: {
            summary: 'Mobile App Configuration',
            description: 'Accepts AppsFlyer conversion data and returns WebView URL',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/MobileAppConfigRequest',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Successful configuration',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/MobileAppConfigResponse',
                    },
                  },
                },
              },
              '404': {
                description: 'No data available',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse',
                    },
                  },
                },
              },
            },
          },
          options: {
            summary: 'CORS preflight',
            responses: {
              '200': {
                description: 'CORS preflight response',
              },
            },
          },
        },
        '/api/v1/notifications/send': {
          post: {
            summary: 'Send Push Notification',
            description: 'Send a push notification to a single device',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/NotificationRequest',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Notification sent successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/NotificationResponse',
                    },
                  },
                },
              },
            },
          },
        },
        '/health': {
          get: {
            summary: 'Health Check',
            description: 'Check the health status of the service',
            responses: {
              '200': {
                description: 'Service is healthy',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/HealthResponse',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          MobileAppConfigRequest: {
            type: 'object',
            required: ['af_id', 'bundle_id', 'os'],
            properties: {
              af_id: {
                type: 'string',
                description: 'AppsFlyer ID',
              },
              bundle_id: {
                type: 'string',
                description: 'Bundle ID or Package Name',
              },
              os: {
                type: 'string',
                enum: ['Android', 'iOS'],
                description: 'Platform',
              },
              store_id: {
                type: 'string',
                description: 'Store ID',
              },
              locale: {
                type: 'string',
                description: 'Device locale',
              },
              push_token: {
                type: 'string',
                description: 'Firebase push token',
              },
              firebase_project_id: {
                type: 'string',
                description: 'Firebase project ID',
              },
              af_status: {
                type: 'string',
                description: 'AppsFlyer status',
              },
              campaign: {
                type: 'string',
                description: 'Campaign name',
              },
              media_source: {
                type: 'string',
                description: 'Media source',
              },
              is_first_launch: {
                type: 'boolean',
                description: 'Is first launch',
              },
            },
          },
          MobileAppConfigResponse: {
            type: 'object',
            properties: {
              ok: {
                type: 'boolean',
                description: 'Request status',
              },
              message: {
                type: 'string',
                description: 'Response message',
              },
              url: {
                type: 'string',
                description: 'URL for WebView',
              },
              expires: {
                type: 'integer',
                description: 'Expiration timestamp',
              },
            },
          },
          NotificationRequest: {
            type: 'object',
            required: ['token', 'title', 'body'],
            properties: {
              token: {
                type: 'string',
                description: 'Firebase push token',
              },
              title: {
                type: 'string',
                description: 'Notification title',
              },
              body: {
                type: 'string',
                description: 'Notification body',
              },
              image_url: {
                type: 'string',
                description: 'Image URL',
              },
              icon_url: {
                type: 'string',
                description: 'Icon URL',
              },
              data: {
                type: 'object',
                additionalProperties: {
                  type: 'string',
                },
                description: 'Additional data',
              },
            },
          },
          NotificationResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'Success status',
              },
              message: {
                type: 'string',
                description: 'Response message',
              },
              notification_id: {
                type: 'string',
                description: 'Notification ID',
              },
            },
          },
          HealthResponse: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                description: 'Health status',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Check timestamp',
              },
              environment: {
                type: 'string',
                description: 'Environment',
              },
              services: {
                type: 'object',
                properties: {
                  database: {
                    type: 'boolean',
                    description: 'Database health',
                  },
                  appsflyer: {
                    type: 'boolean',
                    description: 'AppsFlyer health',
                  },
                },
              },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              ok: {
                type: 'boolean',
                description: 'Request status',
              },
              message: {
                type: 'string',
                description: 'Error message',
              },
            },
          },
        },
      },
    };

    return new Response(JSON.stringify(openApiSpec, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
