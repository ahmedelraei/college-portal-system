<!--
Sync Impact Report:
- Version change: Template → 1.0.0
- Initial constitution ratification
- Added 7 core principles aligned with project requirements
- Added 3 governance sections: Technical Standards, Development Workflow, Governance
- Templates requiring updates:
  ✅ plan-template.md - Aligned (includes Constitution Check section)
  ✅ spec-template.md - Aligned (requirements structure matches principles)
  ✅ tasks-template.md - Aligned (phase structure supports modular development)
- Follow-up: Update root package.json engines.node to ">=22"
-->

# College Portal System Constitution

## Core Principles

### I. Modular Architecture & Clean Code

**Principle**: All code MUST be written to senior software engineer standards with emphasis on modularity, separation of concerns, and maintainability.

**Requirements**:
- Each module/component MUST have a single, well-defined responsibility
- Dependencies MUST be explicit and injected (avoid hidden dependencies)
- Code MUST be self-documenting with clear naming conventions
- Avoid code duplication - extract shared logic into reusable utilities
- Follow SOLID principles for object-oriented code
- Prefer composition over inheritance
- Keep functions small and focused (single responsibility)

**Rationale**: Clean, modular code reduces technical debt, improves testability, enables parallel development, and makes the system maintainable as it grows.

### II. Next.js 15 Best Practices

**Principle**: Frontend development MUST follow Next.js 15 best practices, leveraging modern React patterns and Next.js features.

**Requirements**:
- MUST use App Router (not Pages Router) for all new routes
- MUST leverage React Server Components by default; use Client Components only when necessary (interactivity, browser APIs, hooks)
- MUST use Server Actions for mutations instead of API routes where appropriate
- MUST implement proper loading states with `loading.tsx` and error boundaries with `error.tsx`
- MUST optimize images using next/image component
- MUST use dynamic imports and lazy loading for code splitting
- MUST implement proper metadata for SEO using generateMetadata
- MUST use TypeScript with strict mode enabled
- MUST follow file-based routing conventions consistently

**Rationale**: Next.js 15 provides powerful features for performance, SEO, and developer experience. Following best practices ensures optimal bundle sizes, fast page loads, and better user experience.

### III. NestJS 11 Best Practices

**Principle**: Backend development MUST follow NestJS 11 architectural patterns and best practices.

**Requirements**:
- MUST organize code into feature modules (courses, students, registrations, etc.)
- MUST use dependency injection for all services and repositories
- MUST use DTOs (Data Transfer Objects) for request/response validation with class-validator
- MUST implement proper error handling using NestJS exception filters
- MUST use Guards for authentication/authorization
- MUST use Interceptors for cross-cutting concerns (logging, transformation)
- MUST use Pipes for validation and transformation
- MUST follow the controller → service → repository pattern
- MUST implement proper TypeORM entity relationships and migrations
- MUST use environment-based configuration with @nestjs/config

**Rationale**: NestJS enforces a structured, scalable architecture. Following these patterns ensures consistency, testability, and maintainability across the backend codebase.

### IV. Turborepo Monorepo Standards

**Principle**: Monorepo management MUST leverage Turborepo's features for efficient builds, caching, and task orchestration.

**Requirements**:
- MUST define clear workspace boundaries (apps/*, packages/*)
- MUST configure turbo.json with appropriate task pipelines and dependencies
- MUST leverage Turborepo's caching for builds and tests
- MUST use workspace protocol (workspace:*) for internal package dependencies
- MUST keep shared code in packages/ (ui, utils, configs, etc.)
- MUST define build order dependencies explicitly in turbo.json
- MUST use consistent scripts across workspaces (dev, build, lint, test)
- MUST configure appropriate cache invalidation strategies
- MUST document workspace dependencies and build order

**Rationale**: Turborepo provides intelligent caching and parallel execution. Proper configuration dramatically improves CI/CD times and developer experience.

### V. Docker & Containerization Best Practices

**Principle**: All services MUST be containerized following Docker best practices for security, performance, and reproducibility.

**Requirements**:
- MUST use multi-stage builds to minimize final image size
- MUST use specific base image versions (not :latest tags)
- MUST use Alpine Linux variants where possible for smaller images
- MUST run containers as non-root users for security
- MUST leverage Docker layer caching effectively (order Dockerfile commands properly)
- MUST use .dockerignore to exclude unnecessary files
- MUST define health checks for all services
- MUST use Docker Compose for local development orchestration
- MUST separate development and production Dockerfiles where configurations differ significantly
- MUST document all environment variables and their defaults
- MUST use volumes for development hot-reload and persistent data

**Rationale**: Well-crafted Docker configurations ensure consistent environments across development, staging, and production, reduce deployment issues, and improve security posture.

### VI. Code Quality & Type Safety

**Principle**: Code quality MUST be enforced through tooling, type safety, and automated checks.

**Requirements**:
- MUST use TypeScript with strict mode enabled for both frontend and backend
- MUST configure ESLint with project-appropriate rules (extends Next.js config for frontend, NestJS patterns for backend)
- MUST use Prettier for consistent code formatting
- MUST fix all linter errors before committing (max-warnings 0)
- MUST run type checking (tsc --noEmit) as part of CI pipeline
- MUST write self-documenting code with JSDoc comments for public APIs
- MUST validate data at system boundaries (API inputs, database queries)
- MUST handle errors explicitly (no silent failures)
- MUST write unit tests for business logic (WHEN explicitly required by feature spec)
- MUST write integration tests for critical paths (WHEN explicitly required by feature spec)

**Rationale**: TypeScript and automated tooling catch errors early, enforce consistency, and improve code quality without relying solely on code review.

### VII. API & Database Standards

**Principle**: API design and database interactions MUST follow GraphQL and TypeORM best practices for the project's architecture.

**Requirements**:
- MUST use GraphQL with Mercurius for API contracts
- MUST define explicit GraphQL schemas with proper types
- MUST use TypeORM entities with proper decorators and relationships
- MUST write database migrations (never use synchronize in production)
- MUST use repository pattern for database access
- MUST implement proper indexing for frequently queried fields
- MUST use transactions for multi-step database operations
- MUST validate and sanitize all user inputs
- MUST implement proper error messages (friendly to users, detailed in logs)
- MUST use connection pooling appropriately
- MUST implement proper pagination for list endpoints

**Rationale**: Well-designed APIs and database schemas are foundational. GraphQL provides type safety and flexibility, while TypeORM migrations ensure database schema changes are tracked and reproducible.

## Technical Standards

### Node.js Version

**Requirement**: MUST use Node.js 22 LTS or later.

**Enforcement**:
- package.json engines field MUST specify `"node": ">=22"`
- Docker images MUST use Node.js 22 base images
- CI/CD pipelines MUST validate Node version

**Rationale**: Node.js 22 LTS provides performance improvements, security patches, and modern JavaScript features. Enforcing a minimum version ensures consistency across all environments.

### Package Management

**Requirement**: MUST use pnpm as the package manager.

**Enforcement**:
- package.json MUST specify `"packageManager": "pnpm@9.0.0"` or later
- Docker builds MUST use pnpm
- Documentation MUST reference pnpm commands (not npm/yarn)

**Rationale**: pnpm provides faster installs, better disk space efficiency, and strict dependency resolution that prevents phantom dependencies.

### Environment Configuration

**Requirement**: MUST manage configuration through environment variables with proper defaults and validation.

**Enforcement**:
- Backend MUST use @nestjs/config with validation schemas
- Frontend MUST prefix public variables with NEXT_PUBLIC_
- MUST provide .env.example files with all required variables documented
- MUST NOT commit .env files to version control
- Docker Compose MUST define all environment variables explicitly

**Rationale**: Environment-based configuration enables the same codebase to run in different environments (dev, staging, prod) with appropriate settings.

## Development Workflow

### Code Review Standards

**Requirements**:
- All code changes MUST go through pull request review
- PRs MUST pass all automated checks (linting, type checking, tests if present)
- PRs MUST reference related specification documents or tasks
- PRs MUST be reviewed for Constitution compliance
- Breaking changes MUST be documented and approved

**Rationale**: Peer review catches issues, spreads knowledge, and ensures collective ownership of code quality.

### Git Workflow

**Requirements**:
- MUST use feature branches for all development (`###-feature-name` format when working from specs)
- MUST write descriptive commit messages (conventional commits preferred)
- MUST NOT force push to main/master branch
- MUST keep commits atomic and focused
- MUST rebase feature branches on main to maintain clean history (when appropriate)

**Rationale**: Clean Git history aids debugging, rollbacks, and understanding of how the system evolved.

### Documentation Requirements

**Requirements**:
- MUST update README.md when adding new features or changing setup
- MUST document environment variables in .env.example with descriptions
- MUST document API changes in related specification documents
- MUST update architectural decision records when making significant technical choices
- MUST provide quickstart guides for new developers

**Rationale**: Good documentation reduces onboarding time, prevents knowledge silos, and serves as a contract for expected behavior.

## Governance

### Amendment Process

**Rules**:
- Constitution changes MUST be documented with version bump rationale
- MAJOR version: Breaking changes to principles, removal of core standards
- MINOR version: Addition of new principles or significant guidance expansions
- PATCH version: Clarifications, typo fixes, non-semantic improvements
- All amendments MUST update the Sync Impact Report
- Dependent templates MUST be reviewed and updated if affected

**Rationale**: Versioning ensures teams understand when governance rules change and what the impact is.

### Compliance Enforcement

**Rules**:
- All pull requests MUST verify compliance with Constitution principles
- Violations MUST be justified in writing if necessary (with plan to refactor later)
- CI/CD pipelines MUST enforce automated checks (linting, type checking, tests)
- Retrospectives SHOULD review adherence and identify improvement opportunities
- Tooling MUST enforce standards automatically where possible (Prettier, ESLint, TypeScript)

**Rationale**: Principles without enforcement become suggestions. Automated tooling and peer review ensure consistent application.

### Runtime Development Guidance

**Reference**: For detailed implementation guidance and command-line workflows, developers MUST consult:
- `.specify/templates/` for specification and planning templates
- `README.md` and `SETUP.md` for environment setup
- Individual app README files (`apps/backend/README.md`, etc.) for module-specific guidance
- Specification documents in `/specs/` for feature-specific implementation details

**Rationale**: The Constitution defines WHAT and WHY; runtime guidance documents define HOW and WHEN.

---

**Version**: 1.0.0 | **Ratified**: 2026-01-09 | **Last Amended**: 2026-01-09
