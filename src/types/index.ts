export interface Env {
  ENVIRONMENT?: string;
  APPSFLYER_API_TOKEN?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_PRIVATE_KEY?: string;
  FIREBASE_CLIENT_EMAIL?: string;
}

export interface ConfigRequest {
  app_id: string;
  user_id?: string;
  device_id?: string;
  platform: 'ios' | 'android';
  version?: string;
  build?: string;
  country?: string;
  language?: string;
  timezone?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  af_channel?: string;
  af_campaign?: string;
  af_adset?: string;
  af_ad?: string;
  af_ad_type?: string;
  af_siteid?: string;
  af_sub_siteid?: string;
  af_sub1?: string;
  af_sub2?: string;
  af_sub3?: string;
  af_sub4?: string;
  af_sub5?: string;
  is_first_launch?: boolean;
  is_retargeting?: boolean;
  deep_link?: string;
  deferred_deep_link?: string;
  install_time?: string;
  launch_time?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  screen_resolution?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
  sdk_version?: string;
  connection_type?: string;
  carrier?: string;
  wifi?: boolean;
  battery_level?: number;
  is_charging?: boolean;
  is_low_power_mode?: boolean;
  is_jailbroken?: boolean;
  is_emulator?: boolean;
  is_debug?: boolean;
  is_testflight?: boolean;
  is_development?: boolean;
  is_production?: boolean;
  custom_parameters?: Record<string, any>;
}

export interface ConfigResponse {
  ok: boolean;
  data?: {
    app_config: {
      features: Record<string, boolean>;
      settings: Record<string, any>;
      experiments: Record<string, any>;
      remote_config: Record<string, any>;
    };
    offers: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      image_url?: string;
      action_url: string;
      conditions: Record<string, any>;
      priority: number;
      valid_from: string;
      valid_to: string;
    }>;
    notifications: {
      enabled: boolean;
      permission_requested: boolean;
      custom_permission_screen: boolean;
      permission_screen_config: {
        title: string;
        message: string;
        allow_button_text: string;
        deny_button_text: string;
        image_url?: string;
      };
    };
        tracking?: {
          appsflyer?: Record<string, any>;
          firebase?: Record<string, any>;
        };
        ui?: Record<string, any>;
        security?: Record<string, any>;
        performance?: Record<string, any>;
  };
  error?: string;
  message?: string;
  timestamp: string;
  request_id: string;
  version: string;
  environment: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database?: {
      status: 'healthy' | 'unhealthy';
      response_time?: number;
      error?: string;
    };
    external_apis?: {
      status: 'healthy' | 'unhealthy';
      response_time?: number;
      error?: string;
    };
    memory?: {
      status: 'healthy' | 'unhealthy';
      usage: number;
      limit: number;
    };
    cpu?: {
      status: 'healthy' | 'unhealthy';
      usage: number;
    };
  };
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}