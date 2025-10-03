import { Env } from '../types';

export class ConfigManager {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  get environment(): string {
    return this.env.ENVIRONMENT || 'development';
  }

  get isDevelopment(): boolean {
    return this.environment === 'development';
  }

  get isProduction(): boolean {
    return this.environment === 'production';
  }

  get appsflyerToken(): string | undefined {
    return this.env.APPSFLYER_API_TOKEN;
  }

  get firebaseProjectId(): string | undefined {
    return this.env.FIREBASE_PROJECT_ID;
  }

  get firebasePrivateKey(): string | undefined {
    return this.env.FIREBASE_PRIVATE_KEY;
  }

  get firebaseClientEmail(): string | undefined {
    return this.env.FIREBASE_CLIENT_EMAIL;
  }

  validate(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (this.isProduction) {
      if (!this.appsflyerToken) missing.push('APPSFLYER_API_TOKEN');
      if (!this.firebaseProjectId) missing.push('FIREBASE_PROJECT_ID');
      if (!this.firebasePrivateKey) missing.push('FIREBASE_PRIVATE_KEY');
      if (!this.firebaseClientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  getApiConfig() {
    return {
      version: '1.0.0',
      environment: this.environment,
      timestamp: new Date().toISOString(),
    };
  }
}