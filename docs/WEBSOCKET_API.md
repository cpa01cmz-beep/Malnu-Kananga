# WebSocket API Documentation

**Created**: 2026-01-15
**Version**: 3.2.2
**Status**: Active

## Overview

The MA Malnu Kananga API supports real-time communication via WebSocket connections. This enables live updates for grades, attendance, announcements, events, and more without requiring manual refresh.

**WebSocket Endpoint**: `wss://your-domain.com/ws`

**Authentication**: JWT token required as query parameter

---

## Table of Contents

- [Connection](#connection)
- [Client Messages](#client-messages)
- [Server Events](#server-events)
- [Event Data Structures](#event-data-structures)
- [Reconnection Strategy](#reconnection-strategy)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Connection

### Establish Connection

```javascript
// Import STORAGE_KEYS from constants
import { STORAGE_KEYS } from './src/constants';

const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
const ws = new WebSocket(`wss://your-domain.com/ws?token=${token}`);

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = (event) => {
  console.log('WebSocket disconnected:', event.code, event.reason);
};
```

### Connection Flow

1. **Client initiates connection** with JWT token as query parameter
2. **Server verifies token** and checks session validity
3. **Server assigns client ID** (format: `{user_id}_{timestamp}`)
4. **Connection established** - client can send/receive messages
5. **Automatic reconnection** - client should handle disconnections gracefully

### Authentication

WebSocket connections require a valid JWT token:

- **Token Source**: `localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)`
- **Token Type**: Bearer token (same as REST API)
- **Session Check**: Server validates token and session in database
- **Revocation**: If session is revoked, connection is refused

### Client Identification

Each connected client is assigned a unique client ID:

```typescript
interface ClientID {
  userId: string;      // From JWT payload
  timestamp: number;    // Connection time
}

// Example: "12345678-1234-1234-1234-123456789012_1736995200000"
```

---

## Client Messages

### Ping

Health check to keep connection alive.

**Request:**
```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong",
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

**Usage:**
```javascript
// Send ping every 30 seconds to prevent timeout
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);
```

### Subscribe

Subscribe to specific event types. (Optional - currently for logging only)

**Request:**
```json
{
  "type": "subscribe",
  "eventType": "grade_created"
}
```

**Supported Event Types:**
- `grade_created`, `grade_updated`, `grade_deleted`
- `attendance_marked`, `attendance_updated`
- `announcement_created`, `announcement_updated`, `announcement_deleted`
- `library_material_added`, `library_material_updated`
- `event_created`, `event_updated`, `event_deleted`
- `user_role_changed`, `user_status_changed`

### Unsubscribe

Unsubscribe from specific event types. (Optional - currently for logging only)

**Request:**
```json
{
  "type": "unsubscribe",
  "eventType": "grade_created"
}
```

### Disconnect

Initiate graceful disconnection from server.

**Request:**
```json
{
  "type": "disconnect"
}
```

**Server Behavior:**
- Removes client from connected clients map
- Sends close frame with status 1000 (Normal Closure)
- Client receives `close` event

---

## Server Events

### Grade Events

#### Grade Created

```json
{
  "type": "grade_created",
  "entity": "grade",
  "entityId": "grade-id-123",
  "data": {
    "id": "grade-id-123",
    "studentId": "student-456",
    "subjectId": "subject-789",
    "classId": "class-101",
    "assignmentType": "tugas",
    "assignmentName": "Matematika - Bab 1",
    "score": 85,
    "maxScore": 100,
    "semester": "Ganjil 2024/2025",
    "academicYear": "2024/2025",
    "createdAt": "2026-01-15T10:30:00.000Z"
  },
  "timestamp": "2026-01-15T10:30:00.000Z",
  "userRole": "teacher",
  "userId": "teacher-123"
}
```

**Triggered when:**
- Teacher creates new grade for student
- PPDB student grade is entered for the first time

#### Grade Updated

```json
{
  "type": "grade_updated",
  "entity": "grade",
  "entityId": "grade-id-123",
  "data": { /* Grade object */ },
  "timestamp": "2026-01-15T10:35:00.000Z",
  "userRole": "teacher",
  "userId": "teacher-123"
}
```

**Triggered when:**
- Teacher updates existing grade
- Grade score is modified
- Grade is deleted (marked as deleted)

#### Grade Deleted

```json
{
  "type": "grade_deleted",
  "entity": "grade",
  "entityId": "grade-id-123",
  "data": { /* Grade object before deletion */ },
  "timestamp": "2026-01-15T10:40:00.000Z",
  "userRole": "teacher",
  "userId": "teacher-123"
}
```

**Triggered when:**
- Grade is permanently deleted from database

---

### Attendance Events

#### Attendance Marked

```json
{
  "type": "attendance_marked",
  "entity": "attendance",
  "entityId": "attendance-id-456",
  "data": {
    "id": "attendance-id-456",
    "studentId": "student-456",
    "classId": "class-101",
    "date": "2026-01-15",
    "status": "hadir",
    "notes": "",
    "subjectId": "subject-789",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  "timestamp": "2026-01-15T08:00:00.000Z",
  "userRole": "teacher",
  "userId": "teacher-123"
}
```

**Triggered when:**
- Teacher marks attendance for student(s)
- Attendance record is created for a date

#### Attendance Updated

```json
{
  "type": "attendance_updated",
  "entity": "attendance",
  "entityId": "attendance-id-456",
  "data": { /* Updated attendance object */ },
  "timestamp": "2026-01-15T08:30:00.000Z",
  "userRole": "teacher",
  "userId": "teacher-123"
}
```

**Triggered when:**
- Attendance status is modified (e.g., from "hadir" to "sakit")
- Attendance notes are updated

---

### Announcement Events

#### Announcement Created

```json
{
  "type": "announcement_created",
  "entity": "announcement",
  "entityId": "announcement-789",
  "data": {
    "id": "announcement-789",
    "title": "Pengumuman Libur Semester",
    "content": "Libur semester akan dimulai tanggal...",
    "category": "informasi",
    "priority": "high",
    "targetAudience": ["teacher", "student", "parent"],
    "isActive": true,
    "startDate": "2026-01-15",
    "endDate": "2026-02-01",
    "createdBy": "admin-001",
    "createdAt": "2026-01-15T09:00:00.000Z"
  },
  "timestamp": "2026-01-15T09:00:00.000Z",
  "userRole": "admin",
  "userId": "admin-001"
}
```

**Triggered when:**
- Admin creates new announcement
- Teacher/OSIS creates event announcement

#### Announcement Updated

```json
{
  "type": "announcement_updated",
  "entity": "announcement",
  "entityId": "announcement-789",
  "data": { /* Updated announcement object */ },
  "timestamp": "2026-01-15T09:30:00.000Z",
  "userRole": "admin",
  "userId": "admin-001"
}
```

**Triggered when:**
- Announcement content is modified
- Announcement active status is toggled
- Announcement priority is changed

#### Announcement Deleted

```json
{
  "type": "announcement_deleted",
  "entity": "announcement",
  "entityId": "announcement-789",
  "data": { /* Announcement object before deletion */ },
  "timestamp": "2026-01-15T10:00:00.000Z",
  "userRole": "admin",
  "userId": "admin-001"
}
```

**Triggered when:**
- Announcement is permanently deleted

---

### E-Library Events

#### Library Material Added

```json
{
  "type": "library_material_added",
  "entity": "library_material",
  "entityId": "material-101",
  "data": {
    "id": "material-101",
    "title": "Modul Matematika Kelas X",
    "description": "Modul pembelajaran matematika...",
    "category": "modul",
    "subjectId": "subject-789",
    "classLevel": ["X"],
    "fileUrl": "https://r2.example.com/materials/modul-mat-x.pdf",
    "fileName": "modul-mat-x.pdf",
    "fileSize": 2048576,
    "fileType": "application/pdf",
    "keywords": ["matematika", "aljabar", "kalkulus"],
    "downloadCount": 0,
    "uploadedBy": "teacher-123",
    "createdAt": "2026-01-15T11:00:00.000Z"
  },
  "timestamp": "2026-01-15T11:00:00.000Z",
  "userRole": "teacher",
  "userId": "teacher-123"
}
```

**Triggered when:**
- Teacher uploads new learning material
- Admin adds reference document

#### Library Material Updated

```json
{
  "type": "library_material_updated",
  "entity": "library_material",
  "entityId": "material-101",
  "data": { /* Updated material object */ },
  "timestamp": "2026-01-15T11:30:00.000Z",
  "userRole": "teacher",
  "userId": "teacher-123"
}
```

**Triggered when:**
- Material metadata is updated
- Material keywords are modified
- Material is marked inactive

---

### School Event Events

#### Event Created

```json
{
  "type": "event_created",
  "entity": "event",
  "entityId": "event-202",
  "data": {
    "id": "event-202",
    "eventName": "Pentas Seni Sekolah",
    "description": "Pentas seni tahunan sekolah...",
    "date": "2026-02-15T09:00:00.000Z",
    "location": "Aula Utama MA Malnu Kananga",
    "status": "Upcoming",
    "organizer": "osis-001",
    "createdAt": "2026-01-15T12:00:00.000Z"
  },
  "timestamp": "2026-01-15T12:00:00.000Z",
  "userRole": "osis",
  "userId": "osis-001"
}
```

**Triggered when:**
- OSIS creates new school event
- Admin creates special event

#### Event Updated

```json
{
  "type": "event_updated",
  "entity": "event",
  "entityId": "event-202",
  "data": { /* Updated event object */ },
  "timestamp": "2026-01-15T12:30:00.000Z",
  "userRole": "osis",
  "userId": "osis-001"
}
```

**Triggered when:**
- Event details are modified
- Event status changes (Upcoming → Ongoing → Completed)
- Event date/time is rescheduled

#### Event Deleted

```json
{
  "type": "event_deleted",
  "entity": "event",
  "entityId": "event-202",
  "data": { /* Event object before deletion */ },
  "timestamp": "2026-01-15T13:00:00.000Z",
  "userRole": "osis",
  "userId": "osis-001"
}
```

**Triggered when:**
- Event is permanently deleted

---

### User Events

#### User Role Changed

```json
{
  "type": "user_role_changed",
  "entity": "user",
  "entityId": "user-123",
  "data": {
    "id": "user-123",
    "name": "Ahmad Fauzi",
    "email": "ahmad@example.com",
    "role": "teacher",
    "extraRole": null,
    "status": "active",
    "updatedAt": "2026-01-15T14:00:00.000Z"
  },
  "timestamp": "2026-01-15T14:00:00.000Z",
  "userRole": "admin",
  "userId": "admin-001"
}
```

**Triggered when:**
- Admin changes user's primary role
- Admin adds/removes extra role

#### User Status Changed

```json
{
  "type": "user_status_changed",
  "entity": "user",
  "entityId": "user-456",
  "data": { /* Updated user object */ },
  "timestamp": "2026-01-15T14:30:00.000Z",
  "userRole": "admin",
  "userId": "admin-001"
}
```

**Triggered when:**
- User is activated/deactivated
- User status is modified

---

## Event Data Structures

### Common Event Schema

All WebSocket events follow this structure:

```typescript
interface WebSocketEvent {
  type: string;           // Event type (e.g., "grade_created")
  entity: string;         // Entity type (e.g., "grade")
  entityId: string;       // Unique identifier of the entity
  data: object;          // Full entity data
  timestamp: string;      // ISO 8601 timestamp
  userRole: string;       // Role of user who triggered the event
  userId: string;         // ID of user who triggered the event
}
```

### Event Types Mapping

| Table | Action | Event Type |
|-------|--------|------------|
| grades | created | `grade_created` |
| grades | updated | `grade_updated` |
| grades | deleted | `grade_deleted` |
| attendance | created | `attendance_marked` |
| attendance | updated | `attendance_updated` |
| announcements | created | `announcement_created` |
| announcements | updated | `announcement_updated` |
| announcements | deleted | `announcement_deleted` |
| e_library | created | `library_material_added` |
| e_library | updated | `library_material_updated` |
| school_events | created | `event_created` |
| school_events | updated | `event_updated` |
| school_events | deleted | `event_deleted` |
| users | updated | `user_role_changed` |
| users | updated | `user_status_changed` |

---

## Reconnection Strategy

### Exponential Backoff

Implement exponential backoff for reconnection:

```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
const baseDelay = 1000; // 1 second

function connect() {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const ws = new WebSocket(`wss://your-domain.com/ws?token=${token}`);
  
  ws.onclose = (event) => {
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = baseDelay * Math.pow(2, reconnectAttempts);
      console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1})`);
      
      setTimeout(() => {
        reconnectAttempts++;
        connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  };
  
  ws.onopen = () => {
    reconnectAttempts = 0; // Reset on successful connection
  };
}

connect();
```

### Reconnection Delays

| Attempt | Delay |
|---------|--------|
| 1 | 1 second |
| 2 | 2 seconds |
| 3 | 4 seconds |
| 4 | 8 seconds |
| 5 | 16 seconds |
| 6 | 32 seconds |
| 7 | 1 minute |
| 8 | 2 minutes |
| 9 | 4 minutes |
| 10 | 8 minutes |

### Connection Health Monitoring

```javascript
let lastPingTime = Date.now();
let isConnectionHealthy = true;

// Monitor connection health
setInterval(() => {
  const timeSinceLastPing = Date.now() - lastPingTime;
  
  if (timeSinceLastPing > 60000) { // 1 minute
    console.warn('Connection may be unhealthy');
    isConnectionHealthy = false;
  }
}, 30000);

// Update on pong
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'pong') {
    lastPingTime = Date.now();
    isConnectionHealthy = true;
  }
};
```

---

## Security

### Token Validation

- **Token Required**: All connections must include valid JWT token
- **Session Check**: Server validates session in database
- **Revocation**: Revoked sessions are immediately disconnected
- **Token Expiry**: Expired tokens result in connection rejection

### Origin Validation

- **CORS Restrictions**: Only allowed origins can connect
- **Environment-Based**: Origins configured per environment
- **Production Mode**: Strict origin validation enforced

### Message Validation

- **JSON Format**: All messages must be valid JSON
- **Type Required**: `type` field is mandatory
- **Schema Validation**: Message payload validated against schema
- **Rate Limiting**: Excessive messages may trigger disconnection

### Best Practices

1. **Never expose token**: Don't log or display tokens
2. **Validate messages**: Always validate incoming messages
3. **Handle errors gracefully**: Don't crash on malformed messages
4. **Disconnect on logout**: Close WebSocket when user logs out
5. **Use HTTPS**: Always use `wss://` in production

---

## Troubleshooting

### Connection Fails

**Symptoms:**
- WebSocket connection not established
- Console shows connection error

**Solutions:**
1. Check token is valid and not expired
2. Verify server is running and accessible
3. Check network connection
4. Verify CORS configuration
5. Check browser console for detailed error

**Example Error:**
```javascript
{
  success: false,
  message: "Akses ditolak",
  status: 401
}
```

### Frequent Disconnections

**Symptoms:**
- Connection established but drops frequently
- Reconnection loop

**Solutions:**
1. Check network stability
2. Reduce message frequency
3. Verify server timeout configuration
4. Implement proper ping/pong mechanism
5. Check if NAT/firewall is causing issues

### No Events Received

**Symptoms:**
- Connection established but no events
- Other users see updates

**Solutions:**
1. Verify role has access to events
2. Check if client is subscribed to correct channels
3. Verify server is sending events
4. Check browser console for message errors
5. Test with different user account

### High Latency

**Symptoms:**
- Events arrive with significant delay
- Ping/pong responses slow

**Solutions:**
1. Check server load and performance
2. Verify network connection quality
3. Reduce payload size of events
4. Check if database queries are optimized
5. Monitor for network congestion

---

## Example Integration

### React Hook Integration

```typescript
import { useEffect, useRef, useState } from 'react';
import { getAuthToken } from '../utils/authUtils';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = () => {
    const token = getAuthToken();
    if (!token) return;

    const ws = new WebSocket(`wss://your-domain.com/ws?token=${token}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastEvent(data);
      
      // Handle specific event types
      switch (data.type) {
        case 'grade_created':
          console.log('New grade:', data.data);
          break;
        case 'announcement_created':
          console.log('New announcement:', data.data);
          break;
        default:
          console.log('Event:', data);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Reconnection with exponential backoff
      if (reconnectAttempts.current < 10) {
        const delay = 1000 * Math.pow(2, reconnectAttempts.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;

    // Ping interval
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
    };
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const disconnect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'disconnect' }));
    }
  };

  return {
    isConnected,
    lastEvent,
    disconnect
  };
}
```

---

## Related Documentation

- [API Reference](./api-reference.md) - Complete REST API documentation
- [OpenAPI Specification](./openapi.yaml) - OpenAPI 3.0 spec for REST endpoints
- [Blueprint](../blueprint.md) - System architecture overview
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deployment and setup instructions

---

**Last Updated**: 2026-01-15
**Version**: 3.2.2
**Maintained By**: Autonomous System Guardian
