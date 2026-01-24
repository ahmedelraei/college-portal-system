# Research: Academic Reports

**Feature**: 002-academic-reports  
**Date**: January 24, 2026

## Technical Decisions

### 1) Export Format and Officialness

**Decision**: Provide a downloadable PDF export labeled “Unofficial Academic Report,” generated on demand from the same dataset used in the on-screen view. Include a footer with generation timestamp and student identifier.

**Rationale**:
- PDF is broadly acceptable for self-service and offline sharing without additional tooling.
- “Unofficial” watermark avoids implying registrar-issued transcripts.
- On-demand generation ensures latest grades/GPA without storing static files.

**Alternatives Considered**:
- No export: reduces scope but conflicts with common student needs.
- CSV export: useful for data analysis but less readable for advising.
- “Official” transcript generation: requires signatures/registrar workflow; deferred.

### 2) GPA Calculation and Retake Handling

**Decision**: Use existing registration `gradePoints` values and course credit hours to compute GPA. Only the latest completed attempt of a retaken course counts toward GPA; previous attempts remain visible and marked as excluded.

**Rationale**:
- Reuses current grading rules and avoids new formula drift.
- Aligns with common registrar policy (latest attempt replaces prior).
- Keeps history transparent while keeping aggregates accurate.

**Alternatives Considered**:
- Average all attempts: inflates workload and contradicts common policy.
- Highest attempt only: similar to latest, but could mask recent declines.
- Storing computed GPA snapshots: unnecessary given real-time calculations.

### 3) Data Retrieval and Performance

**Decision**: Aggregate reports server-side from `registrations` joined to `courses` and `students`, grouping by `year` and `semester`, sorted descending by year then term. Preload course credits to avoid N+1. Cache results per request only (no persistent cache).

**Rationale**:
- Leverages existing schema (year/semester/gradePoints) with minimal changes.
- Server-side grouping keeps client lightweight and reduces over-fetching.
- Avoiding long-lived cache prevents stale GPA after grade changes.

**Alternatives Considered**:
- Client-side grouping: increases payload size and logic duplication.
- Materialized views: adds maintenance; unnecessary for current scale.
- Persistent cache: risks stale GPA after grade updates.

### 4) Access Control and Auditing

**Decision**: Students can access only their own reports via auth context. Admin/advisor roles can access any student’s report; all staff accesses logged with studentId, viewerId, and timestamp.

**Rationale**:
- Matches current role model (students vs admins).
- Audit trail satisfies accountability for sensitive academic data.
- Minimal additional permissions logic required.

**Alternatives Considered**:
- Open access by course instructor only: complicates authorization and not requested.
- Per-department scoping: potentially needed later; out of current scope.
- No audit logging: risky for academic records.

## Resolved Clarifications

- Export will be PDF, marked “Unofficial,” generated on demand; no official transcript workflow in scope.
