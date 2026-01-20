# WebSocket Real-Time Implementation

**Status**: ✅ FULLY IMPLEMENTED (Backend + Frontend complete)
**Last Updated**: 2026-01-16

> **Note**: WebSocket implementation is now fully complete with backend WebSocket server (`/ws` endpoint), fallback polling endpoint (`/api/updates`), and fully functional frontend service (`webSocketService.ts`). This document serves as architectural reference for the implementation.

## Overview

This implementation provides real-time data synchronization for the MA Malnu Kananga school management system using WebSocket technology with offline-first fallback support.

## Architecture

### Core Components

1. **WebSocketService** (`src/services/webSocketService.ts`)
   - Core WebSocket connection management
   - Event subscription and handling
   - Offline fallback to polling
   - Automatic reconnection with exponential backoff
   - Local storage synchronization

2. **React Hooks** (`src/hooks/useWebSocket.ts`)
   - `useWebSocket()` - Main hook for connection management
   - `useRealtimeEvent()` - Subscribe to specific event types
   - `useRealtimeGrades()` - Real-time grade updates
   - `useRealtimeAnnouncements()` - Real-time announcements
   - `useRealtimeNotifications()` - Real-time notifications

3. **UI Components** (`src/components/WebSocketStatus.tsx`)
   - `WebSocketStatus` - Connection status display
   - `WebSocketIndicator` - Small status indicator
   - `WebSocketStatusPanel` - Detailed connection panel

4. **Integration**
   - Enhanced `offlineActionQueueService` with WebSocket conflict resolution
   - Real-time local storage updates
   - Conflict detection and resolution

## Features

### Real-Time Event Types

```typescript
export type RealTimeEventType = 
  | 'grade_created' | 'grade_updated' | 'grade_deleted'
  | 'attendance_marked' | 'attendance_updated'
  | 'announcement_created' | 'announcement_updated' | 'announcement_deleted'
  | 'library_material_added' | 'library_material_updated'
  | 'event_created' | 'event_updated' | 'event_deleted'
  | 'user_role_changed' | 'user_status_changed'
  | 'message_created' | 'message_updated'
  | 'notification_created' | 'notification_read';
```

### Fallback Strategy

1. **Primary**: WebSocket connection for instant updates
2. **Fallback**: HTTP polling at 30-second intervals
3. **Offline**: Action queuing with sync when reconnected

### Conflict Resolution

- Automatic conflict detection via WebSocket events
- Integration with offline action queue
- Server version comparison
- User notification for manual resolution when needed

## Usage Examples

### Basic WebSocket Usage

```typescript
import { useWebSocket } from '../hooks/useWebSocket';
import { WebSocketStatus } from '../components/WebSocketStatus';

function MyComponent() {
  const { isConnected, subscribe, reconnect } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('grade_updated', (event) => {
      console.log('Grade updated:', event.data);
    });

    return unsubscribe;
  }, [subscribe]);

  return (
    <div>
      <WebSocketStatus />
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={reconnect}>Reconnect</button>
    </div>
  );
}
```

### Real-Time Grades Hook

```typescript
import { useRealtimeGrades } from '../hooks/useWebSocket';

function GradesList({ studentId }: { studentId?: string }) {
  const grades = useRealtimeGrades(studentId);

  return (
    <div>
      <h2>Real-Time Grades</h2>
      {grades.map(grade => (
        <div key={grade.id}>
          {grade.subject}: {grade.score}
        </div>
      ))}
    </div>
  );
}
```

### Custom Event Subscription

```typescript
import { useRealtimeEvent } from '../hooks/useWebSocket';

function NotificationHandler() {
  useRealtimeEvent(
    'notification_created',
    (event) => {
      const notification = event.data;
      // Show notification to user
      showToast(notification.title, notification.body);
    },
    // Optional filter
    (event) => event.userRole === 'student'
  );

  return null;
}
```

## Configuration

### Environment Variables

```bash
# WebSocket URL (optional, defaults to API base URL with ws:// protocol)
VITE_WS_BASE_URL=wss://your-websocket-server.com/ws

# Disable WebSocket entirely (useful for testing)
VITE_WS_ENABLED=false

# API Base URL (used for polling fallback)
VITE_API_BASE_URL=https://your-api-server.com
```

### WebSocket Configuration

```typescript
export const WS_CONFIG = {
  WS_BASE_URL: 'wss://malnu-kananga-worker.cpa01cmz.workers.dev/ws',
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 5000,
  CONNECTION_TIMEOUT: 10000,
  PING_INTERVAL: 30000,
  FALLBACK_POLLING_INTERVAL: 30000,
  SUBSCRIPTION_TTL: 3600000, // 1 hour
} as const;
```

## Backend Integration

### WebSocket Message Format

```typescript
// Server → Client messages
interface RealTimeEvent {
  type: RealTimeEventType;
  entity: string;
  entityId: string;
  data: unknown;
  timestamp: string;
  userRole: UserRole;
  userId: string;
}

// Client → Server subscription messages
interface SubscriptionMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'pong' | 'disconnect';
  eventType?: RealTimeEventType;
  timestamp: string;
}
```

### Cloudflare Workers Implementation

```typescript
// worker.js (basic structure)
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/ws' && request.headers.get('upgrade') === 'websocket') {
      return handleWebSocket(request, env, ctx);
    }
    
    // Regular HTTP API calls
    return handleAPI(request, env, ctx);
  }
};

async function handleWebSocket(request, env, ctx) {
  const pair = new WebSocketPair();
  const [client, server] = pair;
  
  // Validate JWT token from query params
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const isValid = await validateToken(token);
  
  if (!isValid) {
    client.close(4001, 'Unauthorized');
    return new Response(null, { status: 401 });
  }
  
  // Handle WebSocket connection
  server.accept();
  
  // Store connection for broadcasting
  const roomId = extractRoomId(token);
  env.ROOMS.get(roomId)?.add(server);
  
  // Handle messages
  server.addEventListener('message', async (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'subscribe':
        // Add to subscription list
        break;
      case 'ping':
        server.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
    }
  });
  
  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
```

### Broadcasting Events

```typescript
// Utility to broadcast events to relevant clients
async function broadcastEvent(env, eventType, entity, entityId, data, userRole, userId) {
  const event = {
    type: eventType,
    entity,
    entityId,
    data,
    timestamp: new Date().toISOString(),
    userRole,
    userId,
  };
  
  // Find relevant connections based on permissions and roles
  const relevantConnections = await findRelevantConnections(env, event);
  
  // Broadcast to each connection
  const promises = relevantConnections.map(ws => {
    try {
      ws.send(JSON.stringify(event));
    } catch (error) {
      // Remove dead connections
      env.ROOMS.remove(ws);
    }
  });
  
  await Promise.allSettled(promises);
}
```

## Testing

### Unit Tests

```bash
# Run WebSocket service tests
npm test -- src/services/__tests__/webSocketService.test.ts

# Run hook tests
npm test -- src/hooks/__tests__/useWebSocket.test.ts
```

### Integration Testing

```typescript
// Example: Mock WebSocket for testing
const mockWebSocket = {
  readyState: WebSocket.OPEN,
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
};

global.WebSocket = vi.fn(() => mockWebSocket);

// Test connection
await webSocketService.initialize();
expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function));
```

### Manual Testing

1. Open multiple browser tabs
2. Perform actions in one tab (create grade, update attendance)
3. Verify real-time updates appear in other tabs
4. Test offline behavior:
   - Disconnect network
   - Perform actions (should be queued)
   - Reconnect network
   - Verify queued actions sync

## Performance Considerations

### Connection Management

- Automatic cleanup when no active subscriptions
- Exponential backoff for reconnections
- Graceful degradation to polling
- Connection pooling for multiple tabs

### Memory Management

- Subscription TTL to prevent memory leaks
- Cleanup on component unmount
- Limited event history in local storage
- Garbage collection for dead connections

### Network Efficiency

- Ping/pong for connection health
- Batch updates when possible
- Compression support in WebSocket
- Minimal payload sizes

## Security

### Authentication

- JWT token validation for connections
- Role-based subscription filtering
- Secure token transmission
- Automatic disconnection on token expiry

### Data Validation

- Server-side validation of all incoming events
- Client-side sanitization of event data
- Type checking for all event payloads
- Rate limiting on subscription requests

### Permission Controls

- Integration with existing permission system
- Role-based event filtering
- User isolation for sensitive data
- Audit logging for all events

## Troubleshooting

### Common Issues

1. **Connection Fails to Establish**
   - Check network connectivity
   - Verify WebSocket URL is accessible
   - Check JWT token validity
   - Ensure server supports WebSocket protocol

2. **No Real-Time Updates**
   - Verify subscriptions are active
   - Check browser console for errors
   - Ensure server is broadcasting events
   - Check permission settings

3. **Frequent Disconnections**
   - Check server logs for connection limits
   - Verify network stability
   - Check for browser extension interference
   - Monitor reconnection attempts

### Debug Tools

```typescript
// Enable debug logging
import { logger } from '../utils/logger';
logger.setLevel('debug');

// Monitor connection state
const { connectionState } = useWebSocket();
console.log('Connection state:', connectionState);

// Check active subscriptions
const webSocketService = WebSocketService.getInstance();
const state = webSocketService.getConnectionState();
console.log('Active subscriptions:', Array.from(state.subscriptions));
```

## Migration Guide

### From Polling to WebSocket

1. **Setup WebSocket Service**
   ```typescript
   // Replace polling interval with WebSocket
   const { subscribe } = useWebSocket();
   
   useEffect(() => {
     const unsubscribe = subscribe('grade_updated', handleGradeUpdate);
     return unsubscribe;
   }, [subscribe]);
   ```

2. **Update Local Storage Logic**
   - Remove manual polling
   - Use WebSocket real-time updates
   - Keep offline queue integration

3. **Add Connection Status UI**
   ```typescript
   import { WebSocketStatus } from '../components/WebSocketStatus';
   
   function Layout() {
     return (
       <div>
         <WebSocketStatus compact />
         {/* Rest of app */}
       </div>
     );
   }
   ```

### Incremental Adoption

1. Start with non-critical features (announcements, notifications)
2. Add real-time capabilities to core features (grades, attendance)
3. Implement advanced features (chat, collaboration)
4. Optimize performance and security

## Future Enhancements

### Planned Features

1. **Chat & Messaging**
   - Real-time teacher-student communication
   - Group chat support
   - File sharing integration
   - Message encryption

2. **Live Collaboration**
   - Real-time document editing
   - Whiteboard sharing
   - Screen sharing for remote learning
   - Collaborative grading

3. **Advanced Sync**
   - Conflict resolution UI
   - Selective sync by data type
   - Offline-first design patterns
   - Background sync optimization

4. **Analytics & Monitoring**
   - Real-time usage analytics
   - Connection quality monitoring
   - Performance metrics
   - User engagement tracking

### Technical Improvements

1. **Scalability**
   - Redis adapter for multi-instance support
   - Database connection pooling
   - Load balancing for WebSocket servers
   - Geographic distribution

2. **Reliability**
   - Dead-letter queue for failed messages
   - Circuit breaker pattern
   - Health check endpoints
   - Disaster recovery procedures

This WebSocket implementation provides a solid foundation for real-time functionality in the MA Malnu Kananga school management system, with offline-first reliability and comprehensive testing coverage.