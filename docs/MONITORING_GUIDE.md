# 📊 Monitoring & Observability Guide - MA Malnu Kananga

## 🌟 Overview

Dokumentasi ini menjelaskan strategi monitoring dan observability komprehensif untuk MA Malnu Kananga School Portal, mencakup error tracking, performance monitoring, user behavior analytics, security monitoring, dan system health checks untuk memastikan operasional sistem yang optimal.

---

**Monitoring Guide Version: 1.3.1**  

**Last Updated: 2025-11-24**  

**Last Updated: 2025-11-24

**Monitoring Status: Production Ready**

---

## 🏗️ Monitoring Architecture

### Observability Stack
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Cloudflare    │    │   External      │
│   Monitoring    │◄──►│   Analytics     │◄──►│   Services      │
│                 │    │                 │    │   (Sentry)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          │              ┌─────────────────┐              │
          │              │   Custom        │              │
          └──────────────►│   Dashboards    │◄─────────────┘
                         │   (Grafana)     │
                         └─────────────────┘
                                  │
                         ┌─────────────────┐
                         │   Alerting      │
                         │   System        │
                         │   (PagerDuty)   │
                         └─────────────────┘
```

### Monitoring Layers
1. **Application Layer**: Error tracking, performance metrics, user interactions
2. **Infrastructure Layer**: Cloudflare Workers, D1 database, Vectorize
3. **Network Layer**: CDN performance, edge caching, request routing
4. **Security Layer**: Threat detection, rate limiting, authentication events
5. **Business Layer**: User engagement, feature usage, conversion metrics

---

## 🚨 Error Tracking & Management

### Sentry Integration
```javascript
// src/utils/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Sentry configuration
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: `malnu-kananga@${process.env.REACT_APP_VERSION}`,
  
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
  ],
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event) {
    // Filter out sensitive information
    if (event.exception) {
      const error = event.exception.values[0];
      if (error.value?.includes('password') || error.value?.includes('token')) {
        return null; // Don't send sensitive errors
      }
    }
    return event;
  },
  
  ignoreErrors: [
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    'Network request failed'
  ]
});

// Custom error tracking
export const trackError = (error, context = {}) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', context.feature || 'unknown');
    scope.setExtra('userRole', context.userRole || 'anonymous');
    scope.setExtra('action', context.action || 'unknown');
    
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    Sentry.captureException(error);
  });
};

// Performance tracking
export const trackPerformance = (name, data) => {
  Sentry.addBreadcrumb({
    message: name,
    category: 'performance',
    level: 'info',
    data
  });
};
```

### Error Boundary Implementation
```javascript
// src/components/ErrorBoundary.tsx
import React from 'react';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';

const ErrorBoundary = ({ children, fallback }) => {
  return (
    <SentryErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-fallback">
          <h2>Terjadi kesalahan</h2>
          <p>Maaf, terjadi kesalahan yang tidak terduga.</p>
          <details>
            <summary>Detail error</summary>
            <pre>{error.message}</pre>
          </details>
          <button onClick={resetError}>Coba lagi</button>
        </div>
      )}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
        trackError(error, {
          feature: 'ErrorBoundary',
          componentStack: errorInfo.componentStack
        });
      }}
    >
      {children}
    </SentryErrorBoundary>
  );
};

export default ErrorBoundary;
```

### Worker Error Tracking
```javascript
// worker.js - Error tracking in Cloudflare Workers
class WorkerErrorTracker {
  constructor(env) {
    this.env = env;
    this.sentryDsn = env.SENTRY_DSN;
  }
  
  async trackError(error, context = {}) {
    try {
      const payload = {
        message: error.message,
        stack: error.stack,
        level: 'error',
        platform: 'javascript',
        environment: this.env.NODE_ENV || 'production',
        release: this.env.RELEASE_VERSION || 'unknown',
        extra: {
          context,
          timestamp: new Date().toISOString(),
          workerVersion: this.env.WORKER_VERSION
        }
      };
      
      await fetch(`https://sentry.io/api/${this.sentryDsn}/store/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }
  }
  
  async trackPerformance(operation, duration, metadata = {}) {
    const payload = {
      message: `Performance: ${operation}`,
      level: 'info',
      extra: {
        operation,
        duration,
        metadata,
        timestamp: new Date().toISOString()
      }
    };
    
    await this.trackError(new Error(payload.message), payload.extra);
  }
}
```

---

## 📈 Performance Monitoring

### Real User Monitoring (RUM)
```javascript
// src/utils/performanceMonitor.ts
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.initializeObservers();
  }
  
  initializeObservers() {
    // Core Web Vitals
    this.observeWebVitals();
    
    // Resource timing
    this.observeResourceTiming();
    
    // User interactions
    this.observeUserInteractions();
    
    // API calls
    this.interceptFetch();
  }
  
  observeWebVitals() {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => this.recordMetric('CLS', metric));
      getFID((metric) => this.recordMetric('FID', metric));
      getFCP((metric) => this.recordMetric('FCP', metric));
      getLCP((metric) => this.recordMetric('LCP', metric));
      getTTFB((metric) => this.recordMetric('TTFB', metric));
    });
  }
  
  observeResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          this.recordMetric('resource', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            type: this.getResourceType(entry.name)
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }
  
  observeUserInteractions() {
    ['click', 'touchstart', 'keydown'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        const startTime = performance.now();
        
        const endInteraction = () => {
          const duration = performance.now() - startTime;
          this.recordMetric('interaction', {
            type: eventType,
            target: event.target.tagName,
            duration,
            timestamp: Date.now()
          });
        };
        
        setTimeout(endInteraction, 100);
      }, { passive: true });
    });
  }
  
  interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.recordMetric('api_call', {
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration,
          success: response.ok
        });
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        this.recordMetric('api_call', {
          url,
          method: args[1]?.method || 'GET',
          status: 0,
          duration,
          success: false,
          error: error.message
        });
        
        throw error;
      }
    };
  }
  
  recordMetric(type, data) {
    const timestamp = Date.now();
    const key = `${type}_${timestamp}`;
    
    this.metrics.set(key, {
      type,
      data,
      timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent
    });
    
    // Send to analytics endpoint
    this.sendMetrics();
  }
  
  async sendMetrics() {
    if (this.metrics.size === 0) return;
    
    const metrics = Array.from(this.metrics.values());
    this.metrics.clear();
    
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics })
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }
  
  getResourceType(url) {
    if (url.match(/\.(js)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf)$/)) return 'font';
    return 'other';
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

### Custom Performance Metrics
```javascript
// src/hooks/usePerformanceTracking.ts
import { useEffect, useRef } from 'react';

export const usePerformanceTracking = (componentName) => {
  const renderStartTime = useRef(performance.now());
  const interactionTimes = useRef([]);
  
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    // Track component render performance
    performanceMonitor.recordMetric('component_render', {
      component: componentName,
      duration: renderTime,
      timestamp: Date.now()
    });
  });
  
  const trackInteraction = (action) => {
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        interactionTimes.current.push({ action, duration });
        
        performanceMonitor.recordMetric('component_interaction', {
          component: componentName,
          action,
          duration,
          timestamp: Date.now()
        });
      }
    };
  };
  
  const getAverageInteractionTime = () => {
    if (interactionTimes.current.length === 0) return 0;
    
    const total = interactionTimes.current.reduce((sum, interaction) => 
      sum + interaction.duration, 0);
    
    return total / interactionTimes.current.length;
  };
  
  return { trackInteraction, getAverageInteractionTime };
};
```

---

## 🔍 Security Monitoring

### Security Event Tracking
```javascript
// security-middleware.js - Enhanced security monitoring
class SecurityMonitor {
  constructor(env) {
    this.env = env;
    this.securityEvents = [];
    this.threatLevels = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4
    };
  }
  
  async logSecurityEvent(event, details = {}) {
    const securityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      event,
      details,
      threatLevel: this.calculateThreatLevel(event, details),
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown',
      endpoint: details.endpoint || 'unknown'
    };
    
    this.securityEvents.push(securityEvent);
    
    // Store in persistent storage
    if (this.env.SECURITY_KV) {
      await this.env.SECURITY_KV.put(
        `security_event_${securityEvent.id}`,
        JSON.stringify(securityEvent),
        { expirationTtl: 30 * 24 * 60 * 60 } // 30 days
      );
    }
    
    // Trigger alerts for high-threat events
    if (securityEvent.threatLevel >= this.threatLevels.HIGH) {
      await this.triggerSecurityAlert(securityEvent);
    }
    
    console.warn(`SECURITY EVENT [${securityEvent.threatLevel}]: ${event}`, details);
  }
  
  calculateThreatLevel(event, details) {
    const threatMap = {
      'RATE_LIMIT_EXCEEDED': this.threatLevels.MEDIUM,
      'BLOCKED_IP_ACCESS': this.threatLevels.HIGH,
      'XSS_ATTEMPT': this.threatLevels.CRITICAL,
      'SQL_INJECTION_ATTEMPT': this.threatLevels.CRITICAL,
      'CSRF_VIOLATION': this.threatLevels.HIGH,
      'AUTHENTICATION_BYPASS': this.threatLevels.CRITICAL,
      'SUSPICIOUS_USER_AGENT': this.threatLevels.LOW,
      'INVALID_TOKEN': this.threatLevels.MEDIUM
    };
    
    return threatMap[event] || this.threatLevels.LOW;
  }
  
  async triggerSecurityAlert(event) {
    const alertPayload = {
      type: 'security_alert',
      severity: event.threatLevel >= this.threatLevels.CRITICAL ? 'critical' : 'high',
      title: `Security Event: ${event.event}`,
      description: `Threat detected from IP ${event.ip}`,
      details: event.details,
      timestamp: event.timestamp
    };
    
    // Send to alerting system
    if (this.env.ALERT_WEBHOOK) {
      await fetch(this.env.ALERT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertPayload)
      });
    }
    
    // Send email notification
    if (this.env.ADMIN_EMAIL) {
      await this.sendSecurityEmail(alertPayload);
    }
  }
  
  async getSecurityMetrics(timeRange = '24h') {
    const now = Date.now();
    const timeRangeMs = this.parseTimeRange(timeRange);
    const cutoff = now - timeRangeMs;
    
    const recentEvents = this.securityEvents.filter(
      event => new Date(event.timestamp).getTime() > cutoff
    );
    
    return {
      totalEvents: recentEvents.length,
      eventsByType: this.groupEventsByType(recentEvents),
      eventsByThreatLevel: this.groupEventsByThreatLevel(recentEvents),
      topOffenders: this.getTopOffenders(recentEvents),
      trends: this.calculateSecurityTrends(recentEvents)
    };
  }
  
  groupEventsByType(events) {
    return events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {});
  }
  
  groupEventsByThreatLevel(events) {
    return events.reduce((acc, event) => {
      const level = Object.keys(this.threatLevels).find(
        key => this.threatLevels[key] === event.threatLevel
      );
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
  }
  
  getTopOffenders(events) {
    const ipCounts = events.reduce((acc, event) => {
      acc[event.ip] = (acc[event.ip] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
  }
}
```

### Real-time Threat Detection
```javascript
// threat-detection.js
class ThreatDetector {
  constructor(securityMonitor) {
    this.securityMonitor = securityMonitor;
    this.patterns = new Map();
    this.initializePatterns();
  }
  
  initializePatterns() {
    // Brute force detection
    this.patterns.set('brute_force', {
      window: 15 * 60 * 1000, // 15 minutes
      threshold: 10,
      events: ['FAILED_AUTHENTICATION']
    });
    
    // DDoS detection
    this.patterns.set('ddos', {
      window: 60 * 1000, // 1 minute
      threshold: 100,
      events: ['RATE_LIMIT_EXCEEDED']
    });
    
    // Scanning detection
    this.patterns.set('scanning', {
      window: 5 * 60 * 1000, // 5 minutes
      threshold: 20,
      events: ['SUSPICIOUS_USER_AGENT', 'INVALID_ENDPOINT']
    });
  }
  
  async analyzeEvent(event, details) {
    for (const [patternName, pattern] of this.patterns) {
      if (await this.matchesPattern(patternName, pattern, event, details)) {
        await this.securityMonitor.logSecurityEvent(
          `THREAT_DETECTED_${patternName.toUpperCase()}`,
          {
            ...details,
            pattern: patternName,
            confidence: this.calculateConfidence(patternName, details)
          }
        );
      }
    }
  }
  
  async matchesPattern(patternName, pattern, event, details) {
    // Implementation would check if event matches threat pattern
    // This is a simplified example
    return pattern.events.includes(event);
  }
  
  calculateConfidence(patternName, details) {
    // Calculate confidence score based on various factors
    let confidence = 0.5;
    
    if (details.ip) {
      // Check if IP is in known malicious ranges
      confidence += 0.2;
    }
    
    if (details.userAgent && this.isSuspiciousUserAgent(details.userAgent)) {
      confidence += 0.3;
    }
    
    return Math.min(confidence, 1.0);
  }
}
```

---

## 📊 Analytics & Business Intelligence

### User Behavior Analytics
```javascript
// src/utils/analytics.ts
class AnalyticsTracker {
  constructor() {
    this.events = [];
    this.userSession = this.initializeSession();
    this.setupPageTracking();
  }
  
  initializeSession() {
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      userId: null,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      landingPage: window.location.pathname
    };
  }
  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  setupPageTracking() {
    // Track page views
    this.trackPageView();
    
    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });
    
    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden');
      } else {
        this.trackEvent('page_visible');
      }
    });
  }
  
  trackPageView() {
    this.trackEvent('page_view', {
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now()
    });
  }
  
  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.userSession.sessionId,
        userId: this.userSession.userId,
        timestamp: Date.now(),
        url: window.location.href
      }
    };
    
    this.events.push(event);
    
    // Send events in batches
    if (this.events.length >= 10) {
      this.flushEvents();
    }
  }
  
  trackUserAction(action, target, details = {}) {
    this.trackEvent('user_action', {
      action,
      target,
      ...details
    });
  }
  
  trackFeatureUsage(feature, action, details = {}) {
    this.trackEvent('feature_usage', {
      feature,
      action,
      ...details
    });
  }
  
  trackError(error, context = {}) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context
    });
  }
  
  identifyUser(userId, traits = {}) {
    this.userSession.userId = userId;
    this.trackEvent('user_identified', { userId, traits });
  }
  
  async flushEvents() {
    if (this.events.length === 0) return;
    
    const eventsToSend = [...this.events];
    this.events = [];
    
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend })
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add events to queue on failure
      this.events.unshift(...eventsToSend);
    }
  }
  
  trackSessionEnd() {
    const sessionDuration = Date.now() - this.userSession.startTime;
    
    this.trackEvent('session_end', {
      duration: sessionDuration,
      pageViews: this.events.filter(e => e.name === 'page_view').length,
      eventsCount: this.events.length
    });
    
    this.flushEvents();
  }
}

export const analytics = new AnalyticsTracker();
```

### Custom Dashboard Implementation
```javascript
// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState({
    performance: [],
    errors: [],
    users: [],
    security: []
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchMetrics = async () => {
    try {
      const [performance, errors, users, security] = await Promise.all([
        fetch('/api/analytics/performance').then(r => r.json()),
        fetch('/api/analytics/errors').then(r => r.json()),
        fetch('/api/analytics/users').then(r => r.json()),
        fetch('/api/analytics/security').then(r => r.json())
      ]);
      
      setMetrics({ performance, errors, users, security });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading dashboard...</div>;
  }
  
  return (
    <div className="monitoring-dashboard">
      <h1>System Monitoring Dashboard</h1>
      
      <div className="metrics-grid">
        {/* Performance Metrics */}
        <div className="metric-card">
          <h2>Performance Metrics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="responseTime" stroke="#8884d8" />
              <Line type="monotone" dataKey="throughput" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Error Rates */}
        <div className="metric-card">
          <h2>Error Rates</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.errors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* User Activity */}
        <div className="metric-card">
          <h2>User Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.users}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="activeUsers" stroke="#387908" />
              <Line type="monotone" dataKey="pageViews" stroke="#d02857" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Security Events */}
        <div className="metric-card">
          <h2>Security Events</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.security}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ff0000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
```

---

## 🔔 Alerting System

### Alert Configuration
```javascript
// alerting.js
class AlertManager {
  constructor(env) {
    this.env = env;
    this.alertRules = new Map();
    this.alertHistory = [];
    this.initializeRules();
  }
  
  initializeRules() {
    // Performance alerts
    this.addRule('high_response_time', {
      condition: (metrics) => metrics.averageResponseTime > 1000,
      severity: 'warning',
      message: 'High response time detected',
      threshold: 1000,
      window: '5m'
    });
    
    // Error rate alerts
    this.addRule('high_error_rate', {
      condition: (metrics) => metrics.errorRate > 0.05,
      severity: 'critical',
      message: 'High error rate detected',
      threshold: 0.05,
      window: '5m'
    });
    
    // Security alerts
    this.addRule('security_breach', {
      condition: (metrics) => metrics.criticalSecurityEvents > 0,
      severity: 'critical',
      message: 'Critical security event detected',
      threshold: 0,
      window: '1m'
    });
    
    // User activity alerts
    this.addRule('low_user_activity', {
      condition: (metrics) => metrics.activeUsers < 10,
      severity: 'info',
      message: 'Low user activity detected',
      threshold: 10,
      window: '15m'
    });
  }
  
  addRule(name, rule) {
    this.alertRules.set(name, rule);
  }
  
  async evaluateRules(metrics) {
    for (const [ruleName, rule] of this.alertRules) {
      try {
        if (rule.condition(metrics)) {
          await this.triggerAlert(ruleName, rule, metrics);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${ruleName}:`, error);
      }
    }
  }
  
  async triggerAlert(ruleName, rule, metrics) {
    const alert = {
      id: crypto.randomUUID(),
      ruleName,
      severity: rule.severity,
      message: rule.message,
      timestamp: new Date().toISOString(),
      metrics,
      acknowledged: false
    };
    
    this.alertHistory.push(alert);
    
    // Send notifications
    await this.sendNotifications(alert);
    
    // Store alert
    if (this.env.ALERTS_KV) {
      await this.env.ALERTS_KV.put(
        `alert_${alert.id}`,
        JSON.stringify(alert),
        { expirationTtl: 7 * 24 * 60 * 60 } // 7 days
      );
    }
  }
  
  async sendNotifications(alert) {
    const notifications = [];
    
    // Slack notification
    if (this.env.SLACK_WEBHOOK) {
      notifications.push(
        fetch(this.env.SLACK_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 ${alert.severity.toUpperCase()}: ${alert.message}`,
            attachments: [{
              color: this.getSeverityColor(alert.severity),
              fields: [
                { title: 'Rule', value: alert.ruleName, short: true },
                { title: 'Time', value: alert.timestamp, short: true }
              ]
            }]
          })
        })
      );
    }
    
    // Email notification
    if (this.env.ADMIN_EMAIL && alert.severity === 'critical') {
      notifications.push(
        fetch('/api/alerts/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: this.env.ADMIN_EMAIL,
            subject: `Critical Alert: ${alert.message}`,
            body: this.formatEmailAlert(alert)
          })
        })
      );
    }
    
    // PagerDuty notification
    if (this.env.PAGERDUTY_KEY && alert.severity === 'critical') {
      notifications.push(
        fetch('https://events.pagerduty.com/v2/enqueue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routing_key: this.env.PAGERDUTY_KEY,
            event_action: 'trigger',
            payload: {
              summary: alert.message,
              source: 'malnu-kananga-monitoring',
              severity: alert.severity,
              timestamp: alert.timestamp
            }
          })
        })
      );
    }
    
    await Promise.allSettled(notifications);
  }
  
  getSeverityColor(severity) {
    const colors = {
      info: '#36a64f',
      warning: '#ff9500',
      critical: '#ff0000'
    };
    return colors[severity] || '#808080';
  }
  
  formatEmailAlert(alert) {
    return `
      Alert: ${alert.message}
      Severity: ${alert.severity}
      Rule: ${alert.ruleName}
      Time: ${alert.timestamp}
      
      Metrics:
      ${JSON.stringify(alert.metrics, null, 2)}
    `;
  }
}
```

---

## 📋 Health Checks & System Status

### Health Check Implementation
```javascript
// worker.js - Comprehensive health check
async function handleHealthCheck(request, env) {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: env.RELEASE_VERSION || 'unknown',
    uptime: process.uptime ? process.uptime() : 0,
    checks: {}
  };
  
  try {
    // Database connectivity check
    healthStatus.checks.database = await checkDatabase(env);
    
    // Vector database check
    healthStatus.checks.vectorize = await checkVectorize(env);
    
    // External API check
    healthStatus.checks.gemini_api = await checkGeminiAPI(env);
    
    // Memory usage check
    healthStatus.checks.memory = await checkMemoryUsage();
    
    // Rate limiting store check
    healthStatus.checks.rate_limit = await checkRateLimitStore(env);
    
    // Overall status determination
    const failedChecks = Object.entries(healthStatus.checks)
      .filter(([name, check]) => check.status !== 'healthy');
    
    if (failedChecks.length > 0) {
      healthStatus.status = 'degraded';
      if (failedChecks.some(([name, check]) => check.status === 'unhealthy')) {
        healthStatus.status = 'unhealthy';
      }
    }
    
  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.error = error.message;
  }
  
  const statusCode = healthStatus.status === 'healthy' ? 200 : 
                     healthStatus.status === 'degraded' ? 200 : 503;
  
  return new Response(JSON.stringify(healthStatus), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function checkDatabase(env) {
  try {
    const result = await env.DB.prepare('SELECT 1 as test').first();
    return {
      status: 'healthy',
      responseTime: result ? 'OK' : 'Failed',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function checkVectorize(env) {
  try {
    const testVector = new Array(768).fill(0);
    const result = await env.VECTORIZE_INDEX.query(testVector, { topK: 1 });
    return {
      status: 'healthy',
      responseTime: 'OK',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

### System Status Page
```javascript
// src/components/SystemStatus.tsx
import React, { useState, useEffect } from 'react';

const SystemStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchStatus = async () => {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading system status...</div>;
  }
  
  if (!status) {
    return <div>Unable to fetch system status</div>;
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'degraded': return 'yellow';
      case 'unhealthy': return 'red';
      default: return 'gray';
    }
  };
  
  return (
    <div className="system-status">
      <h1>System Status</h1>
      
      <div className={`status-indicator ${status.status}`}>
        <div className={`status-dot ${getStatusColor(status.status)}`}></div>
        <span>System Status: {status.status.toUpperCase()}</span>
      </div>
      
      <div className="status-details">
        <h2>Component Status</h2>
        {Object.entries(status.checks).map(([component, check]) => (
          <div key={component} className={`component-status ${check.status}`}>
            <h3>{component.replace('_', ' ').toUpperCase()}</h3>
            <p>Status: {check.status}</p>
            {check.error && <p>Error: {check.error}</p>}
            <p>Last checked: {new Date(check.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
      
      <div className="system-info">
        <h2>System Information</h2>
        <p>Version: {status.version}</p>
        <p>Uptime: {Math.floor(status.uptime / 60)} minutes</p>
        <p>Last updated: {new Date(status.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default SystemStatus;
```

---

## 🔮 Future Monitoring Enhancements

### Planned Monitoring Features
- [ ] **Machine Learning Anomaly Detection**: Automated pattern recognition
- [ ] **Distributed Tracing**: End-to-end request tracking
- [ ] **Synthetic Transaction Monitoring**: Automated user journey testing
- [ ] **Log Aggregation**: Centralized log management
- [ ] **Custom Metrics Builder**: Flexible metric definition system
- [ ] **Mobile Performance Monitoring**: Native app performance tracking

### Monitoring Roadmap
- **Q1 2025**: Implement distributed tracing and log aggregation
- **Q2 2025**: Add ML-based anomaly detection
- **Q3 2025**: Deploy synthetic transaction monitoring
- **Q4 2025**: Complete mobile performance monitoring

---

## 📚 Monitoring Resources

### Tools and Services
- **Error Tracking**: Sentry, Bugsnag
- **Performance Monitoring**: New Relic, DataDog
- **Log Management**: ELK Stack, Fluentd
- **Dashboarding**: Grafana, Kibana
- **Alerting**: PagerDuty, Opsgenie

### Documentation References
- [Sentry Documentation](https://docs.sentry.io/)
- [Cloudflare Analytics](https://developers.cloudflare.com/analytics/)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Observability Best Practices](https://sre.google/workbook/monitoring-distributed-systems/)

---

**Monitoring & Observability Guide - MA Malnu Kananga**

*Comprehensive monitoring and observability strategies for system reliability*

---

*Monitoring Guide Version: 1.3.1*  

*Last Updated: 2025-11-24*  

*Last Updated: 2025-11-24

*DevOps Team: MA Malnu Kananga*