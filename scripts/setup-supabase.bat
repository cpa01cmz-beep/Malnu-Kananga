@echo off
REM Supabase Migration Helper Script for Windows

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Supabase CLI could not be found
    echo Please install it by running: npm install -g supabase
    exit /b 1
)

REM Initialize Supabase project if not already initialized
if not exist "./supabase" (
    echo Initializing Supabase project...
    supabase init
)

REM Link to Supabase project (requires project ID)
echo Linking to Supabase project...
set /p project_id="Please enter your Supabase project ID (or press Enter to skip): "

if not "%project_id%"=="" (
    supabase link --project-ref %project_id%
)

REM Apply migrations
echo Applying database migrations...
supabase db push

REM Start Supabase local development
echo Starting Supabase local development...
supabase start

echo Supabase setup completed!
echo You can now access:
echo - Supabase Studio: http://localhost:54323
echo - Postgres: postgresql://postgres:postgres@localhost:54322/postgres

pause