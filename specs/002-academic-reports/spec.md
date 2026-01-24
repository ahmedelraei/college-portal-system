# Feature Specification: Academic Reports (Grade History)

**Feature Branch**: `002-academic-reports`  
**Created**: 2026-01-24  
**Status**: Draft  
**Input**: User description: "add feature for acedmic reports that will be all history of grades structured into years and semester (as sub element of year). Academic Reports is already in nav menu but disabled also admin have some simple implementation of GPA's of each course."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Student views academic history (Priority: P1)

A enrolled student opens Academic Reports to review all completed courses organized by academic year and semester, seeing grades, credits, and status for each course they have taken.

**Why this priority**: Students need a consolidated, official-like view of their performance to track progress and prepare for advising or applications.

**Independent Test**: Log in as a student with historical grades; navigate to Academic Reports and verify the full year/semester tree renders with course rows and grades without needing any admin actions.

**Acceptance Scenarios**:

1. **Given** a student with multiple semesters of graded courses, **When** they open Academic Reports, **Then** years expand to show semesters with course rows including grade, credit hours, and status.
2. **Given** a student with no grades yet, **When** they open Academic Reports, **Then** a friendly empty-state message appears and no error is shown.

---

### User Story 2 - Student monitors GPA per term (Priority: P2)

Students want to understand their performance trends, so they view GPA aggregated per semester, per academic year, and cumulative overall from the Academic Reports page.

**Why this priority**: GPA visibility drives academic planning and keeps calculations consistent with existing grade records.

**Independent Test**: For a student with known grades and credit weights, verify displayed semester GPA, yearly GPA, and cumulative GPA match expected calculations without needing admin input.

**Acceptance Scenarios**:

1. **Given** a student with completed courses in a semester, **When** they open Academic Reports, **Then** the semester GPA is displayed beside that term and matches the gradebook calculation.
2. **Given** a student with multiple years of data, **When** they view the report, **Then** each academic year shows a yearly GPA and the header shows a cumulative GPA.

---

### User Story 3 - Admin/advisor reviews a student record (Priority: P3)

An admin or advisor opens a specific student profile and views the Academic Report to counsel the student or verify progress.

**Why this priority**: Staff need the same structured view to support decisions without re-computing GPAs manually.

**Independent Test**: As an admin, select a student with historical grades; open Academic Reports from their profile and confirm the same data and GPAs appear as the student sees.

**Acceptance Scenarios**:

1. **Given** an admin with permission, **When** they open Academic Reports for a student, **Then** the year/semester hierarchy and GPA metrics are visible and identical to the student’s view.
2. **Given** an admin lacks permission for a student outside their scope, **When** they attempt access, **Then** access is denied with an appropriate message.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Student has no completed grades yet (new enrollee or all in-progress).
- Course grade is pending/under review; show “In progress” and exclude from GPA until finalized.
- Course retaken: display attempt history and ensure GPA uses the latest graded attempt.
- Grade change after publication; report reflects the updated grade and GPA recalculation.
- Transfer credits or pass/fail courses without grade points; handle display and GPA weighting correctly.
- Unauthorized access (student trying to view another student’s report or unauthenticated user).

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST enable the “Academic Reports” navigation entry for authenticated students and authorized staff.
- **FR-002**: System MUST present academic history grouped by academic year → semester → course rows including course title, code, credit hours, grade, pass/fail status, and attempt number when applicable.
- **FR-003**: System MUST compute and display GPA per semester, per academic year, and cumulative overall, using the existing grade/GPA rules already applied in the system.
- **FR-004**: System MUST show a clear empty state when a student has no completed grades.
- **FR-005**: System MUST handle retaken courses by indicating prior attempts and using the latest graded attempt in GPA calculations (earlier attempts visible but excluded from GPA aggregates).
- **FR-006**: System MUST allow authorized staff to view a specific student’s academic report while preventing students from viewing other students’ reports.
- **FR-007**: System MUST update displayed GPAs within one refresh after a grade is added or changed in the gradebook/registrations module.
- **FR-008**: System MUST allow filtering or quick navigation by academic year/semester for long histories (e.g., collapsing/expanding).
- **FR-009**: System SHOULD offer a PDF export of the academic report labeled “Unofficial,” generated on demand with timestamp and student identifier.

### Key Entities *(include if feature involves data)*

- **Student**: Represents an enrolled learner; attributes include id, name, program/major, intake year, current cumulative GPA.
- **AcademicYear**: Groups semesters within a school year; attributes include label (e.g., 2024/2025) and list of semesters.
- **SemesterRecord**: Represents a term within an academic year; attributes include term name (e.g., Fall, Spring), start/end dates, semester GPA, link to course grades.
- **CourseGrade**: Represents a student’s outcome in a course; attributes include course id/code, title, credit hours, grade value/points, pass/fail flag, attempt number, semester association.
- **ReportAccessContext**: Represents the viewer context (self vs staff) for authorization and audit logging.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Students reach their full academic report within 3 clicks from the dashboard and see content load in under 2 seconds for a 4-year history.
- **SC-002**: GPA values displayed (semester, yearly, cumulative) match backend grade calculations within ±0.01 for 100% of tested student samples.
- **SC-003**: 95% of students with at least one graded course can view a complete year/semester breakdown without errors or missing courses.
- **SC-004**: 90% of authorized staff test cases confirm they can access permitted student reports while unauthorized access attempts are blocked/logged.
- **SC-005**: If export is provided, 90% of sampled reports generate successfully within 5 seconds with correct GPA figures.
