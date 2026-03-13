"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Users,
  UserPlus,
  LogOut,
  GraduationCap,
  Mail,
  Calendar,
  Shield,
  BookOpen,
  Award,
  ClipboardList,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AddStudentForm } from "@/components/admin/add-student-form";
import { EditStudentForm } from "@/components/admin/edit-student-form";
import { AddProfessorForm } from "@/components/admin/add-professor-form";
import { EditProfessorForm } from "@/components/admin/edit-professor-form";
import { CourseForm } from "@/components/admin/course-form";
import { GradesManager } from "@/components/admin/grades-manager";
import {
  coursesApi,
  studentsApi,
  professorsApi,
  systemSettingsApi,
  registrationsApi,
} from "@/lib/api-client";
import type { Course, User, Registration } from "@/lib/api-types";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | undefined>();
  const [isAddProfessorOpen, setIsAddProfessorOpen] = useState(false);
  const [isEditProfessorOpen, setIsEditProfessorOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<User | undefined>();
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [activeTab, setActiveTab] = useState<"students" | "professors" | "courses" | "grades" | "registrations">(
    "students"
  );

  // Redirect if not authenticated or not admin
  useEffect(() => {
    console.log(
      "[AdminPanel] Auth check - isLoading:",
      isLoading,
      "isAuthenticated:",
      isAuthenticated,
      "role:",
      user?.role
    );

    if (!isLoading) {
      if (!isAuthenticated) {
        console.log(
          "[AdminPanel] Not authenticated, redirecting to /admin/login"
        );
        router.push("/admin/login");
      } else if (user?.role !== "admin") {
        console.log(
          "[AdminPanel] Non-admin user, role:",
          user?.role,
          "- redirecting to /dashboard"
        );
        router.push("/dashboard");
      } else {
        console.log("[AdminPanel] Admin authenticated successfully");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const [students, setStudents] = useState<User[]>([]);
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [studentSearchInput, setStudentSearchInput] = useState("");
  const [studentDebouncedSearch, setStudentDebouncedSearch] = useState("");

  const [professors, setProfessors] = useState<User[]>([]);
  const [professorPage, setProfessorPage] = useState(1);
  const [professorTotalPages, setProfessorTotalPages] = useState(1);
  const [professorSearchInput, setProfessorSearchInput] = useState("");
  const [professorDebouncedSearch, setProfessorDebouncedSearch] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursePage, setCoursePage] = useState(1);
  const [courseTotalPages, setCourseTotalPages] = useState(1);
  const [courseSearchInput, setCourseSearchInput] = useState("");
  const [courseDebouncedSearch, setCourseDebouncedSearch] = useState("");

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [professorsLoading, setProfessorsLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [registrationStatusLoading, setRegistrationStatusLoading] =
    useState(true);
  const [studentsError, setStudentsError] = useState<Error | null>(null);
  const [professorsError, setProfessorsError] = useState<Error | null>(null);
  const [coursesError, setCoursesError] = useState<Error | null>(null);
  const [registrationsError, setRegistrationsError] = useState<Error | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (studentDebouncedSearch !== studentSearchInput) {
        setStudentDebouncedSearch(studentSearchInput);
        setStudentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [studentSearchInput, studentDebouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (professorDebouncedSearch !== professorSearchInput) {
        setProfessorDebouncedSearch(professorSearchInput);
        setProfessorPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [professorSearchInput, professorDebouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (courseDebouncedSearch !== courseSearchInput) {
        setCourseDebouncedSearch(courseSearchInput);
        setCoursePage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [courseSearchInput, courseDebouncedSearch]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await studentsApi.listAll({
        page: studentPage,
        limit: 10,
        search: studentDebouncedSearch || undefined,
      });

      if (Array.isArray(response)) {
        setStudents(response);
      } else if (response.data) {
        const mapped = response.data.map((s: any) => ({
          ...s.user,
          studentId: s.studentId,
          id: s.id,
        }));
        setStudents(mapped);
        setStudentTotalPages((response as any).totalPages || 1);
      }
      setStudentsError(null);
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? error
          : new Error("Failed to load students");
      setStudentsError(err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadProfessors = async () => {
    try {
      setProfessorsLoading(true);
      const response = await professorsApi.listAll({
        page: professorPage,
        limit: 10,
        search: professorDebouncedSearch || undefined,
      });
      if (Array.isArray(response)) {
        setProfessors(response);
      } else if (response.data) {
        setProfessors(response.data);
        setProfessorTotalPages((response as any).totalPages || 1);
      }
      setProfessorsError(null);
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? error
          : new Error("Failed to load professors");
      setProfessorsError(err);
    } finally {
      setProfessorsLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await coursesApi.list({
        page: coursePage,
        limit: 10,
        search: courseDebouncedSearch || undefined,
      });
      if (Array.isArray(response)) {
        setCourses(response);
      } else if (response.data) {
        setCourses(response.data);
        setCourseTotalPages((response as any).totalPages || 1);
      }
      setCoursesError(null);
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? error
          : new Error("Failed to load courses");
      setCoursesError(err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      setRegistrationsLoading(true);
      const response = await registrationsApi.listAll();
      setRegistrations(response);
      setRegistrationsError(null);
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? error
          : new Error("Failed to load registrations");
      setRegistrationsError(err);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const loadRegistrationStatus = async () => {
    try {
      setRegistrationStatusLoading(true);
      const response = await systemSettingsApi.getRegistrationEnabled();
      setIsRegistrationEnabled(response.enabled);
    } finally {
      setRegistrationStatusLoading(false);
    }
  };

  // Load initial data for other tabs
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      return;
    }

    loadRegistrations();
    loadRegistrationStatus();
  }, [isAuthenticated, user?.role]);

  // Load professors separately due to pagination dependencies
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      return;
    }
    loadProfessors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role, professorPage, professorDebouncedSearch]);

  // Load courses separately due to pagination dependencies
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      return;
    }
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role, coursePage, courseDebouncedSearch]);

  // Load students separately due to pagination dependencies
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      return;
    }
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role, studentPage, studentDebouncedSearch]);

  const handleStudentAdded = () => {
    setIsAddStudentOpen(false);
    loadStudents();
    toast.success("Student added successfully!");
  };

  const handleProfessorAdded = () => {
    setIsAddProfessorOpen(false);
    loadProfessors();
    toast.success("Professor added successfully!");
  };

  const handleCourseSuccess = () => {
    setIsAddCourseOpen(false);
    setEditingCourse(undefined);
    loadCourses();
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await coursesApi.remove(id);
      toast.success("Course deleted successfully!");
      loadCourses();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete course"
      );
    }
  };

  const handleToggleRegistration = async (enabled: boolean) => {
    try {
      await systemSettingsApi.setRegistrationEnabled(enabled);
      toast.success(
        enabled
          ? "Course registration enabled for all students!"
          : "Course registration disabled for all students!"
      );
      setIsRegistrationEnabled(enabled);
    } catch (error: unknown) {
      console.error("Toggle registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle registration"
      );
    }
  };

  const handleUpdatePaymentStatus = async (registrationId: number, isPaid: boolean) => {
    try {
      await registrationsApi.updatePaymentStatus(registrationId, isPaid ? 'paid' : 'pending');
      toast.success(`Payment status updated to ${isPaid ? 'PAID' : 'PENDING'}`);
      await loadRegistrations();
    } catch (error: unknown) {
      console.error("Update payment status error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update payment status"
      );
    }
  };

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-secondary/10 p-3 rounded-full mb-4 mx-auto w-fit">
            <Shield className="h-8 w-8 text-secondary" />
          </div>
          <div className="spinner-modern mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-secondary-foreground/10 p-3 rounded-full">
                  <Settings className="h-10 w-10 text-secondary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-secondary-foreground">
                    Modern Academy
                  </h1>
                  <p className="text-sm text-secondary-foreground/80">
                    Administrative Panel
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-secondary-foreground">
                  Welcome, {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-secondary-foreground/70">
                  Administrator
                </p>
              </div>
              <Button
                variant="destructive"
                size="default"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center py-8 bg-card rounded-lg border border-border shadow-md">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Administrative Dashboard
            </h2>
            <p className="text-muted-foreground text-lg">
              Manage students and system settings
            </p>
          </div>

          {/* Registration Toggle Section */}
          <Card className="border-2 border-border bg-gradient-to-br from-card to-secondary/5 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <Settings className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">
                      Course Registration Control
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Enable or disable student course registration system-wide
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <Badge
                      variant={isRegistrationEnabled ? "default" : "secondary"}
                    >
                      {isRegistrationEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 bg-card p-4 rounded-lg border-2 border-border">
                    <Label
                      htmlFor="registration-toggle"
                      className="text-sm font-medium cursor-pointer text-foreground"
                    >
                      {isRegistrationEnabled
                        ? "Disable Registration"
                        : "Enable Registration"}
                    </Label>
                    <Switch
                      id="registration-toggle"
                      checked={isRegistrationEnabled}
                      onCheckedChange={handleToggleRegistration}
                      disabled={registrationStatusLoading}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border-l-4 border-secondary">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  {isRegistrationEnabled
                    ? "Students can currently register for courses. Toggle off to prevent new registrations."
                    : "Course registration is disabled. Students cannot register for new courses until you enable it."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="border-l-4 border-secondary shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  <span className="text-2xl font-bold text-foreground">
                    {students.length}
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-secondary shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Professors
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-secondary" />
                  <span className="text-2xl font-bold text-foreground">
                    {professors.length}
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-secondary shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </CardTitle>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" />
                  <span className="text-2xl font-bold text-foreground">
                    {courses.length}
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-secondary shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Courses
                </CardTitle>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-secondary" />
                  <span className="text-2xl font-bold text-foreground">
                    {courses.filter((course: Course) => course.isActive).length}
                  </span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-secondary shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  System Status
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  <Badge>Online</Badge>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Management Tabs */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    {activeTab === "students" ? (
                      <>
                        <Users className="h-5 w-5 text-secondary" />
                        Student Management
                      </>
                    ) : activeTab === "professors" ? (
                      <>
                        <Briefcase className="h-5 w-5 text-secondary" />
                        Professor Management
                      </>
                    ) : activeTab === "courses" ? (
                      <>
                        <BookOpen className="h-5 w-5 text-secondary" />
                        Course Management
                      </>
                    ) : activeTab === "grades" ? (
                      <>
                        <Award className="h-5 w-5 text-secondary" />
                        Grades Management
                      </>
                    ) : (
                      <>
                        <ClipboardList className="h-5 w-5 text-secondary" />
                        Registrations Management
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === "students"
                      ? "View and manage all registered students"
                      : activeTab === "professors"
                        ? "View and manage all professors"
                        : activeTab === "grades"
                          ? "Assign and manage student grades"
                          : "View and manage course registrations and payment status"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-muted rounded-lg p-1">
                    <Button
                      variant={activeTab === "students" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("students")}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Students
                    </Button>
                    <Button
                      variant={activeTab === "professors" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("professors")}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Professors
                    </Button>
                    <Button
                      variant={activeTab === "courses" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("courses")}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Courses
                    </Button>
                    <Button
                      variant={activeTab === "grades" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("grades")}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Grades
                    </Button>
                    <Button
                      variant={activeTab === "registrations" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("registrations")}
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Registrations
                    </Button>
                  </div>
                  {activeTab === "students" ? (
                    <>
                      <Dialog
                        open={isAddStudentOpen}
                        onOpenChange={setIsAddStudentOpen}
                      >
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Student
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                            <DialogDescription>
                              Create a new student account with login credentials.
                            </DialogDescription>
                          </DialogHeader>
                          <AddStudentForm onSuccess={handleStudentAdded} />
                        </DialogContent>
                      </Dialog>
                      <Dialog
                        open={isEditStudentOpen}
                        onOpenChange={(open) => {
                          setIsEditStudentOpen(open);
                          if (!open) setEditingStudent(undefined);
                        }}
                      >
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Edit Student</DialogTitle>
                            <DialogDescription>
                              Update student details or change their password.
                            </DialogDescription>
                          </DialogHeader>
                          {editingStudent && (
                            <EditStudentForm
                              student={editingStudent}
                              onSuccess={() => {
                                setIsEditStudentOpen(false);
                                setEditingStudent(undefined);
                                loadStudents();
                              }}
                              onCancel={() => {
                                setIsEditStudentOpen(false);
                                setEditingStudent(undefined);
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : activeTab === "professors" ? (
                    <>
                      <Dialog
                        open={isAddProfessorOpen}
                        onOpenChange={setIsAddProfessorOpen}
                      >
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Professor
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Add New Professor</DialogTitle>
                            <DialogDescription>
                              Create a new professor account with login credentials.
                            </DialogDescription>
                          </DialogHeader>
                          <AddProfessorForm onSuccess={handleProfessorAdded} />
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={isEditProfessorOpen}
                        onOpenChange={(open) => {
                          setIsEditProfessorOpen(open);
                          if (!open) setEditingProfessor(undefined);
                        }}
                      >
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Edit Professor</DialogTitle>
                            <DialogDescription>
                              Update professor details or change their password.
                            </DialogDescription>
                          </DialogHeader>
                          {editingProfessor && (
                            <EditProfessorForm
                              professor={editingProfessor}
                              onSuccess={() => {
                                setIsEditProfessorOpen(false);
                                setEditingProfessor(undefined);
                                loadProfessors();
                              }}
                              onCancel={() => {
                                setIsEditProfessorOpen(false);
                                setEditingProfessor(undefined);
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : activeTab === "courses" ? (
                    <Dialog
                      open={isAddCourseOpen}
                      onOpenChange={(open) => {
                        setIsAddCourseOpen(open);
                        if (!open) setEditingCourse(undefined);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Add Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingCourse ? "Edit Course" : "Add New Course"}
                          </DialogTitle>
                          <DialogDescription>
                            {editingCourse
                              ? "Update course details."
                              : "Create a new course and set its prerequisites."}
                          </DialogDescription>
                        </DialogHeader>
                        <CourseForm
                          course={editingCourse}
                          onSuccess={handleCourseSuccess}
                          onCancel={() => {
                            setIsAddCourseOpen(false);
                            setEditingCourse(undefined);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "registrations" ? (
                // Registrations Tab Content
                registrationsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading registrations...</p>
                  </div>
                ) : registrationsError ? (
                  <div className="text-center py-8">
                    <p className="text-destructive">
                      Error loading registrations: {registrationsError.message}
                    </p>
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No registrations found.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary">
                        <TableHead className="text-secondary-foreground font-medium">Student</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Course</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Semester</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Payment Status</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Grade</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Status</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((reg: Registration) => (
                        <TableRow key={reg.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">
                                {reg.student?.firstName} {reg.student?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ID: {reg.student?.studentId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">
                                {reg.course?.courseCode}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {reg.course?.courseName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {reg.semester} {reg.year}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={reg.paymentStatus === 'paid' ? "default" : "secondary"}
                              className="capitalize"
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              {reg.paymentStatus || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {reg.grade ? (
                              <Badge variant="outline">{reg.grade}</Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {reg.isDropped ? (
                              <Badge variant="destructive">Dropped</Badge>
                            ) : reg.isCompleted ? (
                              <Badge variant="default">Completed</Badge>
                            ) : (
                              <Badge variant="secondary">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={reg.paymentStatus === 'paid'}
                                onCheckedChange={(checked) => 
                                  handleUpdatePaymentStatus(reg.id, checked)
                                }
                                disabled={reg.isDropped}
                              />
                              <span className="text-xs text-muted-foreground">
                                {reg.paymentStatus === 'paid' ? 'Paid' : 'Mark Paid'}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              ) : activeTab === "professors" ? (
                // Professors Tab Content
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                    <Input
                      placeholder="Search professors by Name or Email..."
                      value={professorSearchInput}
                      onChange={(e) => setProfessorSearchInput(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  {professorsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading professors...</p>
                    </div>
                  ) : professorsError ? (
                    <div className="text-center py-8">
                      <p className="text-destructive">
                        Error loading professors: {professorsError.message}
                      </p>
                    </div>
                  ) : professors.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No professors added yet. Add your first professor to get started.
                      </p>
                    </div>
                  ) : (
                    <>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary">
                          <TableHead className="text-secondary-foreground font-medium">Name</TableHead>
                          <TableHead className="text-secondary-foreground font-medium">Email</TableHead>
                          <TableHead className="text-secondary-foreground font-medium">Role</TableHead>
                          <TableHead className="text-secondary-foreground font-medium">Created</TableHead>
                          <TableHead className="text-secondary-foreground font-medium text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {professors.map((professor: User) => (
                        <TableRow key={professor.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="bg-secondary/10 p-2 rounded-full">
                                <Briefcase className="h-4 w-4 text-secondary" />
                              </div>
                              <span className="font-medium text-foreground">
                                {professor.firstName} {professor.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {professor.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="capitalize">{professor.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {professor.createdAt
                                ? new Date(professor.createdAt).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProfessor(professor);
                                setIsEditProfessorOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                    <Button 
                      variant="outline"
                      disabled={professorPage <= 1} 
                      onClick={() => setProfessorPage(p => p - 1)}
                    >Previous</Button>
                    <span className="text-sm text-muted-foreground font-medium">
                      Page {professorPage} of {professorTotalPages}
                    </span>
                    <Button 
                      variant="outline"
                      disabled={professorPage >= professorTotalPages} 
                      onClick={() => setProfessorPage(p => p + 1)}
                    >Next</Button>
                  </div>
                  </>
                )}
              </div>
              ) : activeTab === "courses" ? (
                // Courses Tab Content
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                    <Input
                      placeholder="Search courses by Code or Title..."
                      value={courseSearchInput}
                      onChange={(e) => setCourseSearchInput(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  {coursesLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading courses...</p>
                    </div>
                  ) : coursesError ? (
                    <div className="text-center py-8">
                      <p className="text-destructive">
                        Error loading courses: {coursesError.message}
                      </p>
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No courses found. Add your first course to get started.
                      </p>
                    </div>
                  ) : (
                    <>
                    <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary">
                        <TableHead className="text-secondary-foreground font-medium">Code</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Name</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Semester</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Credits</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Professor</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Status</TableHead>
                        <TableHead className="text-secondary-foreground font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course: Course) => (
                        <TableRow key={course.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-foreground">
                            {course.courseCode}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{course.courseName}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                {course.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {course.semester}
                            </Badge>
                          </TableCell>
                          <TableCell>{course.creditHours}</TableCell>
                          <TableCell>
                            {course.professor ? (
                              <span className="text-sm">
                                {course.professor.firstName} {course.professor.lastName}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {course.isActive ? (
                              <Badge variant="default" className="bg-success">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCourse(course);
                                  setIsAddCourseOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                    <Button 
                      variant="outline"
                      disabled={coursePage <= 1} 
                      onClick={() => setCoursePage(p => p - 1)}
                    >Previous</Button>
                    <span className="text-sm text-muted-foreground font-medium">
                      Page {coursePage} of {courseTotalPages}
                    </span>
                    <Button 
                      variant="outline"
                      disabled={coursePage >= courseTotalPages} 
                      onClick={() => setCoursePage(p => p + 1)}
                    >Next</Button>
                  </div>
                  </>
                )}
              </div>
              ) : activeTab === "grades" ? (
                // Grades Tab Content
                <div className="p-6">
                  <GradesManager />
                </div>
              ) : activeTab === "students" ? (
                // Students Tab Content
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                    <Input
                      placeholder="Search students by ID, Name or Email..."
                      value={studentSearchInput}
                      onChange={(e) => setStudentSearchInput(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  {studentsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading students...</p>
                    </div>
                  ) : studentsError ? (
                    <div className="text-center py-8">
                    <p className="text-destructive">
                      Error loading students: {studentsError.message}
                    </p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No students registered yet. Add your first student to get
                      started.
                    </p>
                  </div>
                ) : (
                  <>
                    <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary">
                        <TableHead className="text-secondary-foreground font-medium">Student ID</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Name</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Email</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Role</TableHead>
                        <TableHead className="text-secondary-foreground font-medium">Created</TableHead>
                        <TableHead className="text-secondary-foreground font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student: User) => (
                        <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-foreground">
                            {student.studentId}
                          </TableCell>
                          <TableCell>
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {student.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge>{student.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {student.createdAt
                                ? new Date(
                                    student.createdAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingStudent(student);
                                setIsEditStudentOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                    <Button 
                      variant="outline"
                      disabled={studentPage <= 1} 
                      onClick={() => setStudentPage(p => p - 1)}
                    >Previous</Button>
                    <span className="text-sm text-muted-foreground font-medium">
                      Page {studentPage} of {studentTotalPages}
                    </span>
                    <Button 
                      variant="outline"
                      disabled={studentPage >= studentTotalPages} 
                      onClick={() => setStudentPage(p => p + 1)}
                    >Next</Button>
                  </div>
                  </>
                )}
              </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
