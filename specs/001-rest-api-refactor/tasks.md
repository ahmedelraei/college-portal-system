---

description: "Task list for REST API migration"
---

# Tasks: REST API Migration

**Input**: Design documents from `/specs/001-rest-api-refactor/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Each task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align shared configuration used by backend + frontend

- [x] T001 Update REST env defaults in `apps/backend/.env`, `apps/backend/.env.example`, `apps/frontend/.env.local`, and `apps/frontend/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core REST infrastructure required before user stories

- [x] T002 [P] Add `/api` global prefix in `apps/backend/src/main.ts`
- [x] T003 [P] Add global HTTP exception filter in `apps/backend/src/lib/filters/http-exception.filter.ts` and register in `apps/backend/src/main.ts`
- [x] T004 [P] Audit REST auth guards for JWT usage in `apps/backend/src/modules/auth/guards/*.ts` and align to bearer token flow

**Checkpoint**: REST foundation is ready for feature work.

---

## Phase 3: User Story 1 - Backend REST API Implementation (Priority: P1) 🎯 MVP

**Goal**: Replace GraphQL resolver behavior with REST endpoints while preserving business logic and response shape.

**Independent Test**: Use curl/Postman to hit REST endpoints; responses match GraphQL data structures.

### Implementation for User Story 1

- [x] T005 [P] [US1] Update auth REST responses in `apps/backend/src/modules/auth/auth.controller.ts` and `apps/backend/src/modules/auth/auth.service.ts`
- [x] T006 [P] [US1] Align courses REST behavior in `apps/backend/src/modules/courses/courses.controller.ts` and `apps/backend/src/modules/courses/courses.service.ts`
- [x] T007 [P] [US1] Align registrations REST behavior in `apps/backend/src/modules/registrations/registrations.controller.ts` and `apps/backend/src/modules/registrations/registrations.service.ts`
- [x] T008 [P] [US1] Align payments REST behavior in `apps/backend/src/modules/payments/payments.controller.ts` and `apps/backend/src/modules/payments/payments.service.ts`
- [x] T009 [P] [US1] Align students REST behavior (admin create/list) in `apps/backend/src/modules/students/students.controller.ts` and `apps/backend/src/modules/students/students.service.ts`
- [x] T010 [US1] Add REST system settings controller in `apps/backend/src/modules/system-settings/system-settings.controller.ts` and wire in `apps/backend/src/modules/system-settings/system-settings.module.ts`

**Checkpoint**: Backend REST endpoints are functional and parity-checked against GraphQL behavior.

---

## Phase 4: User Story 2 - Frontend REST Integration (Priority: P2)

**Goal**: Replace GraphQL usage in the Next.js frontend with REST API calls, preserving UX.

**Independent Test**: Use the UI to login, browse courses, register/drop, and confirm behavior is unchanged.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create REST API client wrapper in `apps/frontend/lib/api-client.ts`
- [x] T012 [P] [US2] Replace Apollo provider usage in `apps/frontend/lib/providers.tsx` and `apps/frontend/app/layout.tsx`
- [x] T013 [P] [US2] Update auth flow in `apps/frontend/hooks/useAuth.ts` and `apps/frontend/components/auth/auth-provider.tsx`
- [x] T014 [P] [US2] Update login pages in `apps/frontend/app/login/page.tsx` and `apps/frontend/app/admin/login/page.tsx`
- [x] T015 [P] [US2] Update course browsing in `apps/frontend/components/course-catalog.tsx` and `apps/frontend/app/courses/page.tsx`
- [x] T016 [P] [US2] Update registration flows in `apps/frontend/components/dashboard.tsx` and `apps/frontend/app/dashboard/page.tsx`
- [x] T017 [P] [US2] Update admin workflows in `apps/frontend/components/admin/course-form.tsx`, `apps/frontend/components/admin/add-student-form.tsx`, `apps/frontend/components/admin/grades-manager.tsx`, and `apps/frontend/app/admin/panel/page.tsx`
- [x] T018 [US2] Ensure loading/error UI states in updated components under `apps/frontend/components/**` and toast handling in `apps/frontend/components/ui/sonner.tsx`

**Checkpoint**: Frontend works end-to-end using REST only.

---

## Phase 5: User Story 3 - Cleanup and Documentation (Priority: P3)

**Goal**: Remove GraphQL-related code/dependencies and update documentation.

**Independent Test**: No GraphQL packages or resolver files remain; docs only reference REST.

### Implementation for User Story 3

- [x] T019 [P] [US3] Remove GraphQL module and schema in `apps/backend/src/app.module.ts` and delete `apps/backend/src/schema.gql`
- [x] T020 [P] [US3] Remove resolver files and providers in `apps/backend/src/modules/**/**.resolver.ts` and `apps/backend/src/modules/**/**.module.ts`
- [x] T021 [P] [US3] Remove GraphQL dependencies from `apps/backend/package.json`
- [x] T022 [P] [US3] Remove Apollo/GraphQL files in `apps/frontend/package.json`, delete `apps/frontend/lib/apollo-client.ts`, and delete `apps/frontend/lib/graphql/`
- [x] T023 [P] [US3] Update docs to REST in `README.md`, `SETUP.md`, and `apps/frontend/README-AUTH.md`
- [x] T024 [P] [US3] Update Docker configs for REST env vars in `docker-compose.yml` and `docker/*.Dockerfile`
- [x] T025 [US3] Run lint/typecheck and fix issues in `apps/backend/src/**` and `apps/frontend/**`

**Checkpoint**: Codebase is GraphQL-free and documentation reflects REST.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate documentation and contracts

- [ ] T026 [P] Validate `specs/001-rest-api-refactor/contracts/openapi.yaml` against implemented routes
- [ ] T027 [P] Update `specs/001-rest-api-refactor/quickstart.md` if endpoints or env vars changed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (REST endpoints required)
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2
- **Polish (Phase 6)**: Depends on User Story 3 completion

### User Story Dependencies

- **US1 (P1)**: REST backend is the MVP foundation
- **US2 (P2)**: Requires US1 endpoints to be stable
- **US3 (P3)**: Cleanup after US1 + US2 are done

### Parallel Opportunities

- Tasks marked [P] can run in parallel within each phase
- US1 module updates (auth/courses/registrations/payments/students) can proceed concurrently
- US2 UI updates can be split by feature area (auth, courses, dashboard, admin)
- US3 cleanup tasks can be parallelized across backend/frontend/docs

---

## Parallel Example: User Story 1

```text
Task: "Update auth REST responses in apps/backend/src/modules/auth/auth.controller.ts and apps/backend/src/modules/auth/auth.service.ts"
Task: "Align courses REST behavior in apps/backend/src/modules/courses/courses.controller.ts and apps/backend/src/modules/courses/courses.service.ts"
Task: "Align registrations REST behavior in apps/backend/src/modules/registrations/registrations.controller.ts and apps/backend/src/modules/registrations/registrations.service.ts"
```

## Parallel Example: User Story 2

```text
Task: "Update auth flow in apps/frontend/hooks/useAuth.ts and apps/frontend/components/auth/auth-provider.tsx"
Task: "Update course browsing in apps/frontend/components/course-catalog.tsx and apps/frontend/app/courses/page.tsx"
Task: "Update admin workflows in apps/frontend/components/admin/course-form.tsx and apps/frontend/app/admin/panel/page.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Remove GraphQL module and schema in apps/backend/src/app.module.ts and delete apps/backend/src/schema.gql"
Task: "Remove Apollo/GraphQL files in apps/frontend/package.json and delete apps/frontend/lib/graphql/"
Task: "Update docs to REST in README.md and SETUP.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate REST endpoints with curl/Postman

### Incremental Delivery

1. US1 (Backend REST) → validate
2. US2 (Frontend REST) → validate
3. US3 (Cleanup + Docs) → validate

---

## Notes

- Each task references concrete file paths
- Tasks are sized for independent execution
- REST endpoints must preserve existing business logic and response shape
