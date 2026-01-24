# Data Model: Lecture Content LMS

**Feature**: 002-lecture-content-lms  
**Date**: January 24, 2026

## Entity Relationship Diagram

```text
┌─────────────┐       ┌─────────────┐       ┌──────────────────┐
│   Course    │       │    Week     │       │  LectureContent  │
├─────────────┤       ├─────────────┤       ├──────────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)          │
│ courseCode  │  │    │ courseId(FK)│◄─┘    │ weekId (FK)      │◄─┐
│ courseName  │  │    │ weekNumber  │       │ title            │  │
│ ...existing │  └───►│ title       │       │ contentType      │  │
└─────────────┘       │ description │       │ externalUrl      │  │
                      │ isPublished │       │ fileUrl          │  │
                      │ createdAt   │       │ textContent      │  │
                      │ updatedAt   │       │ description      │  │
                      └─────────────┘       │ displayOrder     │  │
                                            │ createdAt        │  │
                                            │ updatedAt        │  │
                                            └──────────────────┘  │
                                                                  │
┌─────────────┐       ┌──────────────────┐                        │
│   Student   │       │ ContentProgress  │                        │
├─────────────┤       ├──────────────────┤                        │
│ id (PK)     │──┐    │ id (PK)          │                        │
│ studentId   │  │    │ studentId (FK)   │◄─┘                     │
│ ...existing │  └───►│ contentId (FK)   │◄───────────────────────┘
└─────────────┘       │ completedAt      │
                      │ createdAt        │
                      └──────────────────┘
```

## Entities

### Week

Represents a weekly module within a course containing learning materials.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | number | PK, auto-increment | Primary key |
| courseId | number | FK → courses.id, NOT NULL | Parent course |
| weekNumber | number | NOT NULL | Week sequence (1, 2, 3...) |
| title | string | NOT NULL, max 255 | Week title (e.g., "Introduction to Variables") |
| description | text | nullable | Week overview/summary |
| isPublished | boolean | NOT NULL, default: false | Visibility to students |
| createdAt | timestamp | auto | Creation timestamp |
| updatedAt | timestamp | auto | Last update timestamp |

**Constraints**:
- Unique: (courseId, weekNumber) - no duplicate week numbers per course
- Index: courseId for efficient course-based queries

**Relationships**:
- ManyToOne → Course (a week belongs to one course)
- OneToMany → LectureContent (a week has many content items)

---

### LectureContent

Represents an individual content item within a week.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | number | PK, auto-increment | Primary key |
| weekId | number | FK → weeks.id, NOT NULL | Parent week |
| title | string | NOT NULL, max 255 | Content title |
| contentType | enum | NOT NULL | video, document, reading, assignment |
| externalUrl | string | nullable, max 2048 | External link (videos, external readings) |
| fileUrl | string | nullable, max 512 | Uploaded file path (documents, attachments) |
| textContent | text | nullable | Inline text content (readings, assignment descriptions) |
| description | text | nullable | Additional description/instructions |
| displayOrder | number | NOT NULL, default: 0 | Sort order within week |
| createdAt | timestamp | auto | Creation timestamp |
| updatedAt | timestamp | auto | Last update timestamp |

**Content Type Rules**:
| Type | externalUrl | fileUrl | textContent |
|------|-------------|---------|-------------|
| video | REQUIRED | null | optional |
| document | null | REQUIRED | optional |
| reading | optional | null | REQUIRED (or externalUrl) |
| assignment | null | optional | REQUIRED |

**Constraints**:
- Index: weekId for efficient week-based queries
- Index: (weekId, displayOrder) for ordered retrieval

**Relationships**:
- ManyToOne → Week (content belongs to one week)
- OneToMany → ContentProgress (content has many progress records)

---

### ContentProgress

Tracks student completion of content items.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | number | PK, auto-increment | Primary key |
| studentId | number | FK → students.id, NOT NULL | Student who completed |
| contentId | number | FK → lecture_content.id, NOT NULL | Completed content item |
| completedAt | timestamp | NOT NULL | When marked complete |
| createdAt | timestamp | auto | Record creation timestamp |

**Constraints**:
- Unique: (studentId, contentId) - one progress record per student-content pair
- Index: studentId for student progress queries
- Index: contentId for content analytics

**Relationships**:
- ManyToOne → Student (progress belongs to one student)
- ManyToOne → LectureContent (progress tracks one content item)

---

## Enums

### ContentType

```typescript
enum ContentType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  READING = 'reading',
  ASSIGNMENT = 'assignment',
}
```

---

## Database Tables (PostgreSQL)

### weeks

```sql
CREATE TABLE weeks (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (course_id, week_number)
);

CREATE INDEX idx_weeks_course_id ON weeks(course_id);
```

### lecture_content

```sql
CREATE TABLE lecture_content (
  id SERIAL PRIMARY KEY,
  week_id INTEGER NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'document', 'reading', 'assignment')),
  external_url VARCHAR(2048),
  file_url VARCHAR(512),
  text_content TEXT,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lecture_content_week_id ON lecture_content(week_id);
CREATE INDEX idx_lecture_content_order ON lecture_content(week_id, display_order);
```

### content_progress

```sql
CREATE TABLE content_progress (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES lecture_content(id) ON DELETE CASCADE,
  completed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, content_id)
);

CREATE INDEX idx_content_progress_student ON content_progress(student_id);
CREATE INDEX idx_content_progress_content ON content_progress(content_id);
```

---

## Validation Rules

### Week

- weekNumber: positive integer, >= 1
- title: non-empty, max 255 characters
- description: optional, no max (reasonable limit ~10000 chars)

### LectureContent

- title: non-empty, max 255 characters
- contentType: must be valid enum value
- externalUrl: valid URL format when provided
- fileUrl: valid relative path when provided
- displayOrder: non-negative integer

### ContentProgress

- completedAt: cannot be in the future
- studentId + contentId: must be unique (enforced at DB level)

---

## State Transitions

### Week Publishing

```text
UNPUBLISHED (default) ──[admin publishes]──► PUBLISHED
                                                 │
                                                 │ [admin unpublishes]
                                                 ▼
                                            UNPUBLISHED
```

### Content Progress

```text
NOT_STARTED ──[student marks complete]──► COMPLETED
```

Note: Progress is currently binary. Future enhancement could add `IN_PROGRESS` state.
