#!/bin/bash
# Supabase Migration Helper Script

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI could not be found"
    echo "Please install it by running: npm install -g supabase"
    exit 1
fi

# Initialize Supabase project if not already initialized
if [ ! -d "./supabase" ]; then
    echo "Initializing Supabase project..."
    supabase init
fi

# Link to Supabase project (requires project ID)
echo "Linking to Supabase project..."
echo "Please enter your Supabase project ID (or press Enter to skip):"
read project_id

if [ ! -z "$project_id" ]; then
    supabase link --project-ref $project_id
fi

# Apply migrations
echo "Applying database migrations..."
supabase db push

# Start Supabase local development
echo "Starting Supabase local development..."
supabase start

echo "Supabase setup completed!"
echo "You can now access:"
echo "- Supabase Studio: http://localhost:54323"
echo "- Postgres: postgresql://postgres:postgres@localhost:54322/postgres"