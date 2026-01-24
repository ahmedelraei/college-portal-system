# Tasks: Lecture Content LMS

**Input**: Design documents from `/specs/002-lecture-content-lms/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Not explicitly requested in the feature specification. Tasks focus on implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `apps/backend/src/`
- **Frontend**: `apps/frontend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, entities, and module structure

- [x] T001 [P] Create Week entity in `apps/backend/src/entities/week.entity.ts`
- [x] T002 [P] Create LectureContent entity in `apps/backend/src/entities/lecture-content.entity.ts`
- [x] T003 [P] Create ContentProgress entity in `apps/backend/src/entities/content-progress.entity.ts`
- [x] T004 [P] Create ContentType enum in `apps/backend/src/entities/lecture-content.entity.ts`
- [x] T005 Register new entities in `apps/backend/src/lib/modules/db.module.ts`
- [x] T006 Create lecture-content module structure in `apps/backend/src/modules/lecture-content/`
- [x] T007 [P] Create CreateWeekDto in `apps/backend/src/modules/lecture-content/dto/create-week.dto.ts`
- [x] T008 [P] Create UpdateWeekDto in `apps/backend/src/modules/lecture-content/dto/update-week.dto.ts`
- [x] T009 [P] Create CreateContentDto in `apps/backend/src/modules/lecture-content/dto/create-content.dto.ts`
- [x] T010 [P] Create UpdateContentDto in `apps/backend/src/modules/lecture-content/dto/update-content.dto.ts`
- [x] T011 [P] Create ReorderContentDto in `apps/backend/src/modules/lecture-content/dto/reorder-content.dto.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T012 Create base LectureContentService with dependency injection in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T013 Create base LectureContentController with route structure in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T014 Create LectureContentModule and register in AppModule in `apps/backend/src/modules/lecture-content/lecture-content.module.ts` and `apps/backend/src/app.module.ts`
- [x] T015 Create PaidRegistrationGuard for student content access in `apps/backend/src/modules/lecture-content/guards/paid-registration.guard.ts`
- [x] T016 Create FileUploadService for document handling in `apps/backend/src/lib/services/file-upload.service.ts`
- [x] T017 Configure Fastify multipart for file uploads (50MB limit) in `apps/backend/src/main.ts`
- [x] T018 Create uploads directory structure and add to .gitignore
- [x] T019 Add lecture content types to frontend API types in `apps/frontend/lib/api-types.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Student Views Weekly Course Content (Priority: P1) 🎯 MVP

**Goal**: Registered students can access learning materials for their enrolled courses, seeing weekly content modules with proper access control.

**Independent Test**: Log in as a student with a paid registration, navigate to course content, verify weeks and content items display correctly. Verify unpaid students see payment required message.

### Backend Implementation for User Story 1

- [x] T020 [US1] Implement `getCourseContent(courseId, studentId)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T021 [US1] Implement `getWeeksForStudent(courseId)` - returns only published weeks in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T022 [US1] Implement `getContentWithProgress(weekId, studentId)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T023 [US1] Implement `verifyPaidRegistration(studentId, courseId)` helper in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T024 [US1] Add `GET /courses/:courseId/content` endpoint with PaidRegistrationGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`

### Frontend Implementation for User Story 1

- [x] T025 [P] [US1] Add lectureContentApi methods to `apps/frontend/lib/api-client.ts` (getCourseContent, getProgress)
- [x] T026 [P] [US1] Create WeekList component in `apps/frontend/components/lecture-content/week-list.tsx`
- [x] T027 [P] [US1] Create ContentItem component in `apps/frontend/components/lecture-content/content-item.tsx`
- [x] T028 [US1] Create student course content page in `apps/frontend/app/courses/[id]/content/page.tsx`
- [x] T029 [US1] Add content link to student dashboard/course list in `apps/frontend/components/dashboard.tsx`
- [x] T030 [US1] Handle access denied state (unpaid/not enrolled) with appropriate messaging in `apps/frontend/app/courses/[id]/content/page.tsx`
- [x] T031 [US1] Handle empty state (no content yet) with "Content being prepared" message in `apps/frontend/components/lecture-content/week-list.tsx`

**Checkpoint**: Students can view weekly course content for their paid registrations

---

## Phase 4: User Story 2 - Admin Manages Weekly Content Structure (Priority: P2)

**Goal**: Administrators can create, edit, delete, and publish/unpublish weeks for any course.

**Independent Test**: Log in as admin, select a course, add a week, edit the week, toggle publish status, delete a week. Verify changes persist.

### Backend Implementation for User Story 2

- [x] T032 [US2] Implement `getWeeksByCourse(courseId, includeUnpublished)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T033 [US2] Implement `createWeek(courseId, dto)` with unique week number validation in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T034 [US2] Implement `updateWeek(weekId, dto)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T035 [US2] Implement `deleteWeek(weekId)` with cascade delete in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T036 [US2] Implement `getWeekById(weekId)` with content in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T037 [US2] Add `GET /courses/:courseId/weeks` endpoint (admin sees all) in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T038 [US2] Add `POST /courses/:courseId/weeks` endpoint with AdminGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T039 [US2] Add `GET /courses/:courseId/weeks/:weekId` endpoint in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T040 [US2] Add `PATCH /courses/:courseId/weeks/:weekId` endpoint with AdminGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T041 [US2] Add `DELETE /courses/:courseId/weeks/:weekId` endpoint with AdminGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`

### Frontend Implementation for User Story 2

- [x] T042 [P] [US2] Add admin week API methods to `apps/frontend/lib/api-client.ts` (getWeeks, createWeek, updateWeek, deleteWeek)
- [x] T043 [P] [US2] Create WeekForm component in `apps/frontend/components/lecture-content/admin/week-form.tsx`
- [x] T044 [US2] Create ContentManager component (week list with actions) in `apps/frontend/components/lecture-content/admin/content-manager.tsx`
- [x] T045 [US2] Create admin course content page in `apps/frontend/app/admin/panel/courses/[id]/content/page.tsx`
- [x] T046 [US2] Add "Manage Content" link to admin course list in `apps/frontend/app/admin/panel/page.tsx`
- [x] T047 [US2] Implement publish/unpublish toggle in ContentManager in `apps/frontend/components/lecture-content/admin/content-manager.tsx`
- [x] T048 [US2] Add delete confirmation dialog for weeks in `apps/frontend/components/lecture-content/admin/content-manager.tsx`

**Checkpoint**: Admins can fully manage the weekly structure for any course

---

## Phase 5: User Story 3 - Admin Adds Content to Weeks (Priority: P3)

**Goal**: Administrators can add, edit, delete, and reorder content items within weeks. Supports video links, document uploads, readings, and assignments.

**Independent Test**: Log in as admin, select a week, add each content type (video, document, reading, assignment), upload a file, reorder items, edit and delete items.

### Backend Implementation for User Story 3

- [x] T049 [US3] Implement `getContentByWeek(weekId)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T050 [US3] Implement `createContent(weekId, dto)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T051 [US3] Implement `updateContent(contentId, dto)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T052 [US3] Implement `deleteContent(contentId)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T053 [US3] Implement `reorderContent(weekId, items)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T054 [US3] Implement `uploadFile(file, courseId, weekId)` in FileUploadService in `apps/backend/src/lib/services/file-upload.service.ts`
- [x] T055 [US3] Add file type and size validation (PDF, DOCX, PPTX, images, 50MB max) in `apps/backend/src/lib/services/file-upload.service.ts`
- [x] T056 [US3] Add `GET /weeks/:weekId/content` endpoint in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T057 [US3] Add `POST /weeks/:weekId/content` endpoint with AdminGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T058 [US3] Add `GET /content/:contentId` endpoint in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T059 [US3] Add `PATCH /content/:contentId` endpoint with AdminGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T060 [US3] Add `DELETE /content/:contentId` endpoint with AdminGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T061 [US3] Add `PATCH /weeks/:weekId/content/reorder` endpoint with AdminGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T062 [US3] Add `POST /content/upload` endpoint with AdminGuard and multipart handling in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T063 [US3] Add static file serving for uploaded documents in `apps/backend/src/main.ts`

### Frontend Implementation for User Story 3

- [x] T064 [P] [US3] Add admin content API methods to `apps/frontend/lib/api-client.ts` (getContent, createContent, updateContent, deleteContent, reorderContent, uploadFile)
- [x] T065 [P] [US3] Create ContentForm component with type-specific fields in `apps/frontend/components/lecture-content/admin/content-form.tsx`
- [x] T066 [P] [US3] Create FileUpload component with drag-drop and progress in `apps/frontend/components/lecture-content/admin/file-upload.tsx`
- [x] T067 [US3] Integrate ContentForm into ContentManager for add/edit operations in `apps/frontend/components/lecture-content/admin/content-manager.tsx`
- [x] T068 [US3] Implement content reordering (up/down buttons or drag-drop) in `apps/frontend/components/lecture-content/admin/content-manager.tsx`
- [x] T069 [US3] Add content type icons and display formatting in `apps/frontend/components/lecture-content/content-item.tsx`
- [x] T070 [US3] Handle file upload errors and size limit messaging in `apps/frontend/components/lecture-content/admin/file-upload.tsx`

**Checkpoint**: Admins can fully manage content items including file uploads

---

## Phase 6: User Story 4 - Student Tracks Content Progress (Priority: P4)

**Goal**: Students can mark content items as completed and see their progress summary per week and course.

**Independent Test**: Log in as student, view course content, mark items complete, verify progress indicator updates, log out and back in to verify persistence.

### Backend Implementation for User Story 4

- [x] T071 [US4] Implement `markContentComplete(studentId, contentId)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T072 [US4] Implement `removeContentProgress(studentId, contentId)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T073 [US4] Implement `getProgressSummary(studentId, courseId)` service method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T074 [US4] Implement `getWeekProgress(studentId, weekId)` helper method in `apps/backend/src/modules/lecture-content/lecture-content.service.ts`
- [x] T075 [US4] Add `POST /content/:contentId/progress` endpoint with JwtAuthGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T076 [US4] Add `DELETE /content/:contentId/progress` endpoint with JwtAuthGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`
- [x] T077 [US4] Add `GET /courses/:courseId/progress` endpoint with PaidRegistrationGuard in `apps/backend/src/modules/lecture-content/lecture-content.controller.ts`

### Frontend Implementation for User Story 4

- [x] T078 [P] [US4] Add progress API methods to `apps/frontend/lib/api-client.ts` (markComplete, removeProgress, getProgressSummary)
- [x] T079 [P] [US4] Create ProgressIndicator component in `apps/frontend/components/lecture-content/progress-indicator.tsx`
- [x] T080 [US4] Add "Mark as Complete" button to ContentItem component in `apps/frontend/components/lecture-content/content-item.tsx`
- [x] T081 [US4] Add week progress summary (X/Y completed) to WeekList component in `apps/frontend/components/lecture-content/week-list.tsx`
- [x] T082 [US4] Add overall course progress to content page header in `apps/frontend/app/courses/[id]/content/page.tsx`
- [x] T083 [US4] Implement optimistic UI updates for progress marking in `apps/frontend/components/lecture-content/content-item.tsx`

**Checkpoint**: Students can track their progress through course content

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T084 [P] Add loading skeletons for content pages in `apps/frontend/components/lecture-content/`
- [x] T085 [P] Add error boundaries for content components in `apps/frontend/app/courses/[id]/content/error.tsx`
- [x] T086 [P] Add loading state file `apps/frontend/app/courses/[id]/content/loading.tsx`
- [x] T087 Add breadcrumb navigation to content pages
- [x] T088 Add seed data for lecture content in `apps/backend/src/lib/services/seeder.service.ts`
- [x] T089 Update README.md with LMS feature documentation
- [x] T090 Run manual validation per quickstart.md test scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup) ─────────────────────────────────────────────────────────►
                 │
                 ▼
Phase 2 (Foundational) ──────────────────────────────────────────────────►
                 │
                 ├──────────────────┬──────────────────┬─────────────────┐
                 ▼                  ▼                  ▼                 ▼
         Phase 3 (US1)      Phase 4 (US2)      Phase 5 (US3)     Phase 6 (US4)
         Student View       Admin Weeks        Admin Content     Progress Track
                 │                  │                  │                 │
                 └──────────────────┴──────────────────┴─────────────────┘
                                            │
                                            ▼
                                    Phase 7 (Polish)
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational. For full testing, needs US2/US3 to create content, or seed data.
- **User Story 2 (P2)**: Depends on Foundational. Independently testable.
- **User Story 3 (P3)**: Depends on Foundational and US2 (needs weeks to add content to). Independently testable after US2.
- **User Story 4 (P4)**: Depends on Foundational and US1 (needs content view). Independently testable after US1.

### Practical Implementation Order

For MVP delivery, implement in this order:

1. **Phase 1 + 2**: Setup + Foundational
2. **Phase 4 (US2)**: Admin creates weeks first
3. **Phase 5 (US3)**: Admin adds content
4. **Phase 3 (US1)**: Students can view content (content now exists)
5. **Phase 6 (US4)**: Progress tracking
6. **Phase 7**: Polish

### Parallel Opportunities

**Within Phase 1 (all can run in parallel):**

```
T001, T002, T003, T004 (entities)
T007, T008, T009, T010, T011 (DTOs)
```

**Within Phase 3 Backend/Frontend (after T024):**

```
T025, T026, T027 (frontend components)
```

**Within Phase 4 Backend/Frontend (after T041):**

```
T042, T043 (frontend API + component)
```

**Within Phase 5 Backend/Frontend (after T063):**

```
T064, T065, T066 (frontend API + components)
```

**Within Phase 6 Backend/Frontend (after T077):**

```
T078, T079 (frontend API + component)
```

**Within Phase 7 (all can run in parallel):**

```
T084, T085, T086 (loading/error states)
```

---

## Implementation Strategy

### MVP First (US2 + US3 + US1)

1. Complete Phase 1: Setup (entities, DTOs)
2. Complete Phase 2: Foundational (module, guards, file service)
3. Complete Phase 4: US2 - Admin can create weeks
4. Complete Phase 5: US3 - Admin can add content
5. Complete Phase 3: US1 - Students can view content
6. **STOP and VALIDATE**: Test end-to-end flow
7. Deploy/demo MVP

### Add Progress Tracking

8. Complete Phase 6: US4 - Progress tracking
9. Complete Phase 7: Polish
10. Full feature complete

### Task Summary

| Phase     | User Story          | Task Count | Parallel Tasks |
| --------- | ------------------- | ---------- | -------------- |
| 1         | Setup               | 11         | 9              |
| 2         | Foundational        | 8          | 0              |
| 3         | US1 - Student View  | 12         | 3              |
| 4         | US2 - Admin Weeks   | 17         | 2              |
| 5         | US3 - Admin Content | 22         | 3              |
| 6         | US4 - Progress      | 13         | 2              |
| 7         | Polish              | 7          | 3              |
| **Total** |                     | **90**     | **22**         |

---

## Notes

- [P] tasks = different files, no dependencies - can execute in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Admin stories (US2, US3) should be implemented before student view (US1) for practical testing
