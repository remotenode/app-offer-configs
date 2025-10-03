import { Env, PushToken, PushTokenResponse, AppConfig, AppConfigResponse } from '../types';

export class DatabaseService {
  constructor(private env: Env) {}

  /**
   * Initialize the database schema
   */
  async initializeDatabase(): Promise<void> {
    try {
      // Create app_configs table for storing app configuration data
      await this.env.DB.exec(`
        CREATE TABLE IF NOT EXISTS app_configs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          af_id TEXT NOT NULL UNIQUE,
          bundle_id TEXT NOT NULL,
          os TEXT NOT NULL CHECK (os IN ('Android', 'iOS')),
          store_id TEXT NOT NULL,
          locale TEXT NOT NULL,
          firebase_project_id TEXT NOT NULL,
          webview_url TEXT,
          url_expires INTEGER,
          app_mode TEXT NOT NULL DEFAULT 'fantic' CHECK (app_mode IN ('webview', 'fantic')),
          is_first_launch BOOLEAN NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for app_configs table
      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_app_config_af_id ON app_configs(af_id)
      `);

      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_app_config_bundle_id ON app_configs(bundle_id)
      `);

      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_app_config_mode ON app_configs(app_mode)
      `);

      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_app_config_first_launch ON app_configs(is_first_launch)
      `);

      // Create push_tokens table for Firebase notifications
      await this.env.DB.exec(`
        CREATE TABLE IF NOT EXISTS push_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          af_id TEXT NOT NULL,
          push_token TEXT NOT NULL UNIQUE,
          platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
          app_version TEXT,
          device_id TEXT,
          bundle_id TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT 1,
          last_used DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for push_tokens table
      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_push_af_id ON push_tokens(af_id)
      `);

      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_push_token ON push_tokens(push_token)
      `);

      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_push_platform ON push_tokens(platform)
      `);

      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_push_active ON push_tokens(is_active)
      `);

      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_push_bundle_id ON push_tokens(bundle_id)
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Store or update app configuration
   */
  async storeAppConfig(config: Omit<AppConfig, 'id' | 'created_at' | 'updated_at'>): Promise<AppConfigResponse> {
    try {
      // Check if config already exists
      const existingConfig = await this.env.DB.prepare(`
        SELECT * FROM app_configs WHERE af_id = ?
      `).bind(config.af_id).first();

      if (existingConfig) {
        // Update existing config
        const result = await this.env.DB.prepare(`
          UPDATE app_configs 
          SET bundle_id = ?, os = ?, store_id = ?, locale = ?, firebase_project_id = ?,
              webview_url = ?, url_expires = ?, app_mode = ?, is_first_launch = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE af_id = ?
        `).bind(
          config.bundle_id,
          config.os,
          config.store_id,
          config.locale,
          config.firebase_project_id,
          config.webview_url || null,
          config.url_expires || null,
          config.app_mode,
          config.is_first_launch ? 1 : 0,
          config.af_id
        ).run();

        const updatedConfig = await this.getAppConfigByAfId(config.af_id);
        return {
          success: true,
          message: 'App configuration updated successfully',
          data: updatedConfig.data,
        };
      } else {
        // Insert new config
        const result = await this.env.DB.prepare(`
          INSERT INTO app_configs (
            af_id, bundle_id, os, store_id, locale, firebase_project_id,
            webview_url, url_expires, app_mode, is_first_launch
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          config.af_id,
          config.bundle_id,
          config.os,
          config.store_id,
          config.locale,
          config.firebase_project_id,
          config.webview_url || null,
          config.url_expires || null,
          config.app_mode,
          config.is_first_launch ? 1 : 0
        ).run();

        const configId = result.meta.last_row_id as number;

        return {
          success: true,
          message: 'App configuration stored successfully',
          config_id: configId,
          data: {
            ...config,
            id: configId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      }
    } catch (error) {
      console.error('Failed to store app config:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get app configuration by AppsFlyer ID
   */
  async getAppConfigByAfId(afId: string): Promise<AppConfigResponse> {
    try {
      const result = await this.env.DB.prepare(`
        SELECT * FROM app_configs WHERE af_id = ?
      `).bind(afId).first();

      if (!result) {
        return {
          success: false,
          message: 'App configuration not found',
        };
      }

      const config = this.mapRowToAppConfig(result);

      return {
        success: true,
        data: config,
      };
    } catch (error) {
      console.error('Failed to get app config:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Update app mode (webview or fantic)
   */
  async updateAppMode(afId: string, mode: 'webview' | 'fantic'): Promise<AppConfigResponse> {
    try {
      const result = await this.env.DB.prepare(`
        UPDATE app_configs 
        SET app_mode = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE af_id = ?
      `).bind(mode, afId).run();

      if (result.meta.changes === 0) {
        return {
          success: false,
          message: 'App configuration not found or no changes made',
        };
      }

      const updatedConfig = await this.getAppConfigByAfId(afId);
      
      return {
        success: true,
        message: 'App mode updated successfully',
        data: updatedConfig.data,
      };
    } catch (error) {
      console.error('Failed to update app mode:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Update WebView URL and expiration
   */
  async updateWebViewUrl(afId: string, url: string, expires: number): Promise<AppConfigResponse> {
    try {
      const result = await this.env.DB.prepare(`
        UPDATE app_configs 
        SET webview_url = ?, url_expires = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE af_id = ?
      `).bind(url, expires, afId).run();

      if (result.meta.changes === 0) {
        return {
          success: false,
          message: 'App configuration not found or no changes made',
        };
      }

      const updatedConfig = await this.getAppConfigByAfId(afId);
      
      return {
        success: true,
        message: 'WebView URL updated successfully',
        data: updatedConfig.data,
      };
    } catch (error) {
      console.error('Failed to update WebView URL:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Store or update a push token
   */
  async storePushToken(token: Omit<PushToken, 'id' | 'created_at' | 'updated_at'>): Promise<PushTokenResponse> {
    try {
      // Check if token already exists
      const existingToken = await this.env.DB.prepare(`
        SELECT * FROM push_tokens WHERE push_token = ?
      `).bind(token.push_token).first();

      if (existingToken) {
        // Update existing token
        const result = await this.env.DB.prepare(`
          UPDATE push_tokens 
          SET af_id = ?, platform = ?, app_version = ?, device_id = ?, 
              bundle_id = ?, is_active = ?, last_used = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE push_token = ?
        `).bind(
          token.af_id,
          token.platform,
          token.app_version || null,
          token.device_id || null,
          token.bundle_id,
          token.is_active ? 1 : 0,
          token.push_token
        ).run();

        const updatedToken = await this.getPushTokenByToken(token.push_token);
        return {
          success: true,
          message: 'Push token updated successfully',
          data: updatedToken.data,
        };
      } else {
        // Insert new token
        const result = await this.env.DB.prepare(`
          INSERT INTO push_tokens (
            af_id, push_token, platform, app_version, device_id, bundle_id, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          token.af_id,
          token.push_token,
          token.platform,
          token.app_version || null,
          token.device_id || null,
          token.bundle_id,
          token.is_active ? 1 : 0
        ).run();

        const tokenId = result.meta.last_row_id as number;

        return {
          success: true,
          message: 'Push token stored successfully',
          token_id: tokenId,
          data: {
            ...token,
            id: tokenId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      }
    } catch (error) {
      console.error('Failed to store push token:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get push token by token string
   */
  async getPushTokenByToken(pushToken: string): Promise<PushTokenResponse> {
    try {
      const result = await this.env.DB.prepare(`
        SELECT * FROM push_tokens WHERE push_token = ?
      `).bind(pushToken).first();

      if (!result) {
        return {
          success: false,
          message: 'Push token not found',
        };
      }

      const token = this.mapRowToPushToken(result);

      return {
        success: true,
        data: token,
      };
    } catch (error) {
      console.error('Failed to get push token:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get push tokens by AppsFlyer ID
   */
  async getPushTokensByAfId(afId: string, activeOnly: boolean = true): Promise<PushToken[]> {
    try {
      let query = `
        SELECT * FROM push_tokens 
        WHERE af_id = ?
      `;
      
      if (activeOnly) {
        query += ` AND is_active = 1`;
      }
      
      query += ` ORDER BY created_at DESC`;

      const result = await this.env.DB.prepare(query).bind(afId).all();

      return result.results.map(row => this.mapRowToPushToken(row));
    } catch (error) {
      console.error('Failed to get push tokens by af_id:', error);
      return [];
    }
  }

  /**
   * Get push tokens by bundle ID
   */
  async getPushTokensByBundleId(bundleId: string, activeOnly: boolean = true): Promise<PushToken[]> {
    try {
      let query = `
        SELECT * FROM push_tokens 
        WHERE bundle_id = ?
      `;
      
      if (activeOnly) {
        query += ` AND is_active = 1`;
      }
      
      query += ` ORDER BY created_at DESC`;

      const result = await this.env.DB.prepare(query).bind(bundleId).all();

      return result.results.map(row => this.mapRowToPushToken(row));
    } catch (error) {
      console.error('Failed to get push tokens by bundle_id:', error);
      return [];
    }
  }

  /**
   * Update push token status
   */
  async updatePushTokenStatus(pushToken: string, isActive: boolean): Promise<PushTokenResponse> {
    try {
      const result = await this.env.DB.prepare(`
        UPDATE push_tokens 
        SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE push_token = ?
      `).bind(isActive ? 1 : 0, pushToken).run();

      if (result.meta.changes === 0) {
        return {
          success: false,
          message: 'Push token not found or no changes made',
        };
      }

      const updatedToken = await this.getPushTokenByToken(pushToken);
      
      return {
        success: true,
        message: 'Push token status updated successfully',
        data: updatedToken.data,
      };
    } catch (error) {
      console.error('Failed to update push token status:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Update push token last used timestamp
   */
  async updatePushTokenLastUsed(pushToken: string): Promise<PushTokenResponse> {
    try {
      const result = await this.env.DB.prepare(`
        UPDATE push_tokens 
        SET last_used = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
        WHERE push_token = ?
      `).bind(pushToken).run();

      if (result.meta.changes === 0) {
        return {
          success: false,
          message: 'Push token not found',
        };
      }

      const updatedToken = await this.getPushTokenByToken(pushToken);
      
      return {
        success: true,
        message: 'Push token last used updated successfully',
        data: updatedToken.data,
      };
    } catch (error) {
      console.error('Failed to update push token last used:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all active push tokens
   */
  async getActivePushTokens(): Promise<PushToken[]> {
    try {
      const result = await this.env.DB.prepare(`
        SELECT * FROM push_tokens 
        WHERE is_active = 1 
        ORDER BY created_at DESC
      `).all();

      return result.results.map(row => this.mapRowToPushToken(row));
    } catch (error) {
      console.error('Failed to get active push tokens:', error);
      return [];
    }
  }

  /**
   * Get app configuration statistics
   */
  async getAppConfigStats(): Promise<{
    total: number;
    webview_count: number;
    fantic_count: number;
    first_launch_count: number;
    recent_count: number;
  }> {
    try {
      // Total count
      const totalResult = await this.env.DB.prepare(`
        SELECT COUNT(*) as count FROM app_configs
      `).first();

      // WebView count
      const webviewResult = await this.env.DB.prepare(`
        SELECT COUNT(*) as count FROM app_configs WHERE app_mode = 'webview'
      `).first();

      // Fantic count
      const fanticResult = await this.env.DB.prepare(`
        SELECT COUNT(*) as count FROM app_configs WHERE app_mode = 'fantic'
      `).first();

      // First launch count
      const firstLaunchResult = await this.env.DB.prepare(`
        SELECT COUNT(*) as count FROM app_configs WHERE is_first_launch = 1
      `).first();

      // Recent count (last 24 hours)
      const recentResult = await this.env.DB.prepare(`
        SELECT COUNT(*) as count 
        FROM app_configs 
        WHERE created_at > datetime('now', '-1 day')
      `).first();

      return {
        total: totalResult?.count || 0,
        webview_count: webviewResult?.count || 0,
        fantic_count: fanticResult?.count || 0,
        first_launch_count: firstLaunchResult?.count || 0,
        recent_count: recentResult?.count || 0,
      };
    } catch (error) {
      console.error('Failed to get app config stats:', error);
      return {
        total: 0,
        webview_count: 0,
        fantic_count: 0,
        first_launch_count: 0,
        recent_count: 0,
      };
    }
  }

  /**
   * Get push token statistics
   */
  async getPushTokenStats(): Promise<{
    total: number;
    active: number;
    by_platform: Record<string, number>;
    recent_count: number;
  }> {
    try {
      // Total count
      const totalResult = await this.env.DB.prepare(`
        SELECT COUNT(*) as count FROM push_tokens
      `).first();

      // Active count
      const activeResult = await this.env.DB.prepare(`
        SELECT COUNT(*) as count FROM push_tokens WHERE is_active = 1
      `).first();

      // Count by platform
      const platformResult = await this.env.DB.prepare(`
        SELECT platform, COUNT(*) as count 
        FROM push_tokens 
        WHERE is_active = 1
        GROUP BY platform
      `).all();

      // Recent count (last 24 hours)
      const recentResult = await this.env.DB.prepare(`
        SELECT COUNT(*) as count 
        FROM push_tokens 
        WHERE created_at > datetime('now', '-1 day')
      `).first();

      const byPlatform: Record<string, number> = {};
      platformResult.results.forEach((row: any) => {
        byPlatform[row.platform] = row.count;
      });

      return {
        total: totalResult?.count || 0,
        active: activeResult?.count || 0,
        by_platform: byPlatform,
        recent_count: recentResult?.count || 0,
      };
    } catch (error) {
      console.error('Failed to get push token stats:', error);
      return {
        total: 0,
        active: 0,
        by_platform: {},
        recent_count: 0,
      };
    }
  }

  /**
   * Clean up old records
   */
  async cleanupOldRecords(daysOld: number = 30): Promise<number> {
    try {
      const result = await this.env.DB.prepare(`
        DELETE FROM push_tokens 
        WHERE is_active = 0 AND updated_at < datetime('now', '-${daysOld} days')
      `).run();

      return result.meta.changes || 0;
    } catch (error) {
      console.error('Failed to cleanup old records:', error);
      return 0;
    }
  }

  /**
   * Map database row to AppConfig object
   */
  private mapRowToAppConfig(row: any): AppConfig {
    return {
      id: row.id,
      af_id: row.af_id,
      bundle_id: row.bundle_id,
      os: row.os,
      store_id: row.store_id,
      locale: row.locale,
      firebase_project_id: row.firebase_project_id,
      webview_url: row.webview_url,
      url_expires: row.url_expires,
      app_mode: row.app_mode,
      is_first_launch: Boolean(row.is_first_launch),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Map database row to PushToken object
   */
  private mapRowToPushToken(row: any): PushToken {
    return {
      id: row.id,
      af_id: row.af_id,
      push_token: row.push_token,
      platform: row.platform,
      app_version: row.app_version,
      device_id: row.device_id,
      bundle_id: row.bundle_id,
      is_active: Boolean(row.is_active),
      last_used: row.last_used,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}