// Environment interface for Cloudflare Workers
export interface Env {
  DB: D1Database;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  CONFIG_ENDPOINT_SECRET: string;
}

// AppsFlyer conversion data (all fields from AppsFlyer SDK)
export interface AppsFlyerConversionData {
  adset?: string;
  af_adset?: string;
  adgroup?: string;
  campaign_id?: string;
  af_status?: 'Organic' | 'Non-organic';
  agency?: string;
  af_sub3?: string | null;
  af_siteid?: string | null;
  adset_id?: string;
  is_fb?: boolean;
  is_first_launch?: boolean;
  click_time?: string;
  iscache?: boolean;
  ad_id?: string;
  af_sub1?: string;
  campaign?: string;
  is_paid?: boolean;
  af_sub4?: string;
  adgroup_id?: string;
  is_mobile_data_terms_signed?: boolean;
  af_channel?: string;
  af_sub5?: string | null;
  media_source?: string;
  install_time?: string;
  af_sub2?: string | null;
  // Additional fields that might be present
  [key: string]: any;
}

// Configuration request payload
export interface ConfigRequest {
  // AppsFlyer conversion data (all fields)
  ...AppsFlyerConversionData;
  
  // Additional required fields
  af_id: string; // AppsFlyer unique identifier
  bundle_id: string; // App bundle ID
  os: 'Android' | 'iOS'; // Platform
  store_id: string; // Store ID (bundle_id for Android, id123456 for iOS)
  locale: string; // Device locale (RFC 3066 format)
  push_token: string; // Firebase Cloud Messaging token
  firebase_project_id: string; // Firebase project number
}

// Configuration response
export interface ConfigResponse {
  ok: boolean;
  message?: string;
  url?: string; // WebView URL
  expires?: number; // Expiration timestamp
}

// Push token for Firebase notifications
export interface PushToken {
  id: number;
  af_id: string; // AppsFlyer ID (not phone number)
  push_token: string;
  platform: 'ios' | 'android' | 'web';
  app_version?: string;
  device_id?: string;
  bundle_id: string; // App bundle ID
  is_active: boolean;
  last_used?: string;
  created_at: string;
  updated_at: string;
}

// Push token response
export interface PushTokenResponse {
  success: boolean;
  message: string;
  token_id?: number;
  data?: PushToken;
}

// App configuration record
export interface AppConfig {
  id: number;
  af_id: string;
  bundle_id: string;
  os: string;
  store_id: string;
  locale: string;
  firebase_project_id: string;
  webview_url?: string;
  url_expires?: number;
  app_mode: 'webview' | 'fantic'; // Determined by config response
  is_first_launch: boolean;
  created_at: string;
  updated_at: string;
}

// App config response
export interface AppConfigResponse {
  success: boolean;
  message: string;
  config_id?: number;
  data?: AppConfig;
}