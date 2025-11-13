# Supabase Integration Documentation

This document explains how to use the Supabase integration in the MA Malnu Kananga project.

## Overview

The Supabase integration provides:
1. Authentication services using Supabase Auth
2. Database operations using Supabase Database
3. Environment-based configuration

## Configuration

To enable Supabase integration, you need to set the following environment variables in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_SUPABASE=true
```

## Authentication

The authentication system automatically switches to Supabase when `VITE_USE_SUPABASE=true` is set.

### Usage

```typescript
// Request a magic link login
const result = await AuthService.requestLoginLink('user@example.com');

// Verify a login token (handled automatically by Supabase)
const result = await AuthService.verifyLoginToken(token);

// Check if user is authenticated
const isAuthenticated = await AuthService.isAuthenticated();

// Get current user
const user = await AuthService.getCurrentUser();

// Logout
await AuthService.logout();
```

## Database Operations

The database service provides methods for common operations with student, teacher, and parent profiles, as well as announcements and assignments.

### Usage

```typescript
// Get a student profile
const studentProfile = await SupabaseDatabaseService.getStudentProfile(userId);

// Create a student profile
const newProfile = await SupabaseDatabaseService.createStudentProfile({
  user_id: userId,
  name: 'John Doe',
  nis: '12345',
  class: 'XII IPA 1',
  email: 'john@example.com'
});

// Get announcements
const { data: announcements, count } = await SupabaseDatabaseService.getAnnouncements(10, 0);

// Create an announcement
const newAnnouncement = await SupabaseDatabaseService.createAnnouncement({
  title: 'School Event',
  content: 'Details about the event...',
  author: 'Admin',
  created_by: userId,
  published: true
});
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes (if using Supabase) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes (if using Supabase) |
| `VITE_USE_SUPABASE` | Set to `true` to enable Supabase integration | Yes (to enable) |

## Testing

To test the Supabase integration, run the test script:

```bash
npm run test:supabase
```

## Required Database Tables

The integration expects the following tables to exist in your Supabase database:

1. `student_profiles` - Student profile information
2. `teacher_profiles` - Teacher profile information
3. `parent_profiles` - Parent profile information
4. `announcements` - School announcements
5. `assignments` - Student assignments

## Security Notes

- Never commit your `.env` file to version control
- Use different Supabase projects for development and production
- The anonymous key should only have limited permissions
- Always validate and sanitize data before inserting into the database