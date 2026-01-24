# College Portal Setup Guide

This guide will help you set up the College Portal with JWT-based authentication using REST APIs and NestJS with Fastify.

## Architecture Overview

### Backend (NestJS + Fastify + REST)

- **Framework**: NestJS with Fastify adapter
- **REST**: Controllers with JSON responses
- **Authentication**: JWT bearer tokens
- **Database**: PostgreSQL with TypeORM
- **Session Storage**: Fastify secure sessions

### Frontend (Next.js + REST Fetch)

- **Framework**: Next.js 15 with App Router
- **State Management**: Native React state and hooks
- **API Client**: Fetch-based REST client
- **UI**: Tailwind CSS + Radix UI components
- **Forms**: React Hook Form with Zod validation

## Setup Instructions

### 1. Install Dependencies

#### Backend

```bash
cd apps/backend
pnpm install
```

#### Frontend

```bash
cd apps/frontend
pnpm install
```

### 2. Environment Variables

#### Backend (.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=college_portal

# Session
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
SESSION_SALT=mq9hDxBVDbspDR6n

# Server
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 3. Database Setup

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE college_portal;
```

The TypeORM entities will automatically create the necessary tables when you start the backend.

### 4. Start the Applications

#### Backend (Terminal 1)

```bash
cd apps/backend
pnpm run dev
```

The backend will start on http://localhost:8080

#### Frontend (Terminal 2)

```bash
cd apps/frontend
pnpm run dev
```

The frontend will start on http://localhost:3000

## Key Features Implemented

### JWT-Based Authentication

- ✅ JWT tokens issued on login
- ✅ Authenticated routes require bearer token
- ✅ Logout clears client-side token

### REST API

- ✅ Login endpoint with JWT response
- ✅ Logout endpoint for client-side token cleanup
- ✅ Register endpoint for new users
- ✅ Profile endpoint to get current user

### Frontend Integration

- ✅ REST API client with bearer token support
- ✅ Custom auth hooks with error handling
- ✅ Form validation with Zod
- ✅ Loading states and error messages
- ✅ Automatic redirects based on auth state
- ✅ Auth guard component

### UI/UX

- ✅ Beautiful login page with university branding
- ✅ Loading spinners and disabled states
- ✅ Toast notifications for feedback
- ✅ Responsive design
- ✅ Form validation errors
- ✅ Logout functionality in dashboard

## REST API Examples

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STU001","password":"password123"}'
```

### Get Current User

```bash
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Testing the System

1. **Start both backend and frontend**
2. **Visit http://localhost:3000** - should redirect to login
3. **Try to access http://localhost:3000/dashboard** - should redirect to login
4. **Register a new user** (if needed via REST endpoint)
5. **Login with valid credentials**
6. **Should redirect to dashboard with user info**
7. **Click logout** - should clear session and redirect to login

## Development Tools

- **REST API**: http://localhost:8080/api

## Security Features

1. **Secure JWT Tokens**: Store tokens securely on the client
2. **CORS Protection**: Configured for specific origins
3. **Password Hashing**: bcryptjs with salt rounds
4. **Input Validation**: Class validators and Zod schemas
5. **Error Handling**: Sanitized error messages
6. **Session Expiry**: 24-hour session timeout

## Next Steps

- Add Redis for session storage in production
- Implement password reset functionality
- Add role-based access control
- Add refresh token mechanism
- Implement rate limiting
- Add comprehensive logging
- Add unit and integration tests

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure FRONTEND_URL is set correctly in backend .env
2. **Auth Errors**: Ensure the `Authorization` header is set with `Bearer <JWT_TOKEN>`
3. **API Errors**: Check backend logs for REST error details
4. **Database Connection**: Ensure PostgreSQL is running and connection details are correct
5. **Port Conflicts**: Make sure ports 3000 and 8080 are available

### Debug Mode

Enable debug logging in the backend:

```env
NODE_ENV=development
```

Check browser network tab for REST requests and responses.
