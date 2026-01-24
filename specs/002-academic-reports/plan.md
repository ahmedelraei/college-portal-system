# Implementation Plan: Academic Reports

**Branch**: `002-academic-reports` | **Date**: January 24, 2026 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-academic-reports/spec.md`

## Summary

Deliver an Academic Reports experience that shows a student’s complete grade history organized by academic year and semester, with per-term, per-year, and cumulative GPA plus optional export. Technical approach: add a backend `academic-reports` module that aggregates existing registrations/grades, expose REST endpoints for student self-service and staff views, and build Next.js pages/components to render the hierarchy, GPA metrics, and export option while reusing existing GPA logic.

## Technical Context

**Language/Version**: TypeScript 5.9+, Node.js 22 LTS  
**Primary Dependencies**: NestJS 11, TypeORM 0.3, Next.js 15 (App Router), Fastify, class-validator  
**Storage**: PostgreSQL (reuse students, courses, registrations with grade/gradePoints)  
**Testing**: Jest for backend services; React Testing Library/Playwright for UI smoke where feasible  
**Target Platform**: Web application (Dockerized services)  
**Project Type**: Monorepo (Turborepo: apps/backend, apps/frontend)  
**Performance Goals**: Initial report load <2s for 4-year history; GPA aggregation per request completes <50ms server-side  
**Constraints**: Use existing GPA calculation rules; avoid N+1 queries (preload courses/registrations); export generation (if enabled) completes <5s; no new external services  
**Scale/Scope**: Typical campus load (<=10k students); per student up to ~60 course attempts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Modular Architecture | ✅ PASS | Dedicated `academic-reports` module; clear service/controller separation |
| II. Next.js 15 Best Practices | ✅ PASS | App Router pages; prefer Server Components; client only for interactivity |
| III. NestJS 11 Best Practices | ✅ PASS | Feature module, DTOs, Guards, service-layer aggregation |
| IV. Turborepo Standards | ✅ PASS | Reuse existing apps/frontend & apps/backend; no new workspaces |
| V. Docker Best Practices | ✅ PASS | No new images required; reuse existing compose setup |
| VI. Code Quality | ✅ PASS | TypeScript strict, ESLint/Prettier, data validation at DTO layer |
| VII. API & Database Standards | ⚠️ NOTE | Constitution prefers GraphQL, but current stack uses REST; continue REST for consistency with existing controllers |

**Note on API Standards**: Following existing REST pattern to match current backend; migrating to GraphQL would be a separate initiative.

## Project Structure

### Documentation (this feature)

```text
specs/002-academic-reports/
├── plan.md              # This file
├── research.md          # Phase 0: decisions & clarifications
├── data-model.md        # Phase 1: entities/structures
├── quickstart.md        # Phase 1: implementation steps
├── contracts/
│   └── openapi.yaml     # Phase 1: API contract
└── tasks.md             # Phase 2: created by /speckit.tasks
```

### Source Code (repository root)

```text
apps/backend/src/
├── modules/
│   ├── academic-reports/          # NEW: feature module
│   │   ├── academic-reports.module.ts
│   │   ├── academic-reports.controller.ts
│   │   ├── academic-reports.service.ts
│   │   └── dto/
│   │       ├── report-query.dto.ts        # filters: year/semester/student scope
│   │       └── academic-report.response.ts # view models (year/semester/course lines)
│   └── registrations/             # EXISTING: data source for grades
├── lib/
│   └── services/
│       └── gpa-calculation.service.ts     # EXTEND/REUSE: centralized GPA logic
└── entities/
    └── registration.entity.ts             # EXISTING: semester/year/grade fields

apps/frontend/
├── app/
│   ├── academic-reports/page.tsx          # NEW: student self-service view
│   └── admin/panel/students/[id]/academic-report/page.tsx  # NEW: admin/advisor view
├── components/
│   └── academic-reports/
│       ├── report-tree.tsx                # render year/semester hierarchy
│       ├── gpa-summary.tsx                # semester/year/cumulative metrics
│       ├── export-button.tsx              # optional export trigger
│       └── empty-state.tsx                # no-grades messaging
└── lib/
    └── api-client.ts                      # EXTEND: academic report fetcher
```

**Structure Decision**: Reuse monorepo layout; add a focused backend module for aggregation and lightweight frontend pages/components. No new workspaces or infrastructure changes.

## Complexity Tracking

No constitution violations requiring justification beyond the REST vs GraphQL note (aligned with existing implementation patterns).
