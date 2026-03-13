"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { coursesApi, registrationsApi } from "@/lib/api-client";
import type { Course } from "@/lib/api-types";
import { toast } from "sonner";

export function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [registeredCourses, setRegisteredCourses] = useState<number[]>([]);
  const [completedCourseCodes, setCompletedCourseCodes] = useState<string[]>(
    [],
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const currentSemester = "winter";
  const currentYear = 2025;

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const [coursesResponse, registrationsResponse] = await Promise.all([
          coursesApi.list(),
          registrationsApi.listMine(),
        ]);
        setCourses(Array.isArray(coursesResponse) ? coursesResponse : coursesResponse.data);
        const activeRegistrations = registrationsResponse.filter(
          (registration) => !registration.isDropped,
        );
        setRegisteredCourses(
          activeRegistrations.map((registration) => registration.courseId),
        );
        setCompletedCourseCodes(
          registrationsResponse
            .filter((registration) => registration.isCompleted)
            .map((registration) => registration.course.courseCode),
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const departments = [
    "all",
    ...Array.from(new Set(courses.map((course) => course.semester))),
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || course.semester === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const checkPrerequisites = (course: Course) => {
    const prerequisites = course.prerequisites ?? [];
    return prerequisites.every((prereq) =>
      completedCourseCodes.includes(prereq.courseCode),
    );
  };

  const handleRegister = async (courseId: number) => {
    try {
      const response = await registrationsApi.create({
        courseId,
        semester: currentSemester,
        year: currentYear,
      });
      setRegisteredCourses([...registeredCourses, response.courseId]);
      toast.success("Registration submitted successfully!");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to register for course"
      );
    }
  };

  const isRegistered = (courseId: number) => registeredCourses.includes(courseId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Course Catalog</h1>
        <p className="text-muted-foreground">Browse and register for courses - Spring 2024</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search courses by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full md:w-48 focus:ring-2 focus:ring-primary focus:border-primary">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Courses</TabsTrigger>
          <TabsTrigger value="registered">My Registrations ({registeredCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <div className="grid gap-6">
            {loading && (
              <Card className="shadow-md">
                <CardContent className="p-6 text-center text-muted-foreground">
                  Loading courses...
                </CardContent>
              </Card>
            )}
            {filteredCourses.map((course) => {
              const hasPrerequisites = checkPrerequisites(course);
              const canRegister =
                course.isActive && hasPrerequisites && !isRegistered(course.id);

              return (
                <Card
                  key={course.id}
                  className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">
                            {course.courseCode}
                          </h3>
                          <Badge variant="secondary">{course.creditHours} credits</Badge>
                          {!course.isActive && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                          {isRegistered(course.id) && (
                            <Badge className="bg-success/10 text-success border-success/20">Registered</Badge>
                          )}
                        </div>

                        <h4 className="text-lg font-medium text-foreground mb-2">
                          {course.courseName}
                        </h4>
                        <p className="text-muted-foreground mb-3">{course.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            {course.semester}
                          </div>
                        </div>

                        {course.prerequisites && course.prerequisites.length > 0 && (
                          <div className="mt-3 flex items-center gap-2">
                            {hasPrerequisites ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              Prerequisites: {course.prerequisites.map((prereq) => prereq.courseCode).join(", ")}
                              {!hasPrerequisites && " (Not met)"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCourse(course)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-foreground">
                                  {selectedCourse?.courseCode} - {selectedCourse?.courseName}
                                </DialogTitle>
                                <DialogDescription>
                                  {selectedCourse?.semester} • {selectedCourse?.creditHours} Credits
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-foreground">{selectedCourse?.description}</p>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-2">Course Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Course Code:</span>
                                        <span>{selectedCourse?.courseCode}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Semester:</span>
                                        <span>{selectedCourse?.semester}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-foreground mb-2">Enrollment</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <span>{selectedCourse?.isActive ? "Active" : "Inactive"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {selectedCourse?.prerequisites && selectedCourse.prerequisites.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-2">Prerequisites</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedCourse.prerequisites.map((prereq) => (
                                        <Badge
                                          key={prereq.id}
                                          variant={completedCourseCodes.includes(prereq.courseCode) ? "default" : "destructive"}
                                        >
                                          {prereq.courseCode}
                                          {completedCourseCodes.includes(prereq.courseCode) ? " ✓" : " ✗"}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            disabled={!canRegister}
                            onClick={() => handleRegister(course.id)}
                          >
                            {isRegistered(course.id) ? "Registered" : "Register"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="registered">
          <div className="space-y-6">
            {registeredCourses.length === 0 ? (
              <Card className="shadow-md">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Registered Courses</h3>
                  <p className="text-muted-foreground">
                    You haven&apos;t registered for any courses yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {courses
                  .filter((course) => registeredCourses.includes(course.id))
                  .map((course) => (
                    <Card key={course.id} className="border-l-4 border-l-success shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-foreground">
                                {course.courseCode}
                              </h3>
                              <Badge className="bg-success/10 text-success border-success/20">Registered</Badge>
                              <Badge variant="secondary">{course.creditHours} credits</Badge>
                            </div>
                            <h4 className="text-lg font-medium text-foreground mb-2">
                              {course.courseName}
                            </h4>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                <Card className="bg-primary text-white shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Registration Summary</h3>
                        <p className="text-white/90">
                          Total Credits:{" "}
                          {courses
                            .filter((course) => registeredCourses.includes(course.id))
                            .reduce((sum, course) => sum + course.creditHours, 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
