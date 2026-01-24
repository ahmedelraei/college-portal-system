# Research: Lecture Content LMS

**Feature**: 002-lecture-content-lms  
**Date**: January 24, 2026

## Technical Decisions

### 1. Content Scope: Per-Course Template

**Decision**: Weekly content is defined per course (template) and shared across all semester offerings.

**Rationale**:
- Simpler data model - weeks belong to courses, not registrations
- Reduces administrative overhead (content created once, used for all semesters)
- Aligns with typical LMS patterns (Moodle, Canvas, Blackboard)
- Content access is still controlled per-registration via payment status check

**Alternatives Considered**:
- Per-semester offering: Would require duplicating content for each semester, excessive overhead
- Hybrid (template with overrides): Over-engineering for a simple LMS

### 2. File Storage Strategy

**Decision**: Local filesystem storage with structured directory layout, abstracted behind a service interface.

**Rationale**:
- Simple to implement for initial deployment
- NestJS built-in support via @nestjs/platform-fastify multipart
- Service abstraction allows future migration to S3/GCS without code changes
- Docker volumes provide persistence

**Implementation**:
```text
uploads/
└── lecture-content/
    └── {courseId}/
        └── {weekId}/
            └── {filename-uuid}.{ext}
```

**Alternatives Considered**:
- Database BLOB storage: Poor performance for large files, complicates backups
- S3 from start: Adds complexity and external dependency for MVP
- CDN integration: Premature optimization

### 3. Video Display Approach

**Decision**: External links displayed as clickable cards that open in new tabs. No iframe embedding.

**Rationale**:
- Simplest implementation with consistent UX
- Avoids iframe security restrictions (X-Frame-Options)
- Works with all video platforms (YouTube, Vimeo, custom)
- Users expect video to open in native player

**Alternatives Considered**:
- Iframe embedding: Blocked by many platforms, inconsistent behavior
- Custom video player: Out of scope, requires self-hosting

### 4. Content Type Handling

**Decision**: Single `LectureContent` entity with `contentType` enum and polymorphic content field.

**Rationale**:
- Simple schema, single table
- Content types share most fields (title, description, order)
- Differences handled by `contentType` field and nullable `fileUrl`/`externalUrl`

**Content Types**:
| Type | Storage | Display |
|------|---------|---------|
| `video` | externalUrl (YouTube, Vimeo) | Link card with video icon |
| `document` | fileUrl (uploaded) | Download link with file icon |
| `reading` | textContent or externalUrl | Inline text or link |
| `assignment` | textContent + optional fileUrl | Description with optional attachment |

### 5. Progress Tracking Model

**Decision**: Separate `ContentProgress` entity linking student, content item, and completion timestamp.

**Rationale**:
- Clean separation of concerns
- Efficient queries for progress summaries
- Supports future analytics (time spent, completion rates)
- Unique constraint prevents duplicate progress records

**Schema**:
- studentId (FK to students)
- contentId (FK to lecture_content)
- completedAt (timestamp)
- Unique index on (studentId, contentId)

### 6. Access Control Strategy

**Decision**: Middleware-level check for registration + payment status before serving content.

**Rationale**:
- Centralized access control
- Reuses existing registration/payment logic
- Applied at controller level via Guard

**Flow**:
1. Student requests content for courseId
2. Guard checks: Does student have a paid registration for this course?
3. If yes: proceed; If no: 403 Forbidden with appropriate message

### 7. Admin Authorization

**Decision**: Reuse existing admin role check. All admins can manage all course content.

**Rationale**:
- Matches existing admin functionality (course management, grades)
- Simple for small team
- Course-specific admin permissions deferred to future enhancement

### 8. File Upload Constraints

**Decision**: 50MB max file size, allowed extensions: PDF, DOCX, PPTX, PNG, JPG, JPEG, GIF.

**Rationale**:
- 50MB covers most lecture materials (slides, documents)
- Extension whitelist prevents security risks
- Aligns with spec requirements

**Implementation**:
- Fastify multipart configuration
- File validation pipe in NestJS
- Unique filename generation (UUID + original extension)

## Best Practices Applied

### NestJS Patterns

- **Feature Module**: `LectureContentModule` encapsulates all content logic
- **DTOs**: Separate create/update DTOs with class-validator decorators
- **Guards**: `PaidRegistrationGuard` for content access, `AdminGuard` for management
- **Service Layer**: Business logic in service, controller handles HTTP concerns
- **Repository Pattern**: TypeORM entities with repository injection

### Next.js Patterns

- **App Router**: New pages under `app/courses/[id]/content`
- **Server Components**: Week list and content list for initial load
- **Client Components**: Progress tracking, file upload forms
- **Loading States**: Skeleton components for content loading
- **Error Boundaries**: Handle API failures gracefully

### TypeORM Patterns

- **Relations**: Week → Course (ManyToOne), Content → Week (ManyToOne)
- **Cascades**: Delete content when week deleted
- **Indexes**: courseId on weeks, weekId on content, composite on progress
- **Migrations**: Schema changes via TypeORM migrations

## Deferred Decisions

| Item | Reason | When to Revisit |
|------|--------|-----------------|
| S3 migration | Local storage sufficient for MVP | When scaling beyond single server |
| Course-specific admins | All admins manage all content | When multi-tenant needed |
| Content versioning | Not in MVP scope | If instructor collaboration required |
| Analytics dashboard | Progress tracking captures data | Post-MVP enhancement |
