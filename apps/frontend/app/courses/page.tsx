"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  BookOpen,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  FileDown,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Wallet,
  Building,
  Lock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  coursesApi,
  registrationsApi,
  systemSettingsApi,
} from "@/lib/api-client";
import type { Course, Registration } from "@/lib/api-types";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CoursesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [step, setStep] = useState<"browse" | "review" | "payment" | "success">(
    "browse"
  );
  type RegistrationResult = {
    courses: Course[];
    semester: string;
    year: number;
    totalCreditHours: number;
    totalPrice: number;
    registrationDate: string;
    registrations: Registration[];
  };

  const [registrationResult, setRegistrationResult] =
    useState<RegistrationResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | "bank">(
    "card"
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Current semester/year (you can make this dynamic)
  const currentSemester = "winter";
  const currentYear = 2025;
  const pricePerCreditHour = 525.5; // 525.5 EGP per credit hour

  // All hooks must be called at the top before any conditional returns
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<Error | null>(null);

  // Handle authentication redirects
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role === "admin") {
        router.push("/admin/panel");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || authLoading || user?.role === "admin") {
        return;
      }

      try {
        setCoursesLoading(true);
        const [coursesResponse, registrationsResponse, settingsResponse] =
          await Promise.all([
            coursesApi.list(),
            registrationsApi.listMine(),
            systemSettingsApi.getRegistrationEnabled(),
          ]);
        setCourses(coursesResponse);
        setRegistrations(registrationsResponse);
        setIsRegistrationEnabled(settingsResponse.enabled);
        setCoursesError(null);
      } catch (error: unknown) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to load courses");
        setCoursesError(err);
      } finally {
        setCoursesLoading(false);
        setRegistrationsLoading(false);
      }
    };

    loadData();
  }, [authLoading, isAuthenticated, user?.role]);

  // Calculate totals
  const totalCreditHours = selectedCourses.reduce(
    (sum, course) => sum + course.creditHours,
    0
  );
  const totalPrice = totalCreditHours * pricePerCreditHour;

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-modern mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Return null while redirecting
  if (!isAuthenticated || user?.role === "admin") {
    return null;
  }

  if (authLoading || coursesLoading || registrationsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-modern mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md shadow-md">
          <CardContent className="p-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-center text-destructive font-medium">
              Error loading courses: {coursesError.message}
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-4"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  // Get registered course IDs
  const registeredCourseIds = registrations
    .filter((reg) => !reg.isDropped)
    .map((reg) => reg.course.id);

  // Filter courses
  const filteredCourses = courses.filter((course: Course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      semesterFilter === "all" || course.semester === semesterFilter;
    return matchesSearch && matchesSemester && course.isActive;
  });

  const toggleCourseSelection = (course: Course) => {
    if (!isRegistrationEnabled) {
      toast.error(
        "Course registration is currently disabled by the administration. Please check back later."
      );
      return;
    }

    const isSelected = selectedCourses.some((c) => c.id === course.id);
    if (isSelected) {
      setSelectedCourses(selectedCourses.filter((c) => c.id !== course.id));
      toast.info(`Removed ${course.courseName} from cart`);
    } else {
      // Check credit hour limit
      const newTotal = totalCreditHours + course.creditHours;
      if (newTotal > 18) {
        toast.error(
          `Cannot add course. Maximum 18 credit hours per semester. Current: ${totalCreditHours}, Adding: ${course.creditHours}`
        );
        return;
      }
      setSelectedCourses([...selectedCourses, course]);
      toast.success(`Added ${course.courseName} to cart`);
    }
  };

  const handleProceedToReview = () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course");
      return;
    }
    setStep("review");
  };

  const handleProceedToPayment = () => {
    setStep("payment");
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);

    // Simulate payment processing delay (2-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Simulate payment success
    toast.success(
      `Payment of ${totalPrice.toFixed(2)} EGP processed successfully via ${paymentMethod}!`
    );

    // Now proceed with registration
    try {
      const courseIds = selectedCourses.map((course) => course.id);
      const registrationResponse = await registrationsApi.bulkRegister({
        courseIds,
        semester: currentSemester,
        year: currentYear,
        isPaid: true,
      });

      const registrationData = {
        courses: selectedCourses,
        semester: currentSemester,
        year: currentYear,
        totalCreditHours,
        totalPrice,
        registrationDate: new Date().toISOString(),
        registrations: registrationResponse,
      };

      setRegistrationResult(registrationData);
      setStep("success");
      toast.success("Successfully registered for all courses!");
    } catch (error: unknown) {
      console.error("Bulk registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleConfirmRegistration = async () => {
    // This is now just for navigating to payment
    handleProceedToPayment();
  };

  const generatePDF = () => {
    if (!registrationResult) return;

    // Create a simple HTML receipt and print it
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to download PDF");
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Registration Receipt</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #1e293b;
      background-color: #f8fafc;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #1e293b;
      margin: 0;
      font-weight: 700;
    }
    .date {
      color: #64748b;
      margin-top: 10px;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .course-item {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      border: 1px solid #e2e8f0;
      margin-bottom: 10px;
      border-radius: 8px;
      background-color: #ffffff;
    }
    .course-info {
      flex: 1;
    }
    .course-code {
      font-weight: 600;
      color: #1e293b;
    }
    .course-name {
      font-size: 16px;
      margin: 5px 0;
    }
    .course-price {
      text-align: right;
      min-width: 120px;
    }
    .credit-hours {
      font-weight: 600;
    }
    .price {
      color: #3b82f6;
      font-size: 18px;
    }
    .summary {
      background-color: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
      border-left: 4px solid #3b82f6;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .summary-row:last-child {
      border-bottom: none;
      font-size: 20px;
      font-weight: 700;
      padding-top: 15px;
      margin-top: 10px;
      border-top: 2px solid #3b82f6;
    }
    .total-label {
      color: #1e293b;
    }
    .total-amount {
      color: #3b82f6;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Course Registration Receipt</h1>
    <p class="date">${new Date(
      registrationResult.registrationDate
    ).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</p>
    <p><strong>Semester:</strong> ${registrationResult.semester.charAt(0).toUpperCase() + registrationResult.semester.slice(1)} ${registrationResult.year}</p>
    <p><strong>Student:</strong> ${user?.email || "Student"}</p>
  </div>

  <div class="section">
    <div class="section-title">Registered Courses</div>
    ${registrationResult.courses
      .map(
        (course: Course) => `
      <div class="course-item">
        <div class="course-info">
          <div class="course-code">${course.courseCode}</div>
          <div class="course-name">${course.courseName}</div>
          <div>${course.description}</div>
        </div>
        <div class="course-price">
          <div class="credit-hours">${course.creditHours} Credits</div>
          <div class="price">${(course.creditHours * pricePerCreditHour).toFixed(2)} EGP</div>
        </div>
      </div>
    `
      )
      .join("")}
  </div>

  <div class="summary">
    <div class="summary-row">
      <span>Total Credit Hours:</span>
      <span class="credit-hours">${registrationResult.totalCreditHours}</span>
    </div>
    <div class="summary-row">
      <span>Price per Credit Hour:</span>
      <span>${pricePerCreditHour.toFixed(2)} EGP</span>
    </div>
    <div class="summary-row">
      <span class="total-label">Total Amount:</span>
      <span class="total-amount">${registrationResult.totalPrice.toFixed(2)} EGP</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Payment Information</div>
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0;">
        <span>Payment Method:</span>
        <span style="font-weight: 600; text-transform: capitalize;">${paymentMethod === "card" ? "Credit/Debit Card" : paymentMethod === "cash" ? "Cash Payment" : "Bank Transfer"}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0;">
        <span>Payment Status:</span>
        <span style="color: #3b82f6; font-weight: 700;">PAID</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0;">
        <span>Transaction Date:</span>
        <span style="font-weight: 600;">${new Date().toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This is an official registration receipt.</p>
    <p>For questions, please contact the registrar&apos;s office.</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleStartOver = () => {
    setSelectedCourses([]);
    setStep("browse");
    setRegistrationResult(null);
  };

  // Render different steps
  if (step === "success" && registrationResult) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-white">
              Registration Complete!
            </h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4 border-2 border-success">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Successfully Registered for {registrationResult.courses.length}{" "}
                Course(s)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/10 rounded-lg p-6 mb-6 border-l-4 border-primary">
                <h3 className="font-semibold text-lg mb-4 text-foreground">
                  Registration Summary
                </h3>
                <div className="space-y-3">
                  {registrationResult.courses.map((course: Course) => (
                    <div
                      key={course.id}
                      className="flex justify-between items-center pb-3 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground">{course.courseName}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.courseCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {course.creditHours} Credits
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(course.creditHours * pricePerCreditHour).toFixed(2)}{" "}
                          EGP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 border-border">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <div className="text-right">
                      <p className="text-foreground">{totalCreditHours} Credit Hours</p>
                      <p className="text-primary">
                        {totalPrice.toFixed(2)} EGP
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Payment Confirmed
                </h3>
                <div className="space-y-2 text-sm text-foreground">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium capitalize">
                      {paymentMethod === "card"
                        ? "Credit/Debit Card"
                        : paymentMethod === "cash"
                          ? "Cash Payment"
                          : "Bank Transfer"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-medium">
                      {totalPrice.toFixed(2)} EGP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className="font-bold text-success">PAID</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={generatePDF}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  <FileDown className="mr-2 h-5 w-5" />
                  Download Registration Receipt (PDF)
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={handleStartOver}
                  className="w-full"
                  variant="ghost"
                >
                  Register for More Courses
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-white">Payment</h1>
            <p className="text-white/90 mt-1">
              Complete your payment to finalize registration
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {/* Payment Method Selection */}
            <div className="md:col-span-2">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-foreground">Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Credit Card Option */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          paymentMethod === "card"
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Credit/Debit Card</h3>
                        <p className="text-sm text-muted-foreground">
                          Pay securely with your card
                        </p>
                      </div>
                      {paymentMethod === "card" && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    {paymentMethod === "card" && (
                      <div className="mt-4 space-y-3 pt-4 border-t border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">
                            Card Number
                          </label>
                          <Input
                            placeholder="1234 5678 9012 3456"
                            className="mt-1 focus:ring-2 focus:ring-primary focus:border-primary"
                            defaultValue="4532 1234 5678 9010"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-foreground">
                              Expiry Date
                            </label>
                            <Input
                              placeholder="MM/YY"
                              className="mt-1 focus:ring-2 focus:ring-primary focus:border-primary"
                              defaultValue="12/25"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground">CVV</label>
                            <Input
                              placeholder="123"
                              className="mt-1 focus:ring-2 focus:ring-primary focus:border-primary"
                              defaultValue="123"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cash Option */}
                  <div
                    onClick={() => setPaymentMethod("cash")}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === "cash"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          paymentMethod === "cash"
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Wallet className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Cash Payment</h3>
                        <p className="text-sm text-muted-foreground">
                          Pay at the registrar&apos;s office
                        </p>
                      </div>
                      {paymentMethod === "cash" && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Bank Transfer Option */}
                  <div
                    onClick={() => setPaymentMethod("bank")}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === "bank"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          paymentMethod === "bank"
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Building className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Bank Transfer</h3>
                        <p className="text-sm text-muted-foreground">
                          Transfer directly from your bank
                        </p>
                      </div>
                      {paymentMethod === "bank" && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-2">
                    <Lock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm text-foreground">
                      <p className="font-medium">Secure Payment</p>
                      <p className="text-muted-foreground">
                        Your payment information is encrypted and secure.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4 shadow-md">
                <CardHeader>
                  <CardTitle className="text-foreground">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Courses</span>
                      <span className="font-medium text-foreground">
                        {selectedCourses.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Credits
                      </span>
                      <span className="font-medium text-foreground">{totalCreditHours}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Price per Credit
                      </span>
                      <span className="font-medium text-foreground">
                        {pricePerCreditHour.toFixed(2)} EGP
                      </span>
                    </div>
                    <div className="border-t pt-3 border-border flex justify-between">
                      <span className="font-bold text-foreground">Total Amount</span>
                      <span className="font-bold text-primary text-lg">
                        {totalPrice.toFixed(2)} EGP
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={handlePayment}
                      className="w-full"
                      size="lg"
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="spinner-modern w-4 h-4 mr-2"></div>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Pay {totalPrice.toFixed(2)} EGP
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setStep("review")}
                      className="w-full"
                      disabled={isProcessingPayment}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-white">Review & Confirm</h1>
            <p className="text-white/90 mt-1">
              {currentSemester.charAt(0).toUpperCase() +
                currentSemester.slice(1)}{" "}
              Semester {currentYear}
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Selected Courses ({selectedCourses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-start justify-between p-4 border-2 border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{course.courseCode}</Badge>
                          <Badge variant="outline">
                            {course.creditHours} Credits
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {course.courseName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.description}
                        </p>
                        {course.prerequisites?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-foreground">
                              Prerequisites:
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {course.prerequisites.map((prereq: Course) => (
                                <Badge
                                  key={prereq.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {prereq.courseCode}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-primary">
                          {(course.creditHours * pricePerCreditHour).toFixed(2)}{" "}
                          EGP
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCourseSelection(course)}
                          className="mt-2"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/10 rounded-lg p-6 mt-6 border-l-4 border-primary">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-medium text-foreground">Total Credit Hours:</span>
                      <span className="font-bold text-foreground">{totalCreditHours} / 18</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-medium text-foreground">Price per Credit Hour:</span>
                      <span className="font-medium text-foreground">{pricePerCreditHour.toFixed(2)} EGP</span>
                    </div>
                    <div className="border-t pt-3 border-border flex justify-between text-xl font-bold">
                      <span className="text-foreground">Total Amount:</span>
                      <span className="text-primary">
                        {totalPrice.toFixed(2)} EGP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep("browse")}
                    size="lg"
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Browse
                  </Button>
                  <Button
                    onClick={handleConfirmRegistration}
                    size="lg"
                    className="flex-1"
                  >
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Browse step (default)
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Course Registration
              </h1>
              <p className="text-white/90 mt-1">
                {currentSemester.charAt(0).toUpperCase() +
                  currentSemester.slice(1)}{" "}
                Semester {currentYear}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Registration Disabled Alert */}
        {!isRegistrationEnabled && (
          <Alert variant="destructive" className="mb-6">
            <Lock className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">
              Course Registration Currently Disabled
            </AlertTitle>
            <AlertDescription className="text-base mt-2">
              Course registration has been temporarily disabled by the
              administration. You can browse available courses, but you cannot
              register at this time. Please check back later or contact the
              registrar&apos;s office for more information.
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by course name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-[200px] focus:ring-2 focus:ring-primary focus:border-primary">
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

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: Course) => {
            const isRegistered = registeredCourseIds.includes(course.id);
            const isSelected = selectedCourses.some((c) => c.id === course.id);

            return (
              <Card
                key={course.id}
                className={`shadow-md hover:shadow-lg transition-shadow ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge>{course.courseCode}</Badge>
                    <Badge variant="outline">
                      {course.semester.charAt(0).toUpperCase() +
                        course.semester.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-foreground">{course.courseName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-foreground">{course.creditHours} Credits</span>
                    </div>
                    <div className="text-primary font-semibold">
                      {(course.creditHours * pricePerCreditHour).toFixed(2)} EGP
                    </div>
                  </div>

                  {course.prerequisites?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-foreground mb-1">Prerequisites:</p>
                      <div className="flex flex-wrap gap-1">
                        {course.prerequisites.map((prereq: Course) => (
                          <Badge
                            key={prereq.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {prereq.courseCode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {isRegistered ? (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => router.push(`/courses/${course.id}/content`)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Course Content
                    </Button>
                  ) : !isRegistrationEnabled ? (
                    <Button variant="secondary" className="w-full" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Registration Disabled
                    </Button>
                  ) : (
                    <Button
                      onClick={() => toggleCourseSelection(course)}
                      className="w-full"
                      variant={isSelected ? "destructive" : "default"}
                    >
                      {isSelected ? (
                        <>
                          <Minus className="h-4 w-4 mr-2" />
                          Remove from Cart
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">
              No courses found matching your criteria
            </p>
          </div>
        )}
      </main>

      {/* Floating Cart Summary */}
      {selectedCourses.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border shadow-lg z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {selectedCourses.length} Course(s) Selected
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Total Credits:</span>
                  <span className="font-bold text-foreground ml-1">
                    {totalCreditHours} / 18
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Total Price:</span>
                  <span className="font-bold text-primary ml-1">
                    {totalPrice.toFixed(2)} EGP
                  </span>
                </div>
              </div>
              <Button onClick={handleProceedToReview} size="lg">
                Proceed to Review
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
