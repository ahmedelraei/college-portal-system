## Data Model (Existing Entities)

This migration does not change the database schema. The REST layer exposes the same TypeORM entities used by GraphQL.

### User
- Fields: `id`, `email` (unique), `password`, `firstName`, `lastName`, `role` (student/admin), `isActive`, `createdAt`, `updatedAt`
- Relationships: one-to-one with `Student`
- Computed fields for API output: `fullName`, `studentId`, `currentGPA`
- Validation/Constraints: unique `email`; enum `role`

### Student
- Fields: `id`, `studentId` (unique), `userId`, `currentGPA`, `createdAt`, `updatedAt`
- Relationships: one-to-one `User`, one-to-many `Registration`, one-to-many `Payment`
- Computed fields for API output: `firstName`, `lastName`, `email`, `fullName`, `isActive`, `role`
- Validation/Constraints: unique `studentId`

### Course
- Fields: `id`, `courseCode` (unique), `courseName`, `description`, `creditHours`, `pricePerCredit`, `semester` (summer/winter), `isActive`, `createdAt`, `updatedAt`
- Relationships: many-to-many prerequisites (self-referencing), one-to-many `Registration`
- Computed fields for API output: `totalCost`
- Validation/Constraints: unique `courseCode`; enum `semester`

### Registration
- Fields: `id`, `studentId`, `courseId`, `semester`, `year`, `paymentStatus` (pending/paid/failed/refunded), `grade` (A/B/C/D/F/I/W), `gradePoints`, `isCompleted`, `isDropped`, `droppedAt`, `createdAt`, `updatedAt`
- Relationships: many-to-one `Student`, many-to-one `Course`
- Validation/Constraints: unique compound key (`student`, `course`, `semester`, `year`); enums for `paymentStatus`, `grade`
- State transitions:
  - `paymentStatus`: pending → paid/failed; paid → refunded (admin refund)
  - `grade`: null → A/B/C/D/F/I/W; `isCompleted` true when grade assigned
  - `isDropped`: false → true with `droppedAt` set

### Payment
- Fields: `id`, `studentId`, `amount`, `type` (tuition/refund), `method` (credit_card/debit_card/bank_transfer), `status` (pending/processing/completed/failed/cancelled/refunded), `transactionId`, `description`, `metadata`, `failureReason`, `processedAt`, `createdAt`, `updatedAt`
- Relationships: many-to-one `Student`
- Validation/Constraints: enums for `type`, `method`, `status`; `amount` decimal(10,2)
- State transitions:
  - `status`: pending → processing → completed/failed; completed → refunded; pending → cancelled

### SystemSettings
- Fields: `id`, `settingKey` (unique), `settingValue`, `description`, `createdAt`, `updatedAt`
- Usage: feature flags (e.g., registration enabled)
- Validation/Constraints: unique `settingKey`
