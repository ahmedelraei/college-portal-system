# Implementation Plan: Lecture Content LMS

**Branch**: `002-lecture-content-lms` | **Date**: January 24, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-lecture-content-lms/spec.md`

## Summary

Implement a simple LMS feature that allows administrators to create weekly course content (videos, documents, readings, assignments) and students to view and track their progress through the content. Content is organized by weeks within each course and is accessible only to students with paid registrations.

**Technical Approach**: Extend the existing NestJS backend with new entities (Week, LectureContent, ContentProgress) and REST API endpoints. Add file upload support for documents. Create new frontend pages in the admin panel for content management and student-facing pages for content viewing.

## Technical Context

**Language/Version**: TypeScript 5.9+, Node.js 22 LTS  
**Primary Dependencies**: NestJS 11, TypeORM 0.3, Next.js 15, Fastify, class-validator  
**Storage**: PostgreSQL (existing), Local filesystem for uploads (upgradable to S3)  
**Testing**: Jest (existing setup)  
**Target Platform**: Web application (Docker containerized)  
**Project Type**: Monorepo (Turborepo) - apps/backend, apps/frontend  
**Performance Goals**: Content pages load within 3 seconds, file uploads complete within 30 seconds for 50MB  
**Constraints**: Max 50MB file uploads, up to 16 weeks per course, 50 content items per week  
**Scale/Scope**: Existing user base, moderate scale college portal

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Modular Architecture | ✅ PASS | New module `lecture-content` with clear separation |
| II. Next.js 15 Best Practices | ✅ PASS | Using App Router, Server Components where appropriate |
| III. NestJS 11 Best Practices | ✅ PASS | Feature module pattern, DTOs, Guards, Services |
| IV. Turborepo Standards | ✅ PASS | No new workspaces needed, uses existing structure |
| V. Docker Best Practices | ✅ PASS | No Docker changes required, uses existing setup |
| VI. Code Quality | ✅ PASS | TypeScript strict mode, ESLint, Prettier |
| VII. API & Database Standards | ⚠️ NOTE | Using REST (existing pattern) not GraphQL per constitution note |

**Note on API Standards**: The constitution mentions GraphQL with Mercurius, but the existing codebase uses REST APIs exclusively. This implementation follows the established REST patterns for consistency. A future migration to GraphQL could be considered as a separate initiative.

## Project Structure

### Documentation (this feature)

```text
specs/002-lecture-content-lms/
├── plan.md              # This file
├── research.md          # Phase 0 output - technical decisions
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - getting started guide
├── contracts/           # Phase 1 output - OpenAPI spec
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
apps/backend/src/
├── entities/
│   ├── week.entity.ts           # NEW: Week entity
│   ├── lecture-content.entity.ts # NEW: Content item entity
│   └── content-progress.entity.ts # NEW: Progress tracking entity
├── modules/
│   └── lecture-content/         # NEW: Feature module
│       ├── lecture-content.module.ts
│       ├── lecture-content.controller.ts
│       ├── lecture-content.service.ts
│       └── dto/
│           ├── create-week.dto.ts
│           ├── update-week.dto.ts
│           ├── create-content.dto.ts
│           ├── update-content.dto.ts
│           └── mark-progress.dto.ts
└── lib/
    └── services/
        └── file-upload.service.ts # NEW: File handling

apps/frontend/
├── app/
│   ├── courses/
│   │   └── [id]/
│   │       └── content/
│   │           └── page.tsx     # NEW: Student content view
│   └── admin/
│       └── panel/
│           └── courses/
│               └── [id]/
│                   └── content/
│                       └── page.tsx # NEW: Admin content management
├── components/
│   ├── lecture-content/         # NEW: Content components
│   │   ├── week-list.tsx
│   │   ├── content-item.tsx
│   │   ├── progress-indicator.tsx
│   │   └── admin/
│   │       ├── week-form.tsx
│   │       ├── content-form.tsx
│   │       └── content-manager.tsx
└── lib/
    └── api-client.ts            # EXTEND: Add content API methods
```

**Structure Decision**: Follows existing monorepo patterns. New feature module in backend, new pages and components in frontend. No new workspaces required.

## Complexity Tracking

No constitution violations requiring justification. Implementation follows established patterns.
