# Authentication System Documentation

## Overview

This authentication system uses **JWT-based authentication** with **REST APIs** and **native Next.js** features. The system provides secure login/logout functionality for the Modern Academy Student Portal.

## Architecture

### Backend (NestJS + REST)

- **JWT-based authentication** with bearer tokens
- **REST controllers** for authentication operations
- **Password hashing** with bcrypt
- **Student entity** with role-based access

### Frontend (Next.js + REST Fetch)

- **Fetch-based client** for REST communication
- **Native React Context** for state management
- **Custom hooks** for authentication operations
- **Session persistence** via HTTP cookies

## Key Components

### 1. Authentication Provider (`/components/auth/auth-provider.tsx`)

```tsx
<AuthProvider>{/* Your app components */}</AuthProvider>
```

Provides authentication context throughout the app with:

- User state management
- Login/logout functions
- Authentication status checking
- Automatic session validation

### 2. Authentication Hook (`/hooks/useAuth.ts`)

```tsx
const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

### 3. Auth Guard (`/components/auth-guard.tsx`)

```tsx
<AuthGuard requireAuth={true}>{/* Protected content */}</AuthGuard>
```

### 4. Auth Status Component (`/components/auth/auth-status.tsx`)

```tsx
<AuthStatus /> // Shows user info and logout button
<UserProfile /> // Detailed user profile card
```

## Usage Examples

### Protecting Routes

```tsx
// In a protected page
export default function DashboardPage() {
  return (
    <AuthGuard>
      <div>Protected content here</div>
    </AuthGuard>
  );
}
```

### Using Authentication in Components

```tsx
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### Login Form

```tsx
const handleLogin = async (data) => {
  try {
    await login(data); // { studentId, password }
    router.push("/dashboard");
  } catch (error) {
    // Error handling (toast notifications handled automatically)
  }
};
```

## Available Routes

- `/login` - Student login page
- `/dashboard` - Protected dashboard (requires authentication)

## REST Endpoints

- `POST /api/auth/login` - Authenticate user (returns JWT)
- `POST /api/auth/admin/login` - Admin login (returns JWT)
- `GET /api/auth/profile` - Get current user information
- `POST /api/auth/logout` - Logout (client clears token)

## Security Features

- **JWT-based authentication** (bearer tokens for REST requests)
- **Optional HTTP-only cookies** for legacy session support
- **Password hashing** with bcrypt (12 rounds)
- **CSRF protection** via session cookies
- **GraphQL error handling** with user-friendly messages
- **Automatic session validation** on app load

## Session Management

Tokens are managed client-side with the following benefits:

- **Secure**: Tokens are signed and verified server-side
- **Automatic expiry**: Tokens expire based on `JWT_EXPIRES_IN`
- **Revokable**: Tokens can be rotated or invalidated
- **Cross-tab sync**: Token storage syncs across browser tabs

## Development

### Starting the Application

```bash
# Backend (from /apps/backend)
pnpm run start:dev

# Frontend (from /apps/frontend)
pnpm run dev
```

### Environment Variables

```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Testing

### Manual Testing

1. Use existing test credentials to authenticate
2. Visit `/login` to authenticate
3. Navigate to protected routes to verify auth guard
4. Test logout functionality
5. Verify session persistence across browser refreshes

### Test Credentials

```
Student ID: CB2024001
Password: testpass123
```

## Migration from React Query

The system was migrated from React Query to native Next.js for:

- **Reduced bundle size**: Removed unnecessary dependencies
- **Simplified state management**: Direct React context usage
- **Better SSR compatibility**: Native Next.js patterns
- **Improved performance**: Less abstraction layers

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is set correctly on the backend
2. **Auth Errors**: Confirm `Authorization: Bearer <JWT_TOKEN>` is sent
3. **API Errors**: Check network tab for REST error responses
4. **Auth State Not Updating**: Verify AuthProvider wraps your app

### Debug Mode

```tsx
// Use browser devtools network tab to inspect REST requests
```

## Future Enhancements

- [ ] Password reset functionality
- [ ] Remember me option
- [ ] Multi-factor authentication
- [ ] Role-based route protection
- [ ] Session timeout warnings
- [ ] Audit logging
