# Database Schema Migration Summary

## Overview

The database schema has been updated to use a proper User/Student separation with integer-based IDs as requested.

## Key Changes

### 1. New User Entity (`src/entities/user.entity.ts`)

- **Primary Key**: `id` (integer, auto-increment)
- **Fields**: email, password, firstName, lastName, role, isActive
- **Role Enum**: STUDENT | ADMIN
- **Relationships**: OneToOne with Student (for students only)

### 2. Updated Student Entity (`src/entities/student.entity.ts`)

- **Primary Key**: `id` (integer, auto-increment)
- **Student ID**: `studentId` (integer, unique) - format: 12200207
- **User Reference**: OneToOne relationship with User entity
- **Computed Properties**: Delegates firstName, lastName, email, etc. to User entity

### 3. Authentication Flow

- **Student Login**: Uses integer `studentId` + password
- **Admin Login**: Uses email + password
- **User Creation**: Creates User entity first, then Student entity (if student)

### 4. GraphQL Schema Updates

- Updated all ID fields to use `Int` instead of `ID`/`String`
- Updated input types for integer student IDs
- Maintained backward compatibility for admin operations

### 5. Frontend Updates

- Updated TypeScript interfaces for integer IDs
- Updated form validation (z.coerce.number())
- Updated input types to `number`
- Updated placeholders to show integer format (12200207)

## Database Migration Required

⚠️ **IMPORTANT**: This is a breaking change that requires database migration:

1. **Backup existing data**
2. **Create new User table**
3. **Migrate existing Student data to User/Student structure**
4. **Update foreign key relationships**
5. **Drop old columns from Student table**

## Student ID Format

- **Old Format**: String-based (e.g., "CB2024001")
- **New Format**: Integer-based (e.g., 12200207)
- **Validation**: Removed regex validation, now accepts any positive integer

## Admin Seeding

- Default admin is created in User table with role = ADMIN
- No corresponding Student record for admin users
- Admin login uses email instead of student ID

## Testing

After migration, test:

1. ✅ Admin login with email/password
2. ✅ Student login with integer studentId/password
3. ✅ Student creation from admin panel
4. ✅ Student listing in admin panel
5. ✅ Session management and role-based access

## Rollback Plan

If issues occur:

1. Restore database backup
2. Revert code changes
3. Use previous string-based student ID format

## Next Steps

1. Run database migration scripts
2. Update any existing student IDs to integer format
3. Test all authentication flows
4. Update documentation and API examples
