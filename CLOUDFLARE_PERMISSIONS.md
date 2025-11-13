# Required Cloudflare API Token Permissions

Based on our investigation, here are the required permissions for Cloudflare API token to deploy the Worker successfully:

## Worker Deployment Permissions

1. Account Permissions:
   - Workers Scripts: Edit
   - Workers KV Storage: Edit (if using KV)
   - Workers R2 Storage: Edit (if using R2)
   - D1: Edit (for database access)
   - Vectorize: Edit (for AI vector database)

2. Zone Permissions:
   - Workers Routes: Edit (for all zones)

3. User Permissions:
   - User Details: Read
   - Memberships: Read

## How to Set Up Correct Permissions

1. Log in to the Cloudflare dashboard
2. Go to My Profile > API Tokens
3. Create a new token using the "Edit Cloudflare Workers" template
4. Add the additional permissions listed above
5. Restrict the token to specific resources if needed
6. Save the token and use it for deployment

## Common Issues and Solutions

1. "AI binding not found" - Ensure Vectorize permissions are granted
2. "DB binding not found" - Ensure D1 permissions are granted
3. Authentication errors - Verify token has correct scope and is not expired