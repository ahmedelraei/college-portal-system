# Quickstart: Lecture Content LMS

**Feature**: 002-lecture-content-lms  
**Date**: January 24, 2026

## Overview

This guide provides step-by-step instructions for implementing the Lecture Content LMS feature. The feature adds weekly course content management for administrators and content viewing with progress tracking for students.

## Prerequisites

- Existing college portal system running (Docker or local)
- Node.js 22+, pnpm installed
- Database migrations up to date
- Admin and student test accounts available

## Implementation Order

```text
Phase 1: Backend Entities & Base Service
   └── Week, LectureContent, ContentProgress entities
   └── Basic CRUD service methods

Phase 2: Admin API Endpoints
   └── Week management endpoints
   └── Content management endpoints
   └── File upload endpoint

Phase 3: Student API Endpoints
   └── Content access with auth check
   └── Progress tracking endpoints

Phase 4: Frontend Admin Panel
   └── Week management UI
   └── Content management UI
   └── File upload component

Phase 5: Frontend Student View
   └── Course content page
   └── Progress tracking UI
```

## Step-by-Step Implementation

### Phase 1: Backend Entities

#### 1.1 Create Week Entity

```bash
# Location: apps/backend/src/entities/week.entity.ts
```

**Key Points**:
- ManyToOne relation to Course with CASCADE delete
- Unique constraint on (courseId, weekNumber)
- isPublished boolean for visibility control

#### 1.2 Create LectureContent Entity

```bash
# Location: apps/backend/src/entities/lecture-content.entity.ts
```

**Key Points**:
- ContentType enum (video, document, reading, assignment)
- ManyToOne relation to Week with CASCADE delete
- Nullable fields: externalUrl, fileUrl, textContent, description

#### 1.3 Create ContentProgress Entity

```bash
# Location: apps/backend/src/entities/content-progress.entity.ts
```

**Key Points**:
- Composite unique constraint (studentId, contentId)
- completedAt timestamp for tracking when completed

#### 1.4 Register Entities

Update `apps/backend/src/lib/modules/db.module.ts`:
```typescript
entities: [
  // ... existing entities
  Week,
  LectureContent,
  ContentProgress,
],
```

### Phase 2: Backend Module & Service

#### 2.1 Create Module Structure

```bash
mkdir -p apps/backend/src/modules/lecture-content/dto
```

Create files:
- `lecture-content.module.ts`
- `lecture-content.controller.ts`
- `lecture-content.service.ts`
- `dto/create-week.dto.ts`
- `dto/update-week.dto.ts`
- `dto/create-content.dto.ts`
- `dto/update-content.dto.ts`

#### 2.2 Implement Service Methods

**Week Operations**:
- `getWeeksByCourse(courseId, includeUnpublished)`
- `createWeek(courseId, dto)`
- `updateWeek(weekId, dto)`
- `deleteWeek(weekId)`

**Content Operations**:
- `getContentByWeek(weekId)`
- `createContent(weekId, dto)`
- `updateContent(contentId, dto)`
- `deleteContent(contentId)`
- `reorderContent(weekId, items)`

**Progress Operations**:
- `markComplete(studentId, contentId)`
- `removeProgress(studentId, contentId)`
- `getProgressSummary(studentId, courseId)`

#### 2.3 Implement File Upload

Create `apps/backend/src/lib/services/file-upload.service.ts`:
- Configure Fastify multipart
- Validate file type and size (50MB max)
- Generate unique filename with UUID
- Store in `uploads/lecture-content/{courseId}/{weekId}/`
- Return relative file path

### Phase 3: API Controller

#### 3.1 Admin Endpoints (require AdminGuard)

```
POST   /api/courses/:courseId/weeks
GET    /api/courses/:courseId/weeks
GET    /api/courses/:courseId/weeks/:weekId
PATCH  /api/courses/:courseId/weeks/:weekId
DELETE /api/courses/:courseId/weeks/:weekId

POST   /api/weeks/:weekId/content
GET    /api/weeks/:weekId/content
PATCH  /api/weeks/:weekId/content/reorder

GET    /api/content/:contentId
PATCH  /api/content/:contentId
DELETE /api/content/:contentId

POST   /api/content/upload
```

#### 3.2 Student Endpoints (require JwtAuthGuard + paid registration)

```
GET    /api/courses/:courseId/content
POST   /api/content/:contentId/progress
DELETE /api/content/:contentId/progress
GET    /api/courses/:courseId/progress
```

#### 3.3 Create PaidRegistrationGuard

New guard that checks:
1. Student is authenticated
2. Student has registration for the course
3. Registration payment status is 'paid'

### Phase 4: Frontend Admin Panel

#### 4.1 Add Content Management Page

```bash
# Location: apps/frontend/app/admin/panel/courses/[id]/content/page.tsx
```

**Features**:
- List weeks with expand/collapse
- Add/Edit/Delete weeks
- Drag-and-drop reorder (or up/down buttons)
- Publish/Unpublish toggle

#### 4.2 Content Editor Component

```bash
# Location: apps/frontend/components/lecture-content/admin/content-form.tsx
```

**Features**:
- Content type selector
- Dynamic fields based on type
- File upload for documents
- URL input for videos
- Rich text for readings/assignments

#### 4.3 File Upload Component

```bash
# Location: apps/frontend/components/lecture-content/admin/file-upload.tsx
```

**Features**:
- Drag-and-drop zone
- File type validation (client-side)
- Progress indicator
- Error handling

### Phase 5: Frontend Student View

#### 5.1 Course Content Page

```bash
# Location: apps/frontend/app/courses/[id]/content/page.tsx
```

**Features**:
- Week accordion/list view
- Content items with type icons
- Progress indicators per week
- "Mark Complete" buttons

#### 5.2 Update API Client

Add to `apps/frontend/lib/api-client.ts`:

```typescript
export const lectureContentApi = {
  // Admin
  getWeeks: (courseId: number) => apiRequest<Week[]>(`/courses/${courseId}/weeks`),
  createWeek: (courseId: number, data: CreateWeekDto) => ...,
  updateWeek: (courseId: number, weekId: number, data: UpdateWeekDto) => ...,
  deleteWeek: (courseId: number, weekId: number) => ...,
  
  // Content
  getContent: (weekId: number) => ...,
  createContent: (weekId: number, data: CreateContentDto) => ...,
  updateContent: (contentId: number, data: UpdateContentDto) => ...,
  deleteContent: (contentId: number) => ...,
  uploadFile: (file: File, courseId: number, weekId: number) => ...,
  
  // Student
  getCourseContent: (courseId: number) => ...,
  markComplete: (contentId: number) => ...,
  removeProgress: (contentId: number) => ...,
  getProgress: (courseId: number) => ...,
};
```

## Testing Checklist

### Backend Tests

- [ ] Week CRUD operations
- [ ] Unique week number constraint
- [ ] Content CRUD operations
- [ ] Content reordering
- [ ] File upload (valid types, size limit)
- [ ] Progress tracking
- [ ] Access control (admin vs student)
- [ ] Paid registration guard

### Frontend Tests

- [ ] Admin: Create/edit/delete weeks
- [ ] Admin: Add content of each type
- [ ] Admin: Upload files
- [ ] Admin: Reorder content
- [ ] Admin: Publish/unpublish weeks
- [ ] Student: View published content only
- [ ] Student: Mark items complete
- [ ] Student: See progress summary
- [ ] Student: Access denied without paid registration

### Integration Tests

- [ ] Full flow: Admin creates content → Student views → Student marks complete
- [ ] Access control: Unpaid student cannot view content
- [ ] Cascade delete: Deleting week removes content and progress

## Common Issues

### File Upload Not Working

1. Check Fastify multipart is configured
2. Verify uploads directory exists and is writable
3. Check file size limit in Fastify config

### Progress Not Persisting

1. Verify ContentProgress entity is registered
2. Check unique constraint on (studentId, contentId)
3. Verify student authentication

### Content Not Visible to Students

1. Check week isPublished = true
2. Verify student has paid registration
3. Check PaidRegistrationGuard is applied

## Next Steps After Implementation

1. Add navigation links in course dashboard
2. Update admin panel sidebar
3. Add course content link for students
4. Consider adding breadcrumb navigation
5. Add loading skeletons for better UX
