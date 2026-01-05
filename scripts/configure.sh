#!/bin/bash

# Configuration Management Script
# This script helps manage environment-specific configurations

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to validate required variables
validate_variables() {
    local env=$1
    print_status "Validating $env environment variables..."
    
    if [ "$env" = "production" ]; then
        # Check for actual production values vs placeholders
        if grep -q "temp-.*-change-in-production-deployment" wrangler.toml; then
            print_warning "Found temporary values in production configuration"
            print_warning "Please set actual production values before deploying to production"
            return 1
        fi
        
        if grep -q "local-.*-for-testing" wrangler.toml; then
            print_warning "Found test database IDs in production configuration"
            print_warning "Please replace with actual database IDs"
            return 1
        fi
    fi
    
    print_status "Environment validation completed"
    return 0
}

# Function to get database ID from Cloudflare
get_database_id() {
    local db_name=$1
    print_status "Fetching database ID for '$db_name'..."
    
    # Extract database ID from Cloudflare
    local db_id=$(wrangler d1 list | grep "$db_name" | grep -o '\b[a-f0-9-]{36}\b' | head -1)
    
    if [ -z "$db_id" ]; then
        print_error "Database '$db_name' not found. Please run: wrangler d1 create $db_name"
        return 1
    fi
    
    echo "$db_id"
}

# Function to update wrangler.toml with actual database IDs
update_database_ids() {
    local env=$1
    local db_name=${2:-"malnu-kananga-db-$env"}
    
    print_status "Updating database IDs for $env environment..."
    
    local db_id=$(get_database_id "$db_name")
    
    if [ -n "$db_id" ]; then
        # Update the database ID in wrangler.toml
        sed -i.bak "/\[env\.$env\.d1_databases\]/,/^$/s/database_id = \".*\"/database_id = \"$db_id\"/" wrangler.toml
        print_status "Updated database ID for $env: $db_id"
        
        # Remove backup file
        rm -f wrangler.toml.bak
    else
        return 1
    fi
}

# Function to create .env file from template
create_env_file() {
    local env=${1:-"development"}
    local env_file=".env"
    
    if [ -f "$env_file" ]; then
        print_warning ".env file already exists. Skipping creation."
        return 0
    fi
    
    print_status "Creating .env file from template..."
    
    cp .env.example "$env_file"
    print_status "Created $env_file. Please update with your actual values."
    
    # Show what needs to be updated
    print_warning "Please update these values in $env_file:"
    grep "=your_.*_here" "$env_file" | sed 's/^/  - /'
}

# Function to seed database
seed_database() {
    local worker_url=${1:-"https://malnu-kananga-worker.cpa01cmz.workers.dev"}
    
    print_status "Seeding database at $worker_url..."
    
    local response=$(curl -s -X POST "$worker_url/seed" \
        -H "Content-Type: application/json")
    
    if echo "$response" | grep -q '"success":true'; then
        print_status "Database seeded successfully!"
    else
        print_error "Database seeding failed:"
        echo "$response"
        return 1
    fi
}

# Main script logic
case "${1:-}" in
    "validate")
        validate_variables "${2:-production}"
        ;;
    "update-db")
        update_database_ids "${2:-production}" "${3:-}"
        ;;
    "create-env")
        create_env_file "${2:-development}"
        ;;
    "seed")
        seed_database "${2:-}"
        ;;
    "setup")
        print_status "Starting complete setup..."
        create_env_file "development"
        update_database_ids "dev"
        validate_variables "dev"
        print_status "Setup completed. Review the configuration before deployment."
        ;;
    *)
        echo "Usage: $0 {validate|update-db|create-env|seed|setup}"
        echo ""
        echo "Commands:"
        echo "  validate [env]     - Validate environment variables (default: production)"
        echo "  update-db [env]    - Update database IDs in wrangler.toml"
        echo "  create-env [env]   - Create .env file from template"
        echo "  seed [worker_url]  - Seed database with initial data"
        echo "  setup              - Run complete setup for development"
        echo ""
        echo "Examples:"
        echo "  $0 setup                    # Complete development setup"
        echo "  $0 validate production      # Validate production config"
        echo "  $0 update-db production     # Update production database ID"
        echo "  $0 seed                     # Seed production database"
        exit 1
        ;;
esac