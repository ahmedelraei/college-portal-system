# Quickstart: Academic Reports

**Feature**: 002-academic-reports  
**Date**: January 24, 2026

## Overview
This guide outlines the steps to deliver Academic Reports: year/semester grade history with GPA aggregates, student and staff views, and optional PDF export.

## Prerequisites
- Monorepo set up (apps/backend, apps/frontend) with Node.js 22+ and pnpm.
- Database seeded with students, courses, registrations (grades/gradePoints present).
- Auth roles available for student and admin/advisor.

## Implementation Order

```text
Phase 1: Backend Aggregation
  └── AcademicReportsService: group registrations by year/semester; compute GPA
  └── DTOs/view models for report + filters

Phase 2: Backend Endpoints & Auth
  └── GET /academic-reports/me
  └── GET /academic-reports/students/{id}
  └── Guards for role/scope + audit logging

Phase 3: Export (Optional but planned)
  └── GET /academic-reports/me/export (PDF, unofficial)
  └── GET /academic-reports/students/{id}/export

Phase 4: Frontend Student View
  └── app/academic-reports/page.tsx
  └── Components: report-tree, gpa-summary, empty-state

Phase 5: Frontend Admin/Advisor View
  └── app/admin/panel/students/[id]/academic-report/page.tsx
  └── Reuse components; enforce auth checks

Phase 6: Wiring & Polish
  └── api-client.ts fetchers + error handling
  └── Loading/empty/error states; export button wiring
```

## Step-by-Step Highlights

### Backend
- Add `academic-reports` module, controller, service.
- Service: fetch registrations for student; preload course; group by year/semester; compute GPA using existing gradePoints * creditHours.
- Retake handling: determine latest attempt per course; flag `isLatestForGpa`; include all attempts in response.
- DTOs: `report-query.dto` for optional year/semester filters.
- Export: generate PDF with “Unofficial” watermark, timestamp, student id.

### Frontend
- Student page uses server component to fetch report; client subcomponents for collapsible tree.
- Admin page accepts `studentId` route param; fetch via staff endpoint.
- Show GPA summary at top (semester/year/cumulative) and course rows per term.
- Empty state for no grades; toast/error handling for fetch failures.
- Export button triggers PDF endpoint and downloads file.

### Testing
- Backend service unit tests: GPA calculation, retake rule, empty-state handling.
- Controller e2e test: auth guard enforcement, sample response shape.
- Frontend smoke tests: render tree with sample data, empty state, export button presence.
