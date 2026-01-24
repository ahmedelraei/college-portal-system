# Admin Seeding Documentation

## Overview

The application automatically creates a default admin user on startup if no admin exists in the database. This ensures that there's always an admin account available to manage the system.

## Default Admin Credentials

The default admin is created with the following credentials (configurable via environment variables):

- **Email**: `admin@modernacademy.edu`
- **Password**: `Admin123!`
- **Student ID**: `ADMIN001`
- **Name**: System Administrator

## Environment Variables

You can customize the default admin credentials using these environment variables:

```env
# Default Admin Configuration
DEFAULT_ADMIN_EMAIL=admin@modernacademy.edu
DEFAULT_ADMIN_PASSWORD=Admin123!
DEFAULT_ADMIN_FIRST_NAME=System
DEFAULT_ADMIN_LAST_NAME=Administrator
```

## Security Considerations

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Change Default Password**: The default admin password should be changed immediately after first login
2. **Environment Variables**: In production, use secure environment variables or secrets management
3. **Strong Passwords**: Use strong, unique passwords for admin accounts
4. **Access Logging**: Admin actions are logged for security auditing

## How It Works

1. **Startup Check**: On application startup, the seeder service checks if any admin user exists
2. **Auto-Creation**: If no admin exists, it creates one using the configured credentials
3. **Skip If Exists**: If an admin already exists, the seeding is skipped
4. **Logging**: The process is logged for monitoring and debugging

## Admin Login

Once the application starts, you can log in as admin using:

- **Frontend Admin Login**: `http://localhost:3000/admin/login`
- **GraphQL Playground**: `http://localhost:8080/graphql`

### GraphQL Admin Login Mutation

```graphql
mutation AdminLogin {
  adminLogin(
    adminLoginInput: { email: "admin@modernacademy.edu", password: "Admin123!" }
  ) {
    user {
      id
      email
      firstName
      lastName
      role
    }
    message
  }
}
```

## Admin Capabilities

The default admin can:

- ✅ Log into the admin panel
- ✅ Create new student accounts
- ✅ View all students
- ✅ Manage system settings
- ✅ Access administrative features

## Troubleshooting

### Admin Not Created

If the admin is not created automatically:

1. Check database connectivity
2. Verify environment variables
3. Check application logs for errors
4. Ensure database migrations have run

### Cannot Login

If you cannot log in with default credentials:

1. Verify the admin was created (check database)
2. Ensure you're using the correct email/password
3. Check if credentials were customized via environment variables
4. Try resetting the admin password in the database

### Multiple Admins

The seeding only creates an admin if none exist. To create additional admins:

1. Log in as the default admin
2. Use the admin panel to create additional admin accounts
3. Or use the GraphQL `createStudent` mutation with admin role

## Production Deployment

For production deployment:

1. Set secure environment variables for admin credentials
2. Use a secrets management system
3. Change default passwords immediately
4. Enable audit logging
5. Implement proper backup procedures

## Development

For development, the default credentials are fine, but remember:

- Don't commit real credentials to version control
- Use `.env` files for local development
- Test the seeding process with different configurations
