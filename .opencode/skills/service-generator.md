# TypeScript Service Generator Skill

## Description
Generate a new service file following the MA Malnu Kananga project patterns.

## Instructions

When asked to create a new service:

1. **File Location**: Create the service in `src/services/`

2. **File Structure**: Follow this structure:
   ```typescript
   // serviceName.ts
   // Brief description of what this service does

   import { logger } from '../utils/logger';
   import { errorHandler } from '../utils/errorHandler';
   import type { /* relevant types */ } from '../types';

   // Types
   export interface RequestType {
     // request fields
   }

   export interface ResponseType {
     // response fields
   }

   // Main service functions
   export async function functionName(
     param: RequestType
   ): Promise<ApiResponse<ResponseType>> {
     try {
       logger.info(`[ServiceName] functionName called`, { param });

       // Implementation

       return {
         success: true,
         message: 'Success message',
         data: result
       };
     } catch (error) {
       logger.error('[ServiceName] functionName error', error);
       errorHandler.handleError(error);
       return {
         success: false,
         message: 'Error message',
         error: error instanceof Error ? error.message : 'Unknown error'
       };
     }
   }
   ```

3. **Best Practices**:
   - Use `ApiResponse<T>` for return types
   - Import and use `logger` for logging
   - Use `errorHandler.handleError(error)` for error handling
   - Add TypeScript interfaces for all request/response types
   - Use async/await consistently
   - Export types that are used by other services
   - Handle both success and error cases

4. **Testing**: Always create a test file in `src/services/__tests__/serviceName.test.ts`:
   - Test success cases
   - Test error cases
   - Mock API calls and dependencies
   - Use vitest as the test framework

5. **API Integration**: If the service calls backend APIs:
   - Use the centralized `apiService.ts` for HTTP requests
   - Don't make direct fetch calls
   - Handle authentication tokens via apiService
   - Implement retry logic if needed

6. **Type Safety**:
   - Never use `any` types
   - Use proper TypeScript types for all parameters and returns
   - Export reusable types for other components
   - Use generics when appropriate

## Examples

See existing services:
- `src/services/apiService.ts` - API service patterns
- `src/services/authService.ts` - Authentication patterns
- `src/services/geminiService.ts` - AI integration patterns
- `src/services/speechRecognitionService.ts` - Browser API patterns
