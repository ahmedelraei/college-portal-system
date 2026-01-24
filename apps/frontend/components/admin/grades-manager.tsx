"use client";

import { useState } from "react";
import { useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GraduationCap, Search, Award, TrendingUp } from "lucide-react";
import { registrationsApi } from "@/lib/api-client";
import type { Registration } from "@/lib/api-types";
import { toast } from "sonner";

export function GradesManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>("");

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningGrade, setAssigningGrade] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationsApi.listAll();
      setRegistrations(response);
      setError(null);
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err : new Error("Failed to load registrations");
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    if (!reg.student) {
      return false;
    }
    const matchesSearch =
      reg.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.course.courseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSemester =
      semesterFilter === "all" || reg.semester === semesterFilter;

    return matchesSearch && matchesSemester && !reg.isDropped;
  });

  const handleAssignGrade = async () => {
    if (!selectedRegistration || !selectedGrade) {
      toast.error("Please select a grade");
      return;
    }

    try {
      setAssigningGrade(true);
      const updated = await registrationsApi.assignGrade(
        selectedRegistration.id,
        selectedGrade
      );
      toast.success(
        `Grade ${updated.grade} assigned successfully! Student GPA updated to ${updated.student?.currentGPA?.toFixed(2) ?? "N/A"}`
      );
      setSelectedRegistration(null);
      setSelectedGrade("");
      await loadRegistrations();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to assign grade: ${message}`);
    } finally {
      setAssigningGrade(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-100 text-green-800 border-green-200",
      B: "bg-blue-100 text-blue-800 border-blue-200",
      C: "bg-yellow-100 text-yellow-800 border-yellow-200",
      D: "bg-orange-100 text-orange-800 border-orange-200",
      F: "bg-red-100 text-red-800 border-red-200",
      I: "bg-gray-100 text-gray-800 border-gray-200",
      W: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[grade] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading registrations...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate statistics
  const totalRegistrations = registrations.filter((r) => !r.isDropped).length;
  const gradedCount = registrations.filter(
    (r) => r.grade && !r.isDropped
  ).length;
  const pendingCount = registrations.filter(
    (r) => !r.grade && !r.isDropped
  ).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Registrations
            </CardTitle>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalRegistrations}</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Graded
            </CardTitle>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {gradedCount}
              </span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Grades
            </CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">
                {pendingCount}
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Registrations & Grades
          </CardTitle>
          <CardDescription>
            Assign and manage grades for student course registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by student name, email, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Current GPA</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No registrations found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegistrations.map((registration) => {
                    const student = registration.student;
                    if (!student) {
                      return null;
                    }
                    return (
                      <TableRow key={registration.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {student.studentId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {registration.course.courseCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {registration.course.courseName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {registration.semester.charAt(0).toUpperCase() +
                            registration.semester.slice(1)}{" "}
                          {registration.year}
                        </Badge>
                      </TableCell>
                      <TableCell>{registration.course.creditHours}</TableCell>
                      <TableCell>
                        <span className="font-bold text-primary">
                          {student.currentGPA.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {registration.grade ? (
                          <Badge
                            className={`${getGradeColor(registration.grade)} border`}
                          >
                            {registration.grade} (
                            {registration.gradePoints?.toFixed(1)})
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Graded</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {registration.isCompleted ? (
                          <Badge variant="default">Completed</Badge>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedRegistration(registration)
                              }
                            >
                              {registration.grade ? "Update" : "Assign"} Grade
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {registration.grade ? "Update" : "Assign"} Grade
                              </DialogTitle>
                              <DialogDescription>
                                Assign a grade for{" "}
                                {student.firstName} {student.lastName} in{" "}
                                {registration.course.courseCode}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Select Grade
                                </label>
                                <Select
                                  value={selectedGrade}
                                  onValueChange={setSelectedGrade}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a grade" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A">
                                      A (4.0) - Excellent
                                    </SelectItem>
                                    <SelectItem value="B">
                                      B (3.0) - Good
                                    </SelectItem>
                                    <SelectItem value="C">
                                      C (2.0) - Satisfactory
                                    </SelectItem>
                                    <SelectItem value="D">
                                      D (1.0) - Pass
                                    </SelectItem>
                                    <SelectItem value="F">
                                      F (0.0) - Fail
                                    </SelectItem>
                                    <SelectItem value="I">
                                      I - Incomplete
                                    </SelectItem>
                                    <SelectItem value="W">
                                      W - Withdraw
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="bg-secondary/30 p-4 rounded-lg space-y-2">
                                <p className="text-sm">
                                  <span className="font-medium">Student:</span>{" "}
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Current GPA:
                                  </span>{" "}
                                  {student.currentGPA.toFixed(2)}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Course:</span>{" "}
                                  {registration.course.courseCode} -{" "}
                                  {registration.course.courseName}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Credit Hours:
                                  </span>{" "}
                                  {registration.course.creditHours}
                                </p>
                              </div>
                              <Button
                                onClick={handleAssignGrade}
                                disabled={!selectedGrade || assigningGrade}
                                className="w-full"
                              >
                                {assigningGrade
                                  ? "Assigning..."
                                  : registration.grade
                                    ? "Update Grade"
                                    : "Assign Grade"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
