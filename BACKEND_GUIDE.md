# Backend Integration Guide

## Overview

This guide explains how to use the new Cloudflare D1 backend for the Smart Portal MA Malnu Kananga system.

## Architecture

### Components

1. **Frontend** (React + Vite)
   - Runs on Cloudflare Pages or any static hosting
   - Uses `apiService.ts` for backend communication
   - Stores JWT tokens in localStorage for authentication

2. **Backend** (Cloudflare Worker)
   - Handles API requests and business logic
   - Implements JWT-based authentication
   - Serves as the API gateway for the frontend

3. **Database** (Cloudflare D1)
   - SQLite-based serverless database
   - Stores all application data
   - Managed via SQL queries in the Worker

4. **RAG System** (Vectorize + Workers AI)
   - Handles chatbot context retrieval
   - Vector search for relevant documents
   - Works with existing RAG implementation

## Setup Instructions

### Prerequisites

- Node.js 18+
- Cloudflare account (free tier works)
- Wrangler CLI installed: `npm install -g wrangler`

### Step 1: Configure Wrangler

Make sure `wrangler.toml` is properly configured:

```toml
name = "malnu-kananga-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

[env.production]
name = "malnu-kananga-worker-prod"

[[env.production.d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db"
database_id = "your-d1-database-id-here"

[env.production.vars]
ALLOWED_ORIGIN = "https://ma-malnukananga.sch.id"
JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production"
```

### Step 2: Create D1 Database

```bash
# Create the database
wrangler d1 create malnu-kananga-db

# Copy the database_id from the output and update wrangler.toml
```

### Step 3: Initialize Database Schema

```bash
# Deploy the worker
wrangler deploy

# Seed the database (create tables and initial data)
curl https://your-worker-url.workers.dev/seed
```

Or manually run the SQL schema:

```bash
# Execute schema.sql
wrangler d1 execute malnu-kananga-db --file=schema.sql
```

### Step 4: Set Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_BASE_URL=https://your-worker-url.workers.dev
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 5: Deploy Frontend

```bash
# Build and deploy to Cloudflare Pages
npm run build
npx wrangler pages deploy dist
```

Or use GitHub Actions for automatic deployment (see `.github/workflows/`).

## API Reference

### Authentication

#### Login

```typescript
import { authAPI } from './services/apiService';

const { success, data } = await authAPI.login(email, password);
if (success) {
  const { user, token } = data;
  // Token is automatically stored
}
```

#### Logout

```typescript
await authAPI.logout();
```

#### Get Current User

```typescript
const user = authAPI.getCurrentUser();
const isAuthenticated = authAPI.isAuthenticated();
```

### Users API

```typescript
import { usersAPI } from './services/apiService';

// Get all users
const users = await usersAPI.getAll();

// Get specific user
const user = await usersAPI.getById(userId);

// Create user
const newUser = await usersAPI.create({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'student',
  status: 'active',
});

// Update user
await usersAPI.update(userId, { name: 'John Updated' });

// Delete user
await usersAPI.delete(userId);
```

### PPDB Registrants API

```typescript
import { ppdbAPI } from './services/apiService';

// Get all registrants
const registrants = await ppdbAPI.getAll();

// Create registration
const registration = await ppdbAPI.create({
  fullName: 'Jane Doe',
  nisn: '1234567890',
  originSchool: 'SMP Negeri 1',
  parentName: 'Parent Name',
  phoneNumber: '08123456789',
  email: 'jane@example.com',
  address: 'Jl. Contoh No. 123',
});

// Update status
await ppdbAPI.updateStatus(registrantId, 'approved', 'Approved by admin');

// Delete registrant
await ppdbAPI.delete(registrantId);
```

### Inventory API

```typescript
import { inventoryAPI } from './services/apiService';

// Get all items
const items = await inventoryAPI.getAll();

// Create item
const item = await inventoryAPI.create({
  itemName: 'Meja Belajar',
  category: 'Furniture',
  quantity: 10,
  condition: 'Baik',
  location: 'Ruang Kelas X-A',
});

// Update item
await inventoryAPI.update(itemId, { quantity: 8 });

// Delete item
await inventoryAPI.delete(itemId);
```

### School Events API

```typescript
import { eventsAPI } from './services/apiService';

// Get all events
const events = await eventsAPI.getAll();

// Create event
const event = await eventsAPI.create({
  eventName: 'Upacara Bendera',
  description: 'Upacara mingguan',
  date: '2024-01-15T07:00:00Z',
  location: 'Lapangan Sekolah',
  status: 'Upcoming',
  organizer: 'Admin',
});

// Update event
await eventsAPI.updateStatus(eventId, 'Ongoing');

// Delete event
await eventsAPI.delete(eventId);
```

## Database Schema

See `schema.sql` for the complete database schema. Key tables include:

- `users` - Authentication and authorization
- `students` - Extended student information
- `teachers` - Extended teacher information
- `ppdb_registrants` - New student registrations
- `inventory` - School inventory items
- `school_events` - Events and activities
- `sessions` - JWT session management
- `audit_log` - Security audit trail

## Security Features

1. **JWT Authentication**
   - Secure token-based authentication
   - Automatic token expiration (24 hours)
   - Session revocation support

2. **CORS Protection**
   - Configurable allowed origins
   - Secure headers

3. **Input Validation**
   - Server-side validation
   - SQL injection prevention (parameterized queries)

4. **Audit Trail**
   - All CRUD operations logged
   - Track user actions for security

## Migration from localStorage

To migrate from localStorage to the new backend:

### Step 1: Update Component Code

Replace `useLocalStorage` with API calls:

```typescript
// OLD: LocalStorage
const [users, setUsers] = useLocalStorage<User[]>('users', INITIAL_USERS);

// NEW: API
import { usersAPI } from './services/apiService';

useEffect(() => {
  const fetchUsers = async () => {
    const response = await usersAPI.getAll();
    if (response.success) {
      setUsers(response.data || []);
    }
  };
  fetchUsers();
}, []);
```

### Step 2: Update Create/Update/Delete Functions

```typescript
// OLD: LocalStorage
const addUser = (user: User) => {
  setUsers([...users, user]);
};

// NEW: API
const addUser = async (user: User) => {
  const response = await usersAPI.create(user);
  if (response.success) {
    setUsers([...users, response.data!]);
  }
};
```

### Step 3: Update Authentication

```typescript
// OLD: LocalStorage login simulation
const login = (email: string) => {
  const user = users.find(u => u.email === email);
  if (user) {
    setCurrentUser(user);
  }
};

// NEW: API login
const login = async (email: string, password: string) => {
  const response = await authAPI.login(email, password);
  if (response.success) {
    setCurrentUser(response.data!.user);
  }
};
```

## Testing

### Local Development

```bash
# Start local worker with D1
wrangler dev

# This will use the dev environment with:
# - Local D1 database
# - ALLOWED_ORIGIN = *
# - Dev JWT secret
```

### Test API Endpoints

```bash
# Login
curl -X POST https://your-worker.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@malnu.sch.id","password":"admin123"}'

# Get users (requires token)
curl https://your-worker.workers.dev/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create PPDB registration
curl -X POST https://your-worker.workers.dev/api/ppdb_registrants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fullName": "Test Student",
    "nisn": "1234567890",
    "originSchool": "SMP Test",
    "parentName": "Parent",
    "phoneNumber": "08123456789",
    "email": "test@example.com",
    "address": "Test Address"
  }'
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGIN` in wrangler.toml
   - Ensure frontend URL is in allowed origins

2. **Authentication Errors**
   - Verify JWT_SECRET is set correctly
   - Check token expiration (24 hours)
   - Ensure session exists in database

3. **Database Connection**
   - Verify D1 database ID is correct
   - Check bindings in wrangler.toml
   - Ensure tables are created (`/seed` endpoint)

4. **401 Unauthorized**
   - Check token is being sent in headers
   - Verify token is not expired
   - Ensure user status is 'active'

## Production Checklist

- [ ] Change JWT_SECRET to a strong random key
- [ ] Set ALLOWED_ORIGIN to production domain
- [ ] Enable SSL/HTTPS
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Review and audit permissions
- [ ] Test all API endpoints
- [ ] Remove or secure the `/seed` endpoint
- [ ] Set up rate limiting
- [ ] Configure error tracking

## Support

For issues or questions:
1. Check the documentation in this repository
2. Review Cloudflare D1 documentation
3. Check the logs in Cloudflare dashboard
4. Contact the development team

## License

© 2024 MA Malnu Kananga. All rights reserved.
