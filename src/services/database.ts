import { Env, MobilePhoneRequest, MobilePhoneRequestResponse, PushToken, PushTokenResponse } from '../types';

export class DatabaseService {
  constructor(private env: Env) {}

  /**
   * Initialize the database schema
   */
  async initializeDatabase(): Promise<void> {
    try {
      // Create mobile_phone_requests table
      await this.env.DB.exec(`
        CREATE TABLE IF NOT EXISTS mobile_phone_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone_number TEXT NOT NULL,
          country_code TEXT NOT NULL,
          request_type TEXT NOT NULL CHECK (request_type IN ('offer_config', 'notification', 'support', 'other')),
          user_agent TEXT,
          ip_address TEXT,
          timestamp TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
          metadata TEXT, -- JSON string
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create index for faster queries
      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_phone_number ON mobile_phone_requests(phone_number)
      `);

      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_request_type ON mobile_phone_requests(request_type)
      `);

      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_status ON mobile_phone_requests(status)
      `);

      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_timestamp ON mobile_phone_requests(timestamp)
      `);

      // Create push_tokens table
      await this.env.DB.exec(`
        CREATE TABLE IF NOT EXISTS push_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone_number TEXT NOT NULL,
          push_token TEXT NOT NULL UNIQUE,
          platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
          app_version TEXT,
          device_id TEXT,
          is_active BOOLEAN NOT NULL DEFAULT 1,
          last_used DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for push_tokens table
      await this.env.DB.exec(`
        CREATE INDEX IF NOT EXISTS idx_push_phone_number ON push_tokens(phone_number)
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
        CREATE INDEX IF NOT EXISTS idx_push_phone_active ON push_tokens(phone_number, is_active)
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Store a mobile phone request
   */
  async storeMobilePhoneRequest(request: Omit<MobilePhoneRequest, 'id' | 'created_at' | 'updated_at'>): Promise<MobilePhoneRequestResponse> {
    try {
      const metadataJson = request.metadata ? JSON.stringify(request.metadata) : null;

      const result = await this.env.DB.prepare(`
        INSERT INTO mobile_phone_requests (
          phone_number,
          country_code,
          request_type,
          user_agent,
          ip_address,
          timestamp,
          status,
          metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        request.phone_number,
        request.country_code,
        request.request_type,
        request.user_agent || null,
        request.ip_address || null,
        request.timestamp,
        request.status,
        metadataJson
      ).run();

      const requestId = result.meta.last_row_id as number;

      return {
        success: true,
        message: 'Mobile phone request stored successfully',
        request_id: requestId,
        data: {
          ...request,
          id: requestId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Failed to store mobile phone request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get a mobile phone request by ID
   */
  async getMobilePhoneRequest(id: number): Promise<MobilePhoneRequestResponse> {
    try {
      const result = await this.env.DB.prepare(`
        SELECT * FROM mobile_phone_requests WHERE id = ?
      `).bind(id).first();

      if (!result) {
        return {
          success: false,
          message: 'Mobile phone request not found',
        };
      }

      const request = this.mapRowToMobilePhoneRequest(result);

      return {
        success: true,
        data: request,
      };
    } catch (error) {
      console.error('Failed to get mobile phone request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get mobile phone requests by phone number
   */
  async getMobilePhoneRequestsByPhone(phoneNumber: string, limit: number = 10): Promise<MobilePhoneRequest[]> {
    try {
      const result = await this.env.DB.prepare(`
        SELECT * FROM mobile_phone_requests 
        WHERE phone_number = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `).bind(phoneNumber, limit).all();

      return result.results.map(row => this.mapRowToMobilePhoneRequest(row));
    } catch (error) {
      console.error('Failed to get mobile phone requests by phone:', error);
      return [];
    }
  }

  /**
   * Get mobile phone requests by request type
   */
  async getMobilePhoneRequestsByType(requestType: string, limit: number = 50): Promise<MobilePhoneRequest[]> {
    try {
      const result = await this.env.DB.prepare(`
        SELECT * FROM mobile_phone_requests 
        WHERE request_type = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `).bind(requestType, limit).all();

      return result.results.map(row => this.mapRowToMobilePhoneRequest(row));
    } catch (error) {
      console.error('Failed to get mobile phone requests by type:', error);
      return [];
    }
  }

  /**
   * Get mobile phone requests by status
   */
  async getMobilePhoneRequestsByStatus(status: string, limit: number = 50): Promise<MobilePhoneRequest[]> {
    try {
      const result = await this.env.DB.prepare(`
        SELECT * FROM mobile_phone_requests 
        WHERE status = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `).bind(status, limit).all();

      return result.results.map(row => this.mapRowToMobilePhoneRequest(row));
    } catch (error) {
      console.error('Failed to get mobile phone requests by status:', error);
      return [];
    }
  }

  /**
   * Update mobile phone request status
   */
  async updateMobilePhoneRequestStatus(id: number, status: 'pending' | 'processed' | 'failed'): Promise<MobilePhoneRequestResponse> {
    try {
      const result = await this.env.DB.prepare(`
        UPDATE mobile_phone_requests 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(status, id).run();

      if (result.meta.changes === 0) {
        return {
          success: false,
          message: 'Mobile phone request not found or no changes made',
        };
      }

      // Get the updated request
      const updatedRequest = await this.getMobilePhoneRequest(id);
      
      return {
        success: true,
        message: 'Mobile phone request status updated successfully',
        data: updatedRequest.data,
      };
    } catch (error) {
      console.error('Failed to update mobile phone request status:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get recent mobile phone requests
   */
  async getRecentMobilePhoneRequests(limit: number = 20): Promise<MobilePhoneRequest[]> {
    try {
      const result = await this.env.DB.prepare(`
        SELECT * FROM mobile_phone_requests 
        ORDER BY created_at DESC 
        LIMIT ?
      `).bind(limit).all();

      return result.results.map(row => this.mapRowToMobilePhoneRequest(row));
    } catch (error) {
      console.error('Failed to get recent mobile phone requests:', error);
      return [];
    }
  }

  /**
   * Get mobile phone request statistics
   */
  async getMobilePhoneRequestStats(): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    recent_count: number;
  }> {
    try {
      // Total count
      const totalResult = await this.env.DB.prepare(`
        SELECT COUNT(*) as count FROM mobile_phone_requests
      `).first();

      // Count by type
      const typeResult = await this.env.DB.prepare(`
        SELECT request_type, COUNT(*) as count 
        FROM mobile_phone_requests 
        GROUP BY request_type
      `).all();

      // Count by status
      const statusResult = await this.env.DB.prepare(`
        SELECT status, COUNT(*) as count 
        FROM mobile_phone_requests 
        GROUP BY status
      `).all();

      // Recent count (last 24 hours)
      const recentResult = await this.env.DB.prepare(`
        SELECT COUNT(*) as count 
        FROM mobile_phone_requests 
        WHERE created_at > datetime('now', '-1 day')
      `).first();

      const byType: Record<string, number> = {};
      typeResult.results.forEach((row: any) => {
        byType[row.request_type] = row.count;
      });

      const byStatus: Record<string, number> = {};
      statusResult.results.forEach((row: any) => {
        byStatus[row.status] = row.count;
      });

      return {
        total: totalResult?.count || 0,
        by_type: byType,
        by_status: byStatus,
        recent_count: recentResult?.count || 0,
      };
    } catch (error) {
      console.error('Failed to get mobile phone request stats:', error);
      return {
        total: 0,
        by_type: {},
        by_status: {},
        recent_count: 0,
      };
    }
  }

  /**
   * Delete old mobile phone requests (cleanup)
   */
  async deleteOldMobilePhoneRequests(daysOld: number = 30): Promise<number> {
    try {
      const result = await this.env.DB.prepare(`
        DELETE FROM mobile_phone_requests 
        WHERE created_at < datetime('now', '-${daysOld} days')
      `).run();

      return result.meta.changes || 0;
    } catch (error) {
      console.error('Failed to delete old mobile phone requests:', error);
      return 0;
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
          SET phone_number = ?, platform = ?, app_version = ?, device_id = ?, 
              is_active = ?, last_used = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE push_token = ?
        `).bind(
          token.phone_number,
          token.platform,
          token.app_version || null,
          token.device_id || null,
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
            phone_number, push_token, platform, app_version, device_id, is_active
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          token.phone_number,
          token.push_token,
          token.platform,
          token.app_version || null,
          token.device_id || null,
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
   * Get push tokens by phone number
   */
  async getPushTokensByPhone(phoneNumber: string, activeOnly: boolean = true): Promise<PushToken[]> {
    try {
      let query = `
        SELECT * FROM push_tokens 
        WHERE phone_number = ?
      `;
      
      if (activeOnly) {
        query += ` AND is_active = 1`;
      }
      
      query += ` ORDER BY created_at DESC`;

      const result = await this.env.DB.prepare(query).bind(phoneNumber).all();

      return result.results.map(row => this.mapRowToPushToken(row));
    } catch (error) {
      console.error('Failed to get push tokens by phone:', error);
      return [];
    }
  }

  /**
   * Get push tokens by platform
   */
  async getPushTokensByPlatform(platform: 'ios' | 'android' | 'web', activeOnly: boolean = true): Promise<PushToken[]> {
    try {
      let query = `
        SELECT * FROM push_tokens 
        WHERE platform = ?
      `;
      
      if (activeOnly) {
        query += ` AND is_active = 1`;
      }
      
      query += ` ORDER BY created_at DESC`;

      const result = await this.env.DB.prepare(query).bind(platform).all();

      return result.results.map(row => this.mapRowToPushToken(row));
    } catch (error) {
      console.error('Failed to get push tokens by platform:', error);
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
   * Delete push token
   */
  async deletePushToken(pushToken: string): Promise<PushTokenResponse> {
    try {
      const result = await this.env.DB.prepare(`
        DELETE FROM push_tokens WHERE push_token = ?
      `).bind(pushToken).run();

      if (result.meta.changes === 0) {
        return {
          success: false,
          message: 'Push token not found',
        };
      }

      return {
        success: true,
        message: 'Push token deleted successfully',
      };
    } catch (error) {
      console.error('Failed to delete push token:', error);
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
   * Clean up inactive push tokens
   */
  async cleanupInactivePushTokens(daysInactive: number = 30): Promise<number> {
    try {
      const result = await this.env.DB.prepare(`
        DELETE FROM push_tokens 
        WHERE is_active = 0 AND updated_at < datetime('now', '-${daysInactive} days')
      `).run();

      return result.meta.changes || 0;
    } catch (error) {
      console.error('Failed to cleanup inactive push tokens:', error);
      return 0;
    }
  }

  /**
   * Map database row to MobilePhoneRequest object
   */
  private mapRowToMobilePhoneRequest(row: any): MobilePhoneRequest {
    return {
      id: row.id,
      phone_number: row.phone_number,
      country_code: row.country_code,
      request_type: row.request_type,
      user_agent: row.user_agent,
      ip_address: row.ip_address,
      timestamp: row.timestamp,
      status: row.status,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
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
      phone_number: row.phone_number,
      push_token: row.push_token,
      platform: row.platform,
      app_version: row.app_version,
      device_id: row.device_id,
      is_active: Boolean(row.is_active),
      last_used: row.last_used,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}