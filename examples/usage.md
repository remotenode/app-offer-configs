# Usage Examples

## Basic Configuration Request

```javascript
// Example request to the configuration endpoint
const response = await fetch('https://your-worker.your-subdomain.workers.dev/api/v1/config', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    af_id: '1688042316289-7152592750959506765',
    bundle_id: 'com.example.app',
    os: 'Android',
    store_id: 'com.example.app',
    locale: 'en',
    push_token: 'dl28EJCAT4a7UNl86egX-U:APA91bEC1a5aGJL8ZyQHlm-B9togw60MLWP4_zU0ExSXLSa_HiL82Iurj0d-1zJmkMdUcvgCRXTrXtbWQHxmJh49BibLiqZVXPNyrCdZW-_ROTt98f0WCLtt531RYPhWSDOkykcaykE3',
    firebase_project_id: '8934278530',
    af_status: 'Non-organic',
    is_first_launch: true,
    campaign: 'Test Campaign',
    media_source: 'Facebook Ads',
    adset: 'test-adset',
    agency: 'Test Agency',
  }),
});

const result = await response.json();
console.log(result);
```

## Health Check

```javascript
// Check if the service is healthy
const healthResponse = await fetch('https://your-worker.your-subdomain.workers.dev/health');
const healthData = await healthResponse.json();
console.log('Service status:', healthData.status);
```

## Error Handling

```javascript
try {
  const response = await fetch('https://your-worker.your-subdomain.workers.dev/api/v1/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Invalid request data
      af_id: '',
      bundle_id: 'com.example.app',
      os: 'InvalidOS',
    }),
  });

  const result = await response.json();
  
  if (!result.ok) {
    console.error('Configuration request failed:', result.message);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Mobile App Integration

### Android (Kotlin)

```kotlin
// Example Android integration
class ConfigService {
    private val baseUrl = "https://your-worker.your-subdomain.workers.dev"
    
    suspend fun getConfig(appsFlyerData: Map<String, Any>): ConfigResponse? {
        return try {
            val response = httpClient.post("$baseUrl/api/v1/config") {
                contentType(ContentType.Application.Json)
                setBody(appsFlyerData)
            }
            
            if (response.status.isSuccess()) {
                response.body<ConfigResponse>()
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e("ConfigService", "Failed to get config", e)
            null
        }
    }
}
```

### iOS (Swift)

```swift
// Example iOS integration
class ConfigService {
    private let baseURL = "https://your-worker.your-subdomain.workers.dev"
    
    func getConfig(appsFlyerData: [String: Any]) async throws -> ConfigResponse? {
        guard let url = URL(string: "\(baseURL)/api/v1/config") else {
            throw ConfigError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: appsFlyerData)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            return nil
        }
        
        return try JSONDecoder().decode(ConfigResponse.self, from: data)
    }
}
```

## Testing with cURL

```bash
# Test configuration endpoint
curl -X POST https://your-worker.your-subdomain.workers.dev/api/v1/config \
  -H "Content-Type: application/json" \
  -d '{
    "af_id": "1688042316289-7152592750959506765",
    "bundle_id": "com.example.app",
    "os": "Android",
    "store_id": "com.example.app",
    "locale": "en",
    "push_token": "test-token",
    "firebase_project_id": "8934278530",
    "af_status": "Non-organic",
    "is_first_launch": true,
    "campaign": "Test Campaign",
    "media_source": "Facebook Ads"
  }'

# Test health endpoint
curl https://your-worker.your-subdomain.workers.dev/health
```

## Response Examples

### Successful Response (Non-Organic Install)

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

### Error Response (Organic Install)

```json
{
  "ok": false,
  "message": "No data"
}
```

### Error Response (Invalid Request)

```json
{
  "ok": false,
  "message": "AppsFlyer ID is required"
}
```