# Feature Specification: REST API Migration

**Feature Branch**: `001-rest-api-refactor`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "we need to refactor the whole project to use rest api instead of graphql"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend REST API Implementation (Priority: P1)

As a backend developer, I need all GraphQL resolvers converted to REST controllers so that the API can serve data through standard HTTP endpoints with proper request/response patterns.

**Why this priority**: This is the foundation for the entire migration. Without REST endpoints, the frontend cannot be migrated. This represents the core architectural change.

**Independent Test**: Can be fully tested by making HTTP requests to REST endpoints using tools like Postman or curl. Each endpoint should return the same data as the corresponding GraphQL query/mutation, validating that business logic is preserved.

**Acceptance Scenarios**:

1. **Given** the backend is running, **When** I send a GET request to `/api/courses`, **Then** I receive a JSON array of all courses with the same data structure as the GraphQL `getAllCourses` query
2. **Given** I am authenticated, **When** I send a POST request to `/api/auth/login` with valid credentials, **Then** I receive a JWT token and user data in the response
3. **Given** I have a valid JWT token, **When** I send a GET request to `/api/registrations/me` with the token in the Authorization header, **Then** I receive my registration records
4. **Given** the system has existing data, **When** I query any REST endpoint, **Then** the response matches the exact data structure previously returned by GraphQL queries

---

### User Story 2 - Frontend REST Integration (Priority: P2)

As a frontend developer, I need all components updated to use REST API calls instead of GraphQL queries so that the application continues to function identically to users.

**Why this priority**: Once the backend REST endpoints are available, the frontend must be migrated to use them. This ensures end-to-end functionality and allows removal of GraphQL dependencies.

**Independent Test**: Can be fully tested by interacting with the application UI. All user actions (login, course browsing, registration, etc.) should work exactly as before, with no visible changes to the user experience.

**Acceptance Scenarios**:

1. **Given** I am on the login page, **When** I enter valid credentials and click login, **Then** I am authenticated and redirected to the dashboard (same behavior as with GraphQL)
2. **Given** I am logged in as a student, **When** I navigate to the courses page, **Then** I see all available courses loaded via REST API calls
3. **Given** I am viewing my registrations, **When** I drop a course, **Then** the REST API is called and the UI updates to reflect the change
4. **Given** I am using any feature in the application, **When** I perform any action, **Then** the user experience is identical to the GraphQL implementation

---

### User Story 3 - Cleanup and Documentation (Priority: P3)

As a developer maintaining the codebase, I need all GraphQL-related code and dependencies removed, and documentation updated to reflect the REST architecture.

**Why this priority**: After both backend and frontend are working with REST, cleanup ensures the codebase doesn't have confusing legacy code. Updated documentation helps future developers understand the API structure.

**Independent Test**: Can be fully tested by code inspection and dependency audits. No GraphQL packages should remain in package.json files, no resolver files should exist, and documentation should accurately describe REST endpoints.

**Acceptance Scenarios**:

1. **Given** the migration is complete, **When** I inspect the backend package.json, **Then** I see no GraphQL-related dependencies (@nestjs/graphql, @nestjs/mercurius, mercurius, graphql, etc.)
2. **Given** the migration is complete, **When** I inspect the frontend package.json, **Then** I see no Apollo Client or GraphQL dependencies
3. **Given** I am a new developer, **When** I read the API documentation, **Then** I find clear REST endpoint specifications with request/response examples
4. **Given** the codebase is cleaned up, **When** I search for GraphQL-related files, **Then** I find no resolvers, schema files, or GraphQL configuration

---

### Edge Cases

- What happens when a REST endpoint returns an error? The error response format must include appropriate HTTP status codes and JSON error messages consistent across all endpoints.
- How does the system handle authentication failures? The REST API must return 401 Unauthorized with clear error messages, and the frontend must handle token expiration gracefully.
- What happens during the migration period if both GraphQL and REST endpoints exist temporarily? The system should maintain backward compatibility during the transition phase if needed, or ensure a clean cutover with minimal downtime.
- How are complex GraphQL features (like nested queries, field selection) handled in REST? The REST API should provide equivalent functionality, potentially through query parameters for filtering/sorting and embedded resources in responses.

## Requirements *(mandatory)*

### Functional Requirements

#### Backend Requirements

- **FR-001**: System MUST remove GraphQL configuration from NestJS application module
- **FR-002**: System MUST remove all GraphQL resolver files (auth.resolver.ts, courses.resolver.ts, registrations.resolver.ts, system-settings.resolver.ts)
- **FR-003**: System MUST create or expand REST controllers to handle all functionality currently in GraphQL resolvers
- **FR-004**: REST controllers MUST follow RESTful conventions (GET for queries, POST for creation, PUT/PATCH for updates, DELETE for removal)
- **FR-005**: System MUST maintain identical business logic from GraphQL resolvers in new/updated REST controllers
- **FR-006**: REST endpoints MUST return appropriate HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error)
- **FR-007**: REST endpoints MUST return JSON responses with consistent structure (data, error, message fields where appropriate)
- **FR-008**: System MUST preserve authentication mechanism (JWT tokens) but adapt guards for REST context
- **FR-009**: System MUST preserve authorization mechanism (role-based access control) in REST controllers
- **FR-010**: System MUST remove GraphQL schema file (schema.gql)
- **FR-011**: System MUST update main.ts to remove GraphQL playground logging

#### Frontend Requirements

- **FR-012**: System MUST remove Apollo Client configuration and provider
- **FR-013**: System MUST create a REST API client utility to replace Apollo Client
- **FR-014**: REST API client MUST handle authentication (include JWT tokens in request headers)
- **FR-015**: REST API client MUST handle CORS and credentials (cookies for session-based auth if needed)
- **FR-016**: System MUST convert all GraphQL queries to REST API GET requests
- **FR-017**: System MUST convert all GraphQL mutations to appropriate REST API requests (POST/PUT/DELETE)
- **FR-018**: System MUST update all components using GraphQL queries to use REST API calls
- **FR-019**: System MUST update AuthProvider to use REST endpoints instead of GraphQL mutations/queries
- **FR-020**: System MUST maintain identical UI/UX behavior during and after migration
- **FR-021**: System MUST handle API errors with appropriate user feedback (toast notifications, error states)
- **FR-022**: System MUST implement loading states for REST API calls

#### Cleanup Requirements

- **FR-023**: System MUST remove @nestjs/graphql, @nestjs/mercurius, mercurius, graphql packages from backend package.json
- **FR-024**: System MUST remove @apollo/client, graphql packages from frontend package.json
- **FR-025**: System MUST remove lib/graphql/ directory from frontend
- **FR-026**: System MUST remove apollo-client.ts configuration file from frontend
- **FR-027**: System MUST update README.md to document REST API endpoints instead of GraphQL
- **FR-028**: System MUST remove references to GraphQL Playground from documentation
- **FR-029**: System MUST update Docker configurations if they reference GraphQL-specific environment variables
- **FR-030**: System MUST run linting and type checking to ensure no broken imports remain after GraphQL removal

### Key Entities

This refactoring does not introduce new entities but affects how existing entities are accessed:

- **User/Student**: Authentication and profile data accessed via REST endpoints instead of GraphQL queries
- **Course**: Course catalog and details accessed via REST endpoints
- **Registration**: Student course registrations accessed via REST endpoints
- **Payment**: Payment processing accessed via REST endpoints
- **SystemSettings**: Application settings accessed via REST endpoints

The entity models themselves (TypeORM entities) remain unchanged. Only the API layer changes from GraphQL to REST.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing functionality accessible through REST endpoints completes successfully (100% functional parity)
- **SC-002**: API response times remain within 10% of current GraphQL performance (no significant performance degradation)
- **SC-003**: Zero GraphQL-related packages remain in production dependencies after migration
- **SC-004**: All automated tests pass after migration (if tests exist, they must be updated to use REST endpoints)
- **SC-005**: Users can complete all workflows (login, browse courses, register, view grades, make payments) without noticing any change in functionality
- **SC-006**: Developer documentation includes complete REST API reference with examples for all endpoints
- **SC-007**: Frontend bundle size decreases by at least 50KB after removing Apollo Client and GraphQL dependencies
- **SC-008**: Backend build succeeds without any GraphQL-related linting errors or warnings
- **SC-009**: All API requests receive appropriate HTTP status codes and structured error messages
- **SC-010**: Migration completes with zero data loss and zero downtime (or scheduled maintenance window if required)

## Assumptions

1. **Authentication Mechanism**: The system currently uses JWT tokens for authentication, which will be preserved in the REST implementation. Tokens will be included in the Authorization header as Bearer tokens.

2. **Session Management**: The backend uses Fastify sessions with cookies. This session management will be preserved alongside JWT authentication for REST endpoints.

3. **Database Layer**: The TypeORM entities and database schema remain unchanged. Only the API presentation layer is being refactored.

4. **Error Handling**: REST API will follow standard HTTP status code conventions. GraphQL error handling (which returns 200 with errors in response) will be replaced with appropriate HTTP status codes.

5. **Pagination**: If GraphQL queries currently return all records, REST endpoints will initially maintain this behavior but should add pagination support as a best practice (optional enhancement).

6. **API Versioning**: REST endpoints will be prefixed with `/api` to maintain a clear namespace. API versioning (e.g., `/api/v1/`) can be added as an optional enhancement.

7. **Backward Compatibility**: This is a breaking change. The migration assumes a coordinated deployment where frontend and backend are updated together, or a staged rollout with both APIs running temporarily.

8. **Testing**: Any existing tests will need to be updated. If no automated tests exist, manual testing will validate the migration.

9. **Documentation Format**: REST API documentation will follow OpenAPI/Swagger specification format for consistency and tooling support.

10. **CORS Configuration**: The existing CORS configuration in main.ts will be sufficient for REST API calls from the frontend.
