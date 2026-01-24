## Phase 0 Research Decisions

### Decision 1: REST base path is `/api`
- Decision: Prefix all REST endpoints with `/api` (e.g., `/api/courses`, `/api/auth/login`).
- Rationale: Matches acceptance scenarios in the spec and keeps a clear namespace during migration.
- Alternatives considered: Keep existing controller paths without a prefix; add `/api/v1`.

### Decision 2: JWT is the primary auth mechanism for REST
- Decision: Use JWT bearer tokens for REST requests, matching existing `JwtAuthGuard` usage in controllers.
- Rationale: Controllers already rely on JWT guards; spec explicitly requires preserving JWT tokens.
- Alternatives considered: Session-cookie-only auth; hybrid sessions for all endpoints.

### Decision 3: Standard error response contract
- Decision: Use a consistent JSON error format: `{ statusCode, error, message }` with correct HTTP status codes.
- Rationale: Aligns with NestJS defaults and spec requirement for consistent error responses.
- Alternatives considered: GraphQL-style 200 responses with an `errors` array; custom envelope for every response.

### Decision 4: REST parity with existing GraphQL resolver behavior
- Decision: Map each resolver operation to a REST endpoint, reusing existing services and DTOs.
- Rationale: Ensures functional parity and minimizes business logic drift.
- Alternatives considered: Re-implement business logic per endpoint; remove low-usage operations.

### Decision 5: OpenAPI 3.1 for API documentation
- Decision: Document REST endpoints in OpenAPI 3.1 under `/specs/001-rest-api-refactor/contracts/openapi.yaml`.
- Rationale: Spec requires OpenAPI documentation with request/response examples.
- Alternatives considered: Postman collection only; Markdown-only endpoint lists.
