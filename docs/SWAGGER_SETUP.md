# Swagger UI Integration Guide

 **Created**: 2026-01-15
 **Version**: 3.4.2
 **Status**: Active

## Overview

This guide explains how to set up Swagger UI for the MA Malnu Kananga API. Swagger UI provides an interactive interface for exploring and testing API endpoints based on the OpenAPI 3.0 specification.

**OpenAPI Spec**: [docs/openapi.yaml](./openapi.yaml)

---

## Table of Contents

- [What is Swagger UI?](#what-is-swagger-ui)
- [Quick Start](#quick-start)
- [Setup Options](#setup-options)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [Testing APIs](#testing-apis)
- [Customization](#customization)
- [Production Deployment](#production-deployment)

---

## What is Swagger UI?

Swagger UI is a collection of HTML, JavaScript, and CSS assets that dynamically generate documentation from a Swagger-compliant API (OpenAPI specification).

### Benefits

- **Interactive API Explorer**: Test endpoints directly from the browser
- **Auto-Generated Documentation**: Automatically creates docs from OpenAPI spec
- **Client SDK Generation**: Generate client libraries in various languages
- **Schema Validation**: Validates request/response schemas
- **Developer-Friendly**: Easy to use and understand

---

## Quick Start

### Option 1: Using Swagger UI Online (Fastest)

1. Go to [https://editor.swagger.io/](https://editor.swagger.io/)
2. Click **File → Import URL**
3. Paste your OpenAPI spec URL: `https://your-domain.com/docs/openapi.yaml`
4. View the interactive documentation

### Option 2: Local Development

1. Install Swagger UI:
   ```bash
   npm install swagger-ui-dist
   ```

2. Create an HTML file (`swagger.html`):
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <title>MA Malnu Kananga API - Swagger UI</title>
     <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
     <style>
       html {
         box-sizing: border-box;
         overflow: -moz-scrollbars-vertical;
         overflow-y: scroll;
       }
       *, *:before, *:after {
         box-sizing: inherit;
       }
       body {
         margin: 0;
         padding: 0;
       }
     </style>
   </head>
   <body>
     <div id="swagger-ui"></div>
     <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
     <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
     <script>
       window.onload = function() {
         const ui = SwaggerUIBundle({
           url: "./docs/openapi.yaml",
           dom_id: '#swagger-ui',
           deepLinking: true,
           presets: [
             SwaggerUIBundle.presets.apis,
             SwaggerUIStandalonePreset
           ],
           plugins: [
             SwaggerUIBundle.plugins.DownloadUrl
           ],
           layout: "StandaloneLayout",
           defaultModelsExpandDepth: 1,
           defaultModelExpandDepth: 1,
           displayRequestDuration: true,
           docExpansion: "list",
           filter: true,
           showRequestHeaders: true,
           showCommonExtensions: true,
           tryItOutEnabled: true,
           persistAuthorization: true
         });
       };
     </script>
   </body>
   </html>
   ```

3. Open `swagger.html` in your browser

---

## Setup Options

### Option A: Vite Integration (Recommended)

For development with the existing Vite setup:

1. **Install dependencies**:
   ```bash
   npm install --save-dev vite-plugin-openapi swagger-ui-dist
   ```

2. **Create plugin configuration** (`vite.config.ts`):
   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import { openapi } from 'vite-plugin-openapi';

   export default defineConfig({
     plugins: [
       react(),
       openapi({
         path: './docs/openapi.yaml',
         outputFile: './src/api/openapi.json'
       })
     ]
   });
   ```

3. **Create Swagger UI page** (`src/pages/Swagger.tsx`):
   ```typescript
   import React, { useEffect, useState } from 'react';
   import SwaggerUI from 'swagger-ui-react';
   import 'swagger-ui-react/swagger-ui.css';

   export function Swagger() {
     const [spec, setSpec] = useState(null);

     useEffect(() => {
       fetch('/docs/openapi.yaml')
         .then(response => response.text())
         .then(text => {
           // Parse YAML to JSON (optional, Swagger UI can handle YAML)
           setSpec(text);
         });
     }, []);

     return (
       <div style={{ height: '100vh' }}>
         <SwaggerUI spec={spec} />
       </div>
     );
   }
   ```

4. **Add route** in your router:
   ```typescript
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   import { Swagger } from './pages/Swagger';

   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/api-docs" element={<Swagger />} />
           {/* Other routes */}
         </Routes>
       </BrowserRouter>
     );
   }
   ```

### Option B: Static File Hosting

For simple static hosting:

1. **Clone Swagger UI**:
   ```bash
   cd public
   git clone https://github.com/swagger-api/swagger-ui.git api-docs
   cd api-docs
   npm install
   npm run build
   ```

2. **Copy OpenAPI spec**:
   ```bash
   cp ../docs/openapi.yaml dist/
   ```

3. **Configure index.html** (`public/api-docs/dist/index.html`):
   ```javascript
   window.onload = function() {
     const ui = SwaggerUIBundle({
       url: "./openapi.yaml",
       dom_id: '#swagger-ui',
       // ... configuration
     });
   };
   ```

4. **Access at**: `https://your-domain.com/api-docs`

### Option C: Cloudflare Workers Integration

To serve Swagger UI from the same domain as your API:

1. **Add Swagger UI to worker** (`worker.js`):
   ```javascript
   async function handleSwaggerUI(request) {
     const swaggerHtml = `
       <!DOCTYPE html>
       <html>
       <head>
         <link rel="stylesheet" type="text/css" 
               href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
         <title>MA Malnu Kananga API</title>
       </head>
       <body>
         <div id="swagger-ui"></div>
         <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
         <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
         <script>
           window.onload = function() {
             SwaggerUIBundle({
               url: "https://your-domain.com/docs/openapi.yaml",
               dom_id: '#swagger-ui',
               deepLinking: true,
               presets: [
                 SwaggerUIBundle.presets.apis,
                 SwaggerUIStandalonePreset
               ],
               layout: "StandaloneLayout"
             });
           };
         </script>
       </body>
       </html>
     `;
     
     return new Response(swaggerHtml, {
       headers: {
         'Content-Type': 'text/html',
         'Cache-Control': 'public, max-age=3600'
       }
     });
   }

   // Add to routes:
   const routes = {
     '/api-docs': handleSwaggerUI,
     // ... existing routes
   };
   ```

2. **Add route** to main handler in `worker.js`:
   ```javascript
   if (url.pathname === '/api-docs') {
     return handleSwaggerUI(request);
   }
   ```

3. **Access at**: `https://your-domain.com/api-docs`

---

## Configuration

### Basic Configuration Options

```javascript
SwaggerUIBundle({
  // Required: URL to OpenAPI spec
  url: "./docs/openapi.yaml",
  
  // Required: DOM element ID
  dom_id: '#swagger-ui',
  
  // Enable deep linking
  deepLinking: true,
  
  // Layout preset
  presets: [
    SwaggerUIBundle.presets.apis,
    SwaggerUIStandalonePreset
  ],
  
  // Layout type
  layout: "StandaloneLayout",
  
  // Expand models by default
  defaultModelsExpandDepth: 1,
  
  // Expand first model by default
  defaultModelExpandDepth: 1,
  
  // Display request duration
  displayRequestDuration: true,
  
  // Initial documentation expansion
  docExpansion: "list", // "list", "full", or "none"
  
  // Enable search/filter
  filter: true,
  
  // Show request headers in responses
  showRequestHeaders: true,
  
  // Show common extensions
  showCommonExtensions: true,
  
  // Enable "Try it out" button
  tryItOutEnabled: true,
  
  // Persist authorization across page reloads
  persistAuthorization: true,
  
  // Custom validator URL
  validatorUrl: null // Disable external validator
})
```

### Advanced Configuration

#### Custom CSS

```html
<style>
  .swagger-ui {
    font-family: 'Inter', sans-serif;
  }
  
  .topbar {
    background-color: #1e40af;
  }
  
  .btn.authorize {
    background-color: #3b82f6;
    color: white;
  }
</style>
```

#### Custom Plugins

```javascript
import { RequestSnippetsPlugin } from '@kyleshin/swagger-plugin-request-snippets';

SwaggerUIBundle({
  plugins: [
    RequestSnippetsPlugin
  ],
  pluginsOptions: {
    requestSnippets: {
      languages: ['curl', 'request', 'javascript']
    }
  }
})
```

---

## Authentication

### Bearer Token Authentication

Swagger UI can handle JWT authentication automatically:

1. **Click "Authorize" button** in the top-right
2. **Enter your JWT token** in the dialog:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Click "Authorize"**
4. **Close the dialog**

All API requests will now include the `Authorization: Bearer <token>` header.

### Persisting Authentication

To keep authentication across page reloads:

```javascript
SwaggerUIBundle({
  persistAuthorization: true,
  oauth2RedirectUrl: window.location.origin + '/oauth2-redirect.html'
})
```

### OAuth2 Integration (Future)

If OAuth2 is added in the future:

```javascript
SwaggerUIBundle({
  oauth2RedirectUrl: window.location.origin + '/oauth2-redirect.html',
  oauth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    realm: 'your-realm',
    appName: 'MA Malnu Kananga',
    scopeSeparator: ' ',
    usePkceWithAuthorizationCodeGrant: true
  }
})
```

---

## Testing APIs

### Making Requests

1. **Navigate** to the desired endpoint
2. **Click "Try it out"** button
3. **Fill in** required parameters
4. **Click "Execute"**
5. **View** the response

### Example: Login

1. **Navigate** to `POST /auth/login`
2. **Click "Try it out"**
3. **Enter** credentials:
   ```json
   {
     "email": "admin@example.com",
     "password": "password123"
   }
   ```
4. **Click "Execute"**
5. **Copy** the `token` from the response
6. **Click "Authorize"** and paste the token

### Example: Get Students

1. **Authorize** with your token
2. **Navigate** to `GET /students`
3. **Click "Try it out"**
4. **Add** optional query parameters if needed
5. **Click "Execute"**
6. **View** the list of students

### Downloading Response

Click the **Download** button next to the response to save it as a file.

---

## Customization

### Theming

#### Light Theme (Default)

```javascript
SwaggerUIBundle({
  // Default light theme
  syntaxHighlight: {
    activate: true,
    theme: "monokai"
  }
})
```

#### Dark Theme

```html
<link rel="stylesheet" 
      href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.0/swagger-ui-dark.css">
```

### Custom Logo

```html
<style>
  .topbar-wrapper img {
    content: url('/logo.png');
    height: 40px;
  }
</style>
```

### Custom Title

```javascript
SwaggerUIBundle({
  spec: {
    info: {
      title: "MA Malnu Kananga API",
      description: "School Management System API",
      version: "3.4.2"
    }
  }
})
```

---

## Production Deployment

### Security Considerations

1. **Access Control**: Limit access to `/api-docs` to authorized users
2. **Environment Variables**: Don't expose production URLs in documentation
3. **CORS**: Configure proper CORS headers
4. **Rate Limiting**: Apply rate limiting to documentation access

### Cloudflare Workers Deployment

Add authentication check to Swagger UI handler:

```javascript
async function handleSwaggerUI(request, env) {
  // Check for documentation access permission
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const payload = await JWT.verify(token, env.JWT_SECRET);
  
  if (!payload || payload.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Return Swagger UI
  // ...
}
```

### Nginx Configuration

For traditional hosting:

```nginx
location /api-docs {
  alias /path/to/swagger-ui/dist;
  index index.html;
  try_files $uri $uri/ /index.html;
  
  # Optional: Auth
  # auth_basic "API Documentation";
  # auth_basic_user_file /etc/nginx/.htpasswd;
}
```

### Vercel Deployment

Add to `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api-docs",
      "destination": "/api-docs/index.html"
    },
    {
      "source": "/api-docs/:match*",
      "destination": "/api-docs/:match*"
    }
  ]
}
```

---

## Best Practices

1. **Keep OpenAPI Spec Updated**: Always sync code changes with OpenAPI spec
2. **Use Versioning**: Maintain versioned specs (`openapi-v1.yaml`, `openapi-v2.yaml`)
3. **Generate Clients**: Use `openapi-generator-cli` to generate client SDKs
4. **Test Examples**: Ensure all request examples work
5. **Document Responses**: Include example responses for all status codes
6. **Security First**: Never expose sensitive data in documentation

---

## Related Tools

### OpenAPI Generator

Generate client SDKs:

```bash
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-axios \
  -o ./src/api/generated

# Generate React Query hooks
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-react-query \
  -o ./src/api/generated
```

### Redoc

Alternative documentation renderer:

```html
<!DOCTYPE html>
<html>
<head>
  <title>MA Malnu Kananga API - Redoc</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <redoc spec-url="./docs/openapi.yaml"></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
</body>
</html>
```

### Postman Collection

Import OpenAPI spec into Postman:

1. Open Postman
2. Click **Import**
3. Select **File** tab
4. Choose `docs/openapi.yaml`
5. Postman will create a collection with all endpoints

---

## Troubleshooting

### CORS Errors

**Problem**: Cannot access OpenAPI spec from Swagger UI

**Solution**: Configure CORS headers in your API server

```javascript
// In worker.js
corsHeaders(env.ALLOWED_ORIGIN, requestOrigin)
```

### 404 Not Found

**Problem**: OpenAPI spec URL returns 404

**Solution**: Ensure `docs/openapi.yaml` is deployed and accessible

### Authorization Not Persisting

**Problem**: Must re-enter token on page refresh

**Solution**: Enable `persistAuthorization: true` in Swagger UI config

### Large Spec Loading Slowly

**Problem**: OpenAPI spec takes long time to load

**Solution**:
1. Optimize spec size
2. Use JSON instead of YAML (faster parsing)
3. Enable server-side compression

---

## Related Documentation

- [OpenAPI Specification](./openapi.yaml) - The API specification
- [API Reference](./api-reference.md) - Detailed REST API documentation
- [WebSocket API](./WEBSOCKET_API.md) - Real-time WebSocket documentation
- [Blueprint](../blueprint.md) - System architecture overview

---

**Last Updated**: 2026-01-15
**Version**: 3.2.2
**Maintained By**: Autonomous System Guardian
