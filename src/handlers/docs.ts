import { Env } from '../types';
import { marked } from 'marked';

export class DocsHandler {
  constructor(private env: Env) {}

  async handleDocsIndex(): Promise<Response> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Offer Configs - Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .nav-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-decoration: none; color: #374151; transition: all 0.2s; }
        .nav-item:hover { border-color: #2563eb; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15); }
        .nav-item h3 { margin: 0 0 10px 0; color: #2563eb; }
        .nav-item p { margin: 0; color: #6b7280; }
        .endpoints { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .endpoint { margin: 10px 0; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 App Offer Configs Documentation</h1>
            <p>Complete API documentation and guides for mobile app configuration</p>
        </div>
        <div class="content">
            <div class="nav">
                <a href="/docs/swagger" class="nav-item">
                    <h3>🔍 Swagger UI</h3>
                    <p>Interactive API documentation with request/response examples</p>
                </a>
                <a href="/docs/redoc" class="nav-item">
                    <h3>📖 ReDoc</h3>
                    <p>Clean, responsive API documentation with detailed schemas</p>
                </a>
                <a href="/docs/markdown" class="nav-item">
                    <h3>📝 Markdown Docs</h3>
                    <p>Browse project documentation and guides</p>
                </a>
                <a href="/docs/openapi.json" class="nav-item">
                    <h3>🔧 OpenAPI Spec</h3>
                    <p>Raw OpenAPI 3.0 specification in JSON format</p>
                </a>
            </div>
            
            <div class="endpoints">
                <h3>Available Endpoints</h3>
                <div class="endpoint">POST /api/v1/config - Get app configuration</div>
                <div class="endpoint">GET /health - Health check</div>
                <div class="endpoint">GET /health/ready - Readiness check</div>
                <div class="endpoint">GET /health/live - Liveness check</div>
            </div>
        </div>
    </div>
</body>
</html>`;

    return new Response(html, {
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
    <title>Swagger UI - App Offer Configs API</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
        .swagger-ui .topbar { display: none; }
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
                layout: "StandaloneLayout",
                tryItOutEnabled: true,
                requestInterceptor: (request) => {
                    request.headers['Content-Type'] = 'application/json';
                    return request;
                }
            });
        };
    </script>
</body>
</html>`;

    return new Response(html, {
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
    <title>ReDoc - App Offer Configs API</title>
    <style>
        body { margin: 0; padding: 0; }
    </style>
</head>
<body>
    <redoc spec-url="/docs/openapi.json"></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@2.1.3/bundles/redoc.standalone.js"></script>
</body>
</html>`;

    return new Response(html, {
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
        description: 'API for managing mobile app configurations, offers, and tracking',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
      },
      servers: [
        {
          url: 'https://your-worker.your-subdomain.workers.dev',
          description: 'Production server',
        },
        {
          url: 'http://localhost:8787',
          description: 'Development server',
        },
      ],
      paths: {
        '/api/v1/config': {
          post: {
            summary: 'Get app configuration',
            description: 'Retrieve configuration data for a mobile app including offers, settings, and tracking parameters',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ConfigRequest',
                  },
                  examples: {
                    basic: {
                      summary: 'Basic request',
                      value: {
                        app_id: 'com.example.app',
                        platform: 'ios',
                        version: '1.0.0',
                        country: 'US',
                        language: 'en',
                      },
                    },
                    full: {
                      summary: 'Full request with tracking data',
                      value: {
                        app_id: 'com.example.app',
                        user_id: 'user123',
                        device_id: 'device456',
                        platform: 'android',
                        version: '1.0.0',
                        build: '100',
                        country: 'US',
                        language: 'en',
                        timezone: 'America/New_York',
                        utm_source: 'google',
                        utm_medium: 'cpc',
                        utm_campaign: 'summer_sale',
                        af_channel: 'organic',
                        af_campaign: 'organic_install',
                        is_first_launch: true,
                        deep_link: 'myapp://offer/123',
                        install_time: '2023-12-01T10:00:00Z',
                        session_id: 'session789',
                        device_model: 'iPhone 14',
                        os_version: '16.0',
                        app_version: '1.0.0',
                        connection_type: 'wifi',
                        battery_level: 85,
                        is_charging: false,
                        custom_parameters: {
                          test_mode: true,
                          user_segment: 'premium',
                        },
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Successful configuration response',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ConfigResponse',
                    },
                  },
                },
              },
              '400': {
                description: 'Bad request - invalid input data',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse',
                    },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
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
            summary: 'CORS preflight request',
            responses: {
              '200': {
                description: 'CORS preflight response',
                headers: {
                  'Access-Control-Allow-Origin': {
                    schema: { type: 'string' },
                  },
                  'Access-Control-Allow-Methods': {
                    schema: { type: 'string' },
                  },
                  'Access-Control-Allow-Headers': {
                    schema: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        '/health': {
          get: {
            summary: 'Health check',
            description: 'Check the health status of the API service',
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
        '/health/ready': {
          get: {
            summary: 'Readiness check',
            description: 'Check if the service is ready to accept requests',
            responses: {
              '200': {
                description: 'Service is ready',
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
        '/health/live': {
          get: {
            summary: 'Liveness check',
            description: 'Check if the service is alive and running',
            responses: {
              '200': {
                description: 'Service is alive',
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
          ConfigRequest: {
            type: 'object',
            required: ['app_id', 'platform'],
            properties: {
              app_id: { type: 'string', description: 'Unique app identifier' },
              user_id: { type: 'string', description: 'User identifier' },
              device_id: { type: 'string', description: 'Device identifier' },
              platform: { type: 'string', enum: ['ios', 'android'], description: 'Platform type' },
              version: { type: 'string', description: 'App version' },
              build: { type: 'string', description: 'Build number' },
              country: { type: 'string', description: 'Country code' },
              language: { type: 'string', description: 'Language code' },
              timezone: { type: 'string', description: 'Timezone identifier' },
              utm_source: { type: 'string', description: 'UTM source parameter' },
              utm_medium: { type: 'string', description: 'UTM medium parameter' },
              utm_campaign: { type: 'string', description: 'UTM campaign parameter' },
              utm_content: { type: 'string', description: 'UTM content parameter' },
              utm_term: { type: 'string', description: 'UTM term parameter' },
              af_channel: { type: 'string', description: 'AppsFlyer channel' },
              af_campaign: { type: 'string', description: 'AppsFlyer campaign' },
              af_adset: { type: 'string', description: 'AppsFlyer adset' },
              af_ad: { type: 'string', description: 'AppsFlyer ad' },
              af_ad_type: { type: 'string', description: 'AppsFlyer ad type' },
              af_siteid: { type: 'string', description: 'AppsFlyer site ID' },
              af_sub_siteid: { type: 'string', description: 'AppsFlyer sub site ID' },
              af_sub1: { type: 'string', description: 'AppsFlyer sub1 parameter' },
              af_sub2: { type: 'string', description: 'AppsFlyer sub2 parameter' },
              af_sub3: { type: 'string', description: 'AppsFlyer sub3 parameter' },
              af_sub4: { type: 'string', description: 'AppsFlyer sub4 parameter' },
              af_sub5: { type: 'string', description: 'AppsFlyer sub5 parameter' },
              is_first_launch: { type: 'boolean', description: 'Is this the first app launch' },
              is_retargeting: { type: 'boolean', description: 'Is this a retargeting user' },
              deep_link: { type: 'string', description: 'Deep link URL' },
              deferred_deep_link: { type: 'string', description: 'Deferred deep link URL' },
              install_time: { type: 'string', format: 'date-time', description: 'App install timestamp' },
              launch_time: { type: 'string', format: 'date-time', description: 'App launch timestamp' },
              session_id: { type: 'string', description: 'Session identifier' },
              ip_address: { type: 'string', description: 'User IP address' },
              user_agent: { type: 'string', description: 'User agent string' },
              screen_resolution: { type: 'string', description: 'Screen resolution' },
              device_model: { type: 'string', description: 'Device model' },
              os_version: { type: 'string', description: 'Operating system version' },
              app_version: { type: 'string', description: 'Application version' },
              sdk_version: { type: 'string', description: 'SDK version' },
              connection_type: { type: 'string', description: 'Network connection type' },
              carrier: { type: 'string', description: 'Mobile carrier' },
              wifi: { type: 'boolean', description: 'Is connected via WiFi' },
              battery_level: { type: 'number', minimum: 0, maximum: 100, description: 'Battery level percentage' },
              is_charging: { type: 'boolean', description: 'Is device charging' },
              is_low_power_mode: { type: 'boolean', description: 'Is low power mode enabled' },
              is_jailbroken: { type: 'boolean', description: 'Is device jailbroken' },
              is_emulator: { type: 'boolean', description: 'Is running on emulator' },
              is_debug: { type: 'boolean', description: 'Is debug build' },
              is_testflight: { type: 'boolean', description: 'Is TestFlight build' },
              is_development: { type: 'boolean', description: 'Is development build' },
              is_production: { type: 'boolean', description: 'Is production build' },
              custom_parameters: {
                type: 'object',
                additionalProperties: true,
                description: 'Custom parameters',
              },
            },
          },
          ConfigResponse: {
            type: 'object',
            properties: {
              ok: { type: 'boolean', description: 'Request success status' },
              data: {
                type: 'object',
                properties: {
                  app_config: {
                    type: 'object',
                    properties: {
                      features: { type: 'object', additionalProperties: { type: 'boolean' } },
                      settings: { type: 'object', additionalProperties: true },
                      experiments: { type: 'object', additionalProperties: true },
                      remote_config: { type: 'object', additionalProperties: true },
                    },
                  },
                  offers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        type: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        image_url: { type: 'string' },
                        action_url: { type: 'string' },
                        conditions: { type: 'object', additionalProperties: true },
                        priority: { type: 'number' },
                        valid_from: { type: 'string', format: 'date-time' },
                        valid_to: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                  notifications: {
                    type: 'object',
                    properties: {
                      enabled: { type: 'boolean' },
                      permission_requested: { type: 'boolean' },
                      custom_permission_screen: { type: 'boolean' },
                      permission_screen_config: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          message: { type: 'string' },
                          allow_button_text: { type: 'string' },
                          deny_button_text: { type: 'string' },
                          image_url: { type: 'string' },
                        },
                      },
                    },
                  },
                  tracking: {
                    type: 'object',
                    properties: {
                      appsflyer: { type: 'object', additionalProperties: true },
                      firebase: { type: 'object', additionalProperties: true },
                    },
                  },
                  ui: { type: 'object', additionalProperties: true },
                  security: { type: 'object', additionalProperties: true },
                  performance: { type: 'object', additionalProperties: true },
                },
              },
              error: { type: 'string', description: 'Error message' },
              message: { type: 'string', description: 'Response message' },
              timestamp: { type: 'string', format: 'date-time', description: 'Response timestamp' },
              request_id: { type: 'string', description: 'Request identifier' },
              version: { type: 'string', description: 'API version' },
              environment: { type: 'string', description: 'Environment name' },
            },
          },
          HealthResponse: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
              timestamp: { type: 'string', format: 'date-time' },
              version: { type: 'string' },
              environment: { type: 'string' },
              uptime: { type: 'number' },
              checks: {
                type: 'object',
                additionalProperties: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['healthy', 'unhealthy'] },
                    response_time: { type: 'number' },
                    error: { type: 'string' },
                    usage: { type: 'number' },
                    limit: { type: 'number' },
                  },
                },
              },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              ok: { type: 'boolean', default: false },
              error: { type: 'string', description: 'Error type' },
              message: { type: 'string', description: 'Error message' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    };

    return new Response(JSON.stringify(openApiSpec, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  async handleMarkdownViewer(): Promise<Response> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Documentation - App Offer Configs</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .nav-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-decoration: none; color: #374151; transition: all 0.2s; }
        .nav-item:hover { border-color: #2563eb; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15); }
        .nav-item h3 { margin: 0 0 10px 0; color: #2563eb; }
        .nav-item p { margin: 0; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 Markdown Documentation</h1>
            <p>Browse project documentation and guides</p>
        </div>
        <div class="content">
            <div class="nav">
                <a href="/docs/markdown/requirements" class="nav-item">
                    <h3>📋 App Requirements</h3>
                    <p>Technical requirements, specifications and testing procedures</p>
                </a>
                <a href="/docs/markdown/configuration" class="nav-item">
                    <h3>⚙️ Configuration & API</h3>
                    <p>API documentation, request formats and integration guides</p>
                </a>
                <a href="/docs/markdown/notifications" class="nav-item">
                    <h3>🔔 Push Notifications</h3>
                    <p>Firebase Cloud Messaging setup and notification handling</p>
                </a>
                <a href="/docs/markdown/user-experience" class="nav-item">
                    <h3>👤 User Experience</h3>
                    <p>User interaction scenarios and app flow documentation</p>
                </a>
            </div>
        </div>
    </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  async handleMarkdownFile(filePath: string): Promise<Response> {
    try {
      // In a real implementation, you would read the markdown file from storage
      // For now, we'll return a placeholder response
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filePath} - App Offer Configs</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .back-link { color: #2563eb; text-decoration: none; margin-bottom: 20px; display: inline-block; }
        .markdown-content { line-height: 1.6; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { color: #374151; }
        .markdown-content code { background: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
        .markdown-content pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📄 ${filePath}</h1>
        </div>
        <div class="content">
            <a href="/docs/markdown" class="back-link">← Back to Documentation</a>
            <div class="markdown-content">
                <p><strong>Note:</strong> This is a placeholder for the markdown file: <code>${filePath}</code></p>
                <p>In a real implementation, this would render the actual markdown content from the file.</p>
                <p>To implement this properly, you would need to:</p>
                <ul>
                    <li>Store markdown files in a KV store or R2 bucket</li>
                    <li>Use a markdown parser like <code>marked</code> to convert to HTML</li>
                    <li>Apply proper styling and syntax highlighting</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Failed to load markdown file',
        message: error instanceof Error ? error.message : 'Unknown error',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
}