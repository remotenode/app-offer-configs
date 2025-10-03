import { Env, MobilePhoneRequest, MobilePhoneRequestResponse } from '../types';

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
}