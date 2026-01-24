# Data Model: Academic Reports

**Feature**: 002-academic-reports  
**Date**: January 24, 2026

## Entity Relationship Overview

```text
┌──────────┐      ┌─────────────┐      ┌───────────┐
│ Student  │◄────►│ Registration│◄────►│  Course   │
└──────────┘      └─────────────┘      └───────────┘
      ▲                 │  year,semester,grade,gradePoints
      │                 └─────────────┐
      │                               ▼ (derived)
      │                      ┌────────────────────┐
      └──────────────────────│ AcademicReportView │
                             └────────────────────┘
```

- `Registration` already stores year, semester, grade, gradePoints, and links to course (credit hours) and student.
- `AcademicReportView` is a derived structure (not persisted) grouping registrations by academic year and semester with GPA aggregates and course attempts.

## Entities (Existing)

### Student
- **Fields**: id (PK), name, program, currentGPA (existing), intake year, createdAt, updatedAt.
- **Relationships**: One-to-many with registrations.

### Course
- **Fields**: id (PK), courseCode, courseName, creditHours, createdAt, updatedAt.
- **Relationships**: One-to-many with registrations.

### Registration
- **Fields**: id (PK), studentId (FK), courseId (FK), semester (enum: `summer` | `winter`), year (int, 4-digit), grade (enum A/B/C/D/F/I/W), gradePoints (decimal 3,2), isCompleted (bool), isDropped (bool), paymentStatus, createdAt, updatedAt.
- **Constraints**: Unique (student, course, semester, year); gradePoints nullable when no grade; gradePoints provided by existing calculation.
- **Relationships**: Many-to-one to Student and Course.

## Derived View Models

### AcademicReportView
Represents the full report for one student.
- `studentId`: number
- `cumulativeGPA`: number | null
- `totalCredits`: number
- `years`: AcademicYearReport[]

### AcademicYearReport
- `year`: number (e.g., 2024)
- `yearlyGPA`: number | null
- `totalCredits`: number
- `semesters`: SemesterReport[]

### SemesterReport
- `semester`: string (enum: summer, winter)
- `semesterGPA`: number | null
- `totalCredits`: number
- `courses`: CourseAttempt[]

### CourseAttempt
- `courseId`: number
- `courseCode`: string
- `courseName`: string
- `creditHours`: number
- `grade`: string | null
- `gradePoints`: number | null
- `status`: `completed` | `in-progress` | `dropped` | `withdrawn`
- `attemptNumber`: number (1 = earliest) with `isLatestForGpa` flag to mark the attempt counted in GPA
- `updatedAt`: Date

## Validation & Business Rules

- **Year**: 4-digit integer between currentYear-10 and currentYear+1.
- **Semester**: Limited to `summer` or `winter` (aligns with existing registration schema).
- **GPA Calculation**: `sum(gradePoints * creditHours for included attempts) / sum(creditHours)`, rounding to 2 decimals. Attempts with null gradePoints or not `isLatestForGpa` are excluded from numerator/denominator.
- **Retakes**: Only latest completed attempt per course contributes to GPA; prior attempts are flagged `isLatestForGpa = false` but remain visible.
- **Incomplete/Withdrawn**: `grade` = I/W yields `gradePoints = null`; excluded from GPA but displayed with status.
- **In-Progress**: Registrations where `isCompleted = false` show status `in-progress`, grade null, excluded from GPA.
- **Empty State**: If no completed grades, all GPA fields return null and totalCredits = 0.

## Data Retrieval Patterns

- Preload registrations for a student with course relation: `registrations` join `course`.
- Sort by `year` desc, then semester order (`winter` after `summer` or vice versa based on business rule; choose consistent ordering).
- Group server-side into year/semester buckets; mark latest attempt per course by comparing `(courseId, attempt sequence by updatedAt/id)`.

## Potential Extensions (Deferred)

- Add `attemptNumber` persisted in `registrations` if needed for deterministic ordering; otherwise infer by earliest/ latest updatedAt.
- Add `report_exports` audit table if official exports required later.
