export type UserRole = "student" | "admin";

export interface User {
  id: number;
  studentId?: number | null;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt?: string;
  currentGPA?: number | null;
}

export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  creditHours: number;
  semester: "winter" | "summer";
  prerequisites: Course[];
  isActive: boolean;
}

export interface Registration {
  id: number;
  studentId: number;
  courseId: number;
  semester: string;
  year: number;
  paymentStatus: string;
  grade?: string | null;
  gradePoints?: number | null;
  isCompleted: boolean;
  isDropped: boolean;
  droppedAt?: string | null;
  course: Course;
  student?: {
    id: number;
    studentId: number;
    firstName: string;
    lastName: string;
    email: string;
    currentGPA: number;
  };
}

export interface SystemSettings {
  id: number;
  settingKey: string;
  settingValue: string;
  description?: string | null;
}

export type ContentType = 'video' | 'document' | 'reading' | 'assignment';

export interface Week {
  id: number;
  courseId: number;
  weekNumber: number;
  title: string;
  description?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LectureContent {
  id: number;
  weekId: number;
  title: string;
  contentType: ContentType;
  externalUrl?: string | null;
  fileUrl?: string | null;
  textContent?: string | null;
  description?: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentProgress {
  id: number;
  studentId: number;
  contentId: number;
  completedAt: string;
  createdAt: string;
}

export interface WeekWithContent extends Week {
  contents: LectureContent[];
}

export interface CourseContentWithProgress {
  weeks: Array<{
    week: Week;
    content: Array<LectureContent & { isCompleted: boolean; completedAt: string | null }>;
    progress: { completed: number; total: number };
  }>;
}

export interface ProgressSummary {
  courseId: number;
  totalItems: number;
  completedItems: number;
  percentComplete: number;
  weekProgress: Array<{
    weekId: number;
    weekNumber: number;
    title: string;
    completed: number;
    total: number;
  }>;
}
