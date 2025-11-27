// Security Monitoring and Logging Service
// Implements comprehensive security event logging and monitoring

export interface SecurityEvent {
  timestamp: Date;
  type: 'auth_failure' | 'rate_limit_exceeded' | 'xss_attempt' | 'sql_injection_attempt' | 'csrf_failure' | 'suspicious_activity' | 'blocked_request';
  severity: 'low' | 'medium' | 'high' | 'critical';
  clientInfo: {
    ip: string;
    userAgent?: string;
    fingerprint?: string;
    country?: string;
  };
  details: {
    endpoint?: string;
    method?: string;
    reason?: string;
    inputData?: string;
    blockedPatterns?: string[];
  };
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  private constructor() {}

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Log security event
  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    this.events.push(securityEvent);

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console for monitoring
    console.warn('🚨 Security Event:', {
      type: event.type,
      severity: event.severity,
      ip: event.clientInfo.ip,
      details: event.details
    });

    // In production, send to external monitoring service
    this.sendToMonitoringService(securityEvent);
  }

  // Get recent security events
  getRecentEvents(limit = 50): SecurityEvent[] {
    return this.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get events by type
  getEventsByType(type: SecurityEvent['type'], limit = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get events by severity
  getEventsBySeverity(severity: SecurityEvent['severity'], limit = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.severity === severity)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get security statistics
  getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topOffenders: Array<{ ip: string; count: number }>;
    recentActivity: SecurityEvent[];
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    this.events.forEach(event => {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      
      // Count by severity
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      
      // Count by IP
      ipCounts[event.clientInfo.ip] = (ipCounts[event.clientInfo.ip] || 0) + 1;
    });

    // Get top offenders
    const topOffenders = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      topOffenders,
      recentActivity: this.getRecentEvents(10)
    };
  }

  // Check for attack patterns
  detectAttackPatterns(): {
    pattern: string;
    severity: 'medium' | 'high' | 'critical';
    description: string;
    affectedIPs: string[];
  }[] {
    const patterns = [];
    const recentEvents = this.events.filter(event => 
      Date.now() - event.timestamp.getTime() < 3600000 // Last hour
    );

    // Brute force attack detection
    const authFailures = recentEvents.filter(e => e.type === 'auth_failure');
    const authFailuresByIP = this.groupEventsByIP(authFailures);
    
    Object.entries(authFailuresByIP).forEach(([ip, events]) => {
      if (events.length > 10) {
        patterns.push({
          pattern: 'brute_force_auth',
          severity: 'high' as const,
          description: `Multiple authentication failures from IP ${ip}`,
          affectedIPs: [ip]
        });
      }
    });

    // XSS attempt detection
    const xssAttempts = recentEvents.filter(e => e.type === 'xss_attempt');
    const xssAttemptsByIP = this.groupEventsByIP(xssAttempts);
    
    Object.entries(xssAttemptsByIP).forEach(([ip, events]) => {
      if (events.length > 5) {
        patterns.push({
          pattern: 'xss_attack_campaign',
          severity: 'critical' as const,
          description: `Multiple XSS attempts from IP ${ip}`,
          affectedIPs: [ip]
        });
      }
    });

    // SQL injection detection
    const sqlAttempts = recentEvents.filter(e => e.type === 'sql_injection_attempt');
    const sqlAttemptsByIP = this.groupEventsByIP(sqlAttempts);
    
    Object.entries(sqlAttemptsByIP).forEach(([ip, events]) => {
      if (events.length > 3) {
        patterns.push({
          pattern: 'sql_injection_campaign',
          severity: 'critical' as const,
          description: `Multiple SQL injection attempts from IP ${ip}`,
          affectedIPs: [ip]
        });
      }
    });

    return patterns;
  }

  // Group events by IP
  private groupEventsByIP(events: SecurityEvent[]): Record<string, SecurityEvent[]> {
    const grouped: Record<string, SecurityEvent[]> = {};
    
    events.forEach(event => {
      const ip = event.clientInfo.ip;
      if (!grouped[ip]) {
        grouped[ip] = [];
      }
      grouped[ip].push(event);
    });

    return grouped;
  }

  // Send to external monitoring service
  private sendToMonitoringService(event: SecurityEvent): void {
    // In production, integrate with services like:
    // - Datadog
    // - New Relic
    // - Splunk
    // - ELK Stack
    // - Custom webhook endpoints
    
    // For now, just store in localStorage for debugging
    try {
      const existingLogs = localStorage.getItem('security_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(event);
      
      // Keep only last 1000 logs in localStorage
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store security logs:', error);
    }
  }

  // Export security logs
  exportLogs(): string {
    return JSON.stringify({
      events: this.events,
      stats: this.getSecurityStats(),
      patterns: this.detectAttackPatterns(),
      exportTime: new Date().toISOString()
    }, null, 2);
  }

  // Clear old events
  clearOldEvents(olderThanHours = 24): void {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    this.events = this.events.filter(event => 
      event.timestamp.getTime() > cutoffTime
    );
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();