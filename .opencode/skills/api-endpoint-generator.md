# API Endpoint Generator Skill

## Description
Add new API endpoints to the MA Malnu Kananga project, following both frontend and backend patterns.

## Instructions

When asked to add a new API endpoint:

1. **Frontend - Update apiService.ts**:
   ```typescript
   // Add the endpoint function to apiService.ts

   // Types (add to types.ts or inline)
   export interface NewEndpointRequest {
     field1: string;
     field2: number;
   }

   export interface NewEndpointResponse {
     id: string;
     field1: string;
     field2: number;
     createdAt: string;
   }

   // API function
   export const newEndpointAPI = async (
     params: NewEndpointRequest
   ): Promise<ApiResponse<NewEndpointResponse>> => {
     try {
       const token = getAuthToken();

       const response = await fetch(`${API_BASE_URL}/api/new-endpoint`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
         },
         body: JSON.stringify(params),
       });

       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }

       const data = await response.json();

       return {
         success: true,
         message: 'Success message',
         data: data,
       };
     } catch (error) {
       logger.error('[API] newEndpoint error', error);
       return {
         success: false,
         message: 'Failed to create',
         error: error instanceof Error ? error.message : 'Unknown error',
       };
     }
   };
   ```

2. **Backend - Update worker.js**:
   ```javascript
   // Add the route handler in worker.js

   app.post('/api/new-endpoint', async (c) => {
     try {
       // Verify authentication
       const auth = c.get('auth');
       if (!auth) {
         return c.json({ success: false, message: 'Unauthorized' }, 401);
       }

       // Parse request body
       const body = await c.req.json();

       // Validate input
       if (!body.field1) {
         return c.json({ success: false, message: 'field1 is required' }, 400);
       }

       // Database operation (D1)
       const result = await c.env.DB.prepare(`
         INSERT INTO new_table (field1, field2, user_id)
         VALUES (?, ?, ?)
       `).bind(
         body.field1,
         body.field2,
         auth.user_id
       ).run();

       // Get inserted data
       const data = await c.env.DB.prepare(`
         SELECT * FROM new_table WHERE id = ?
       `).bind(result.meta.last_row_id).first();

       return c.json({
         success: true,
         message: 'Created successfully',
         data: data
       });

     } catch (error) {
       logger.error('new-endpoint error', error);
       return c.json({
         success: false,
         message: 'Internal server error',
         error: error.message
       }, 500);
     }
   });
   ```

3. **Database Schema** (if needed):
   ```sql
   -- Add to schema.sql
   CREATE TABLE IF NOT EXISTS new_table (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     field1 TEXT NOT NULL,
     field2 INTEGER,
     user_id TEXT NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id)
   );

   CREATE INDEX IF NOT EXISTS idx_new_table_user_id ON new_table(user_id);
   CREATE INDEX IF NOT EXISTS idx_new_table_created_at ON new_table(created_at);
   ```

4. **Permissions** (if protected endpoint):
   - Add permission to `src/config/permissions.ts`
   - Update `permissionService.ts` with check function
   - Implement permission check in the service or component
   - Add role-based access control in the backend

5. **Testing**:

   **Frontend test** (in `src/services/__tests__/`):
   ```typescript
   describe('newEndpointAPI', () => {
     it('should call the endpoint with correct parameters', async () => {
       const mockResponse = { id: '123', field1: 'test' };
       global.fetch = vi.fn(() =>
         Promise.resolve({
           ok: true,
           json: () => Promise.resolve(mockResponse),
         } as Response)
       );

       const result = await newEndpointAPI({ field1: 'test', field2: 123 });
       expect(result.success).toBe(true);
     });
   });
   ```

   **Backend test** (in test files):
   ```typescript
   it('should create new record', async () => {
     const response = await app.request('/api/new-endpoint', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({ field1: 'test', field2: 123 }),
     });

     expect(response.status).toBe(200);
     const data = await response.json();
     expect(data.success).toBe(true);
   });
   ```

6. **Best Practices**:

   **Frontend**:
   - Use `ApiResponse<T>` for type safety
   - Include proper TypeScript interfaces
   - Handle authentication via token
   - Log errors with `logger.error`
   - Return consistent response structure
   - Implement error handling

   **Backend**:
   - Validate all inputs
   - Check authentication and permissions
   - Use prepared statements for SQL (prevent injection)
   - Return consistent JSON responses
   - Log errors appropriately
   - Use appropriate HTTP status codes
   - Handle database errors gracefully

   **Database**:
   - Use proper indexes for common queries
   - Use foreign keys for referential integrity
   - Add timestamps (created_at, updated_at)
   - Use transactions for multi-step operations
   - Consider migration scripts for schema changes

7. **Documentation**:
   - Update `docs/api-documentation.md` with the new endpoint
   - Document request/response formats
   - Document authentication requirements
   - Document permissions needed
   - Provide example usage

## Examples

See existing endpoints:
- `worker.js` - Backend route patterns
- `src/services/apiService.ts` - Frontend API patterns
- `src/services/authService.ts` - Auth patterns
- `src/services/ppdbAPI` - CRUD patterns

## Checklist

Before completing an API endpoint addition:
- [ ] Frontend API function added to apiService.ts
- [ ] TypeScript types defined
- [ ] Backend route handler added to worker.js
- [ ] Database table created (if needed)
- [ ] Permissions configured (if needed)
- [ ] Frontend tests written
- [ ] Backend tests written
- [ ] Documentation updated
- [ ] Error handling implemented
- [ ] Authentication/authorization checked
