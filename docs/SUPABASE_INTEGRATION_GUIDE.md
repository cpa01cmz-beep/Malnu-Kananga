# 📊 Supabase Integration Guide - MA Malnu Kananga

## 🎯 Overview

This guide provides comprehensive documentation for Supabase integration in the MA Malnu Kananga system, including database setup, authentication, and API services.

---

**Guide Version**: 1.0.0  
**Last Updated: November 25, 2025  
**Implementation Status**: ✅ Active  
**Target Audience**: Developers, System Administrators

---

## 🏗️ Architecture Overview

### Supabase Components
- **Authentication**: User authentication and authorization
- **Database**: PostgreSQL database with real-time capabilities
- **Storage**: File storage for documents and media
- **Edge Functions**: Serverless functions for custom logic
- **Realtime**: Real-time data synchronization

### Integration Points
- **Frontend**: React components with Supabase client
- **Backend Services**: API service layer for data operations
- **Authentication**: Magic link authentication system
- **Data Sync**: Bidirectional synchronization with local storage

---

## 🔧 Setup and Configuration

### Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Database Schema
The system uses the following main tables:
- `profiles` - User profiles by role
- `announcements` - School announcements
- `assignments` - Class assignments
- `grades` - Student grades
- `attendance` - Attendance records

### Service Configuration
```typescript
// supabaseConfig.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## 🔐 Authentication Integration

### Magic Link Authentication
The system implements magic link authentication for secure user login:

```typescript
// Login with magic link
const { data, error } = await supabase.auth.signInWithOtp({
  email: userEmail,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
});
```

### User Role Management
Users are assigned roles (student, teacher, parent, admin) that determine their access permissions:

```typescript
// Role-based profile creation
const profileData = {
  id: userId,
  email: userEmail,
  role: userRole,
  full_name: fullName,
  created_at: new Date().toISOString()
};
```

---

## 📊 Database Services

### SupabaseDatabaseService
Core service for database operations:

#### User Profile Operations
```typescript
// Get user profile
static async getUserProfile(userId: string, role: string): Promise<any>

// Create user profile
static async createUserProfile(userId: string, role: string, profileData: any): Promise<any>

// Update user profile
static async updateUserProfile(userId: string, role: string, updates: any): Promise<any>
```

#### Announcement Operations
```typescript
// Get announcements
static async getAnnouncements(limit: number, offset: number): Promise<any>

// Create announcement
static async createAnnouncement(announcement: any): Promise<any>

// Update announcement
static async updateAnnouncement(id: string, updates: any): Promise<any>
```

#### Assignment Operations
```typescript
// Get assignments by class
static async getAssignmentsByClass(classId: string, limit: number, offset: number): Promise<any>

// Create assignment
static async createAssignment(assignment: any): Promise<any>

// Submit assignment
static async submitAssignment(submission: any): Promise<any>
```

---

## 🔄 Data Synchronization

### Local Storage Sync
The system maintains synchronization between Supabase and local storage:

```typescript
// Sync user data
static async syncUserData(localUser: User): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Sync profile data
      await this.syncUserProfile(user.id, localUser.role);
      
      // Sync application data
      await this.syncApplicationData(user.id, localUser.role);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
```

### Real-time Updates
Implement real-time data synchronization:

```typescript
// Subscribe to table changes
const subscription = supabase
  .channel('table_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'announcements' },
    (payload) => {
      // Handle real-time updates
      handleAnnouncementUpdate(payload);
    }
  )
  .subscribe();
```

---

## 🛠️ API Service Layer

### SupabaseApiService
High-level API service that bridges existing components with Supabase:

```typescript
export class SupabaseApiService {
  // User profile operations
  static async getUserProfile(userId: string, role: string): Promise<any>
  static async createUserProfile(userId: string, role: string, profileData: any): Promise<any>
  
  // Announcement operations
  static async getAnnouncements(limit?: number, offset?: number): Promise<any[]>
  static async createAnnouncement(announcement: any): Promise<any>
  
  // Assignment operations
  static async getAssignmentsByClass(classId: string, limit?: number, offset?: number): Promise<any[]>
  static async createAssignment(assignment: any): Promise<any>
  
  // Data synchronization
  static async syncUserData(localUser: User): Promise<void>
}
```

---

## 🔍 Error Handling

### Common Error Scenarios
1. **Authentication Errors**: Handle expired sessions and invalid tokens
2. **Network Errors**: Implement retry logic for failed requests
3. **Permission Errors**: Handle unauthorized access attempts
4. **Data Validation**: Validate data before database operations

### Error Handling Pattern
```typescript
try {
  const result = await SupabaseApiService.getUserProfile(userId, role);
  if (result) {
    // Process successful result
    processProfileData(result);
  }
} catch (error) {
  console.error('Profile fetch failed:', error);
  // Handle error appropriately
  handleProfileError(error);
}
```

---

## 📈 Performance Optimization

### Connection Pooling
- Use Supabase connection pooling for better performance
- Implement connection reuse patterns
- Monitor connection usage metrics

### Caching Strategy
- Cache frequently accessed data in local storage
- Implement cache invalidation on data updates
- Use React Query for server state management

### Query Optimization
- Use specific field selection instead of `*`
- Implement pagination for large datasets
- Add database indexes for common queries

---

## 🔒 Security Considerations

### Row Level Security (RLS)
Implement RLS policies for data access control:

```sql
-- Example RLS policy for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### API Key Management
- Use environment variables for API keys
- Implement key rotation policies
- Monitor API key usage

### Data Validation
- Validate input data on client and server
- Sanitize user inputs
- Implement proper error messages

---

## 🧪 Testing

### Unit Testing
```typescript
// Test Supabase service
describe('SupabaseApiService', () => {
  test('should get user profile', async () => {
    const profile = await SupabaseApiService.getUserProfile('user123', 'student');
    expect(profile).toBeDefined();
    expect(profile.role).toBe('student');
  });
});
```

### Integration Testing
- Test authentication flow end-to-end
- Verify data synchronization
- Test real-time updates

---

## 📊 Monitoring and Analytics

### Performance Metrics
- Query response times
- Authentication success rates
- Data synchronization latency
- Error rates by type

### Logging
- Implement structured logging
- Monitor error patterns
- Track user activity

---

## 🚀 Deployment

### Production Configuration
```typescript
// Production Supabase config
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
```

### Environment Setup
1. **Development**: Use local Supabase instance
2. **Staging**: Use staging Supabase project
3. **Production**: Use production Supabase project

---

## 🔧 Troubleshooting

### Common Issues

#### Authentication Issues
- **Problem**: Magic link not working
- **Solution**: Check email configuration and redirect URLs
- **Code**: Verify email template settings

#### Connection Issues
- **Problem**: Cannot connect to Supabase
- **Solution**: Check API keys and network connectivity
- **Code**: Validate environment variables

#### Data Sync Issues
- **Problem**: Data not syncing properly
- **Solution**: Check RLS policies and user permissions
- **Code**: Verify database schema

### Debug Tools
- Supabase Dashboard logs
- Browser developer tools
- Network request monitoring

---

## 📚 Additional Resources

### Documentation
- [Supabase Official Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

### Best Practices
- Follow Supabase security guidelines
- Implement proper error handling
- Use TypeScript for type safety
- Monitor performance metrics

---

## 🔄 Migration Guide

### From Local Storage to Supabase
1. **Data Export**: Export existing data from local storage
2. **Schema Setup**: Create Supabase database schema
3. **Data Import**: Import data to Supabase tables
4. **Code Update**: Update API calls to use Supabase
5. **Testing**: Verify data integrity and functionality

### Rollback Plan
- Maintain local storage backup
- Implement feature flags for gradual rollout
- Monitor system stability during migration

---

## 📞 Support

### Getting Help
- **Documentation**: Refer to this guide and Supabase docs
- **Community**: Join Supabase Discord community
- **Issues**: Report bugs via GitHub issues
- **Support**: Contact development team for critical issues

### Contributing
- Follow contribution guidelines
- Submit pull requests for improvements
- Document new features and changes
- Participate in code reviews

---

**📊 Supabase Integration Guide - MA Malnu Kananga**

*Comprehensive guide for Supabase database integration*

---

*Last Updated: November 25, 2025*  
*Next Review: February 25, 2026*  
*Maintainer: MA Malnu Kananga Development Team*