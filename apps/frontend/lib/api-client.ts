import type {
  Course,
  Registration,
  User,
  Week,
  LectureContent,
  WeekWithContent,
  CourseContentWithProgress,
  ProgressSummary,
  ContentType,
  ContentProgress,
} from "./api-types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080/api";
const TOKEN_STORAGE_KEY = "college-portal-token";

let authToken: string | null = null;

const getStoredToken = () => {
  if (authToken !== null) {
    return authToken;
  }

  if (typeof window === "undefined") {
    return null;
  }

  authToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  return authToken;
};

export const setAuthToken = (token: string) => {
  authToken = token;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
};

export const clearAuthToken = () => {
  authToken = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

const buildHeaders = (existingHeaders?: HeadersInit): Record<string, string> => {
  const headers: Record<string, string> = {};

  // Convert existing headers to plain object
  if (existingHeaders) {
    if (existingHeaders instanceof Headers) {
      existingHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(existingHeaders)) {
      existingHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, existingHeaders);
    }
  }

  // Add authorization token
  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers = buildHeaders(options.headers);
  const hasBody = typeof options.body !== "undefined";

  if (hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (error) {
    // Handle network errors (server not running, CORS, etc.)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Unable to connect to the server. Please ensure the backend is running at ${API_URL}`,
      );
    }
    throw error;
  }

  // Handle 204 No Content or simple OK with no body
  if (response.status === 204) {
    return {} as T;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed with status ${response.status}`;
    throw new Error(
      Array.isArray(message) ? message.join(", ") : String(message),
    );
  }

  return payload as T;
};

export const authApi = {
  login: async (data: { studentId: number; password: string }) => {
    const response = await apiRequest<{ token: string; user: User; message: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    setAuthToken(response.token);
    return response;
  },
  adminLogin: async (data: { email: string; password: string }) => {
    const response = await apiRequest<{ token: string; user: User; message: string }>(
      "/auth/admin/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    setAuthToken(response.token);
    return response;
  },
  professorLogin: async (data: { email: string; password: string }) => {
    const response = await apiRequest<{ token: string; user: User; message: string }>(
      "/auth/professor/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    setAuthToken(response.token);
    return response;
  },
  logout: async () => {
    const response = await apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    });
    clearAuthToken();
    return response;
  },
  getProfile: async () => {
    return apiRequest<User>("/auth/profile");
  },
  createStudent: async (data: {
    studentId: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }) => {
    return apiRequest<User>("/auth/admin/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export const coursesApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    const suffix = query.toString();
    
    return apiRequest<{
      data: Course[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/courses${suffix ? `?${suffix}` : ""}`);
  },
  create: async (data: {
    courseCode: string;
    courseName: string;
    description: string;
    creditHours: number;
    semester: string;
    prerequisiteIds?: number[];
    professorId?: number;
  }) =>
    apiRequest<Course>("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: async (
    id: number,
    data: {
      courseCode?: string;
      courseName?: string;
      description?: string;
      creditHours?: number;
      semester?: string;
      prerequisiteIds?: number[];
      isActive?: boolean;
      professorId?: number;
    },
  ) =>
    apiRequest<Course>(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: async (id: number) =>
    apiRequest<{ message: string }>(`/courses/${id}`, {
      method: "DELETE",
    }),
};

export const registrationsApi = {
  listMine: async (params?: { semester?: string; year?: number }) => {
    const query = new URLSearchParams();
    if (params?.semester) {
      query.set("semester", params.semester);
    }
    if (params?.year) {
      query.set("year", String(params.year));
    }
    const suffix = query.toString();
    return apiRequest<Registration[]>(
      `/registrations/me${suffix ? `?${suffix}` : ""}`,
    );
  },
  create: async (data: { courseId: number; semester: string; year: number }) =>
    apiRequest<Registration>("/registrations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  listAll: async () => apiRequest<Registration[]>("/registrations"),
  bulkRegister: async (data: {
    courseIds: number[];
    semester: string;
    year: number;
    isPaid?: boolean;
  }) =>
    apiRequest<Registration[]>("/registrations/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  assignGrade: async (registrationId: number, grade: string) =>
    apiRequest<Registration>(`/registrations/${registrationId}`, {
      method: "PATCH",
      body: JSON.stringify({ grade }),
    }),
  updatePaymentStatus: async (registrationId: number, paymentStatus: 'paid' | 'pending') =>
    apiRequest<Registration>(`/registrations/${registrationId}/payment-status`, {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus }),
    }),
};

export const studentsApi = {
  listAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    const suffix = query.toString();
    
    // We expect the backend to return { data: any[], total: number, page: number, limit: number, totalPages: number }
    // We map it to { data: User[], total, page, limit, totalPages }
    return apiRequest<{
      data: any[]; // The backend currently returns Student objects which contain the User object nested, we need to map this in the component or api client
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/students${suffix ? `?${suffix}` : ""}`);
  },
  update: async (
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    }
  ) =>
    apiRequest<User>(`/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const professorsApi = {
  listAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    const suffix = query.toString();
    
    return apiRequest<{
      data: User[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/auth/admin/professors${suffix ? `?${suffix}` : ""}`);
  },
  create: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) =>
    apiRequest<User>("/auth/admin/professors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: async (
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    }
  ) =>
    apiRequest<User>(`/auth/admin/professors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};


export const systemSettingsApi = {
  getRegistrationEnabled: async () =>
    apiRequest<{ enabled: boolean }>("/system-settings/registration-enabled"),
  setRegistrationEnabled: async (enabled: boolean) =>
    apiRequest("/system-settings/registration", {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    }),
};

export const lectureContentApi = {
  // Week management (admin)
  getWeeks: async (courseId: number) =>
    apiRequest<Week[]>(`/courses/${courseId}/weeks`),
  createWeek: async (courseId: number, data: {
    weekNumber: number;
    title: string;
    description?: string;
    isPublished?: boolean;
  }) =>
    apiRequest<Week>(`/courses/${courseId}/weeks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getWeek: async (courseId: number, weekId: number) =>
    apiRequest<WeekWithContent>(`/courses/${courseId}/weeks/${weekId}`),
  updateWeek: async (courseId: number, weekId: number, data: {
    weekNumber?: number;
    title?: string;
    description?: string;
    isPublished?: boolean;
  }) =>
    apiRequest<Week>(`/courses/${courseId}/weeks/${weekId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteWeek: async (courseId: number, weekId: number) =>
    apiRequest<{ message: string }>(`/courses/${courseId}/weeks/${weekId}`, {
      method: "DELETE",
    }),

  // Content management (admin)
  getContent: async (weekId: number) =>
    apiRequest<LectureContent[]>(`/weeks/${weekId}/content`),
  createContent: async (weekId: number, data: {
    title: string;
    contentType: ContentType;
    externalUrl?: string;
    fileUrl?: string;
    textContent?: string;
    description?: string;
    displayOrder?: number;
  }) =>
    apiRequest<LectureContent>(`/weeks/${weekId}/content`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateContent: async (contentId: number, data: {
    title?: string;
    contentType?: ContentType;
    externalUrl?: string;
    fileUrl?: string;
    textContent?: string;
    description?: string;
    displayOrder?: number;
  }) =>
    apiRequest<LectureContent>(`/content/${contentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteContent: async (contentId: number) =>
    apiRequest<{ message: string }>(`/content/${contentId}`, {
      method: "DELETE",
    }),
  reorderContent: async (weekId: number, items: Array<{ id: number; displayOrder: number }>) =>
    apiRequest<LectureContent[]>(`/weeks/${weekId}/content/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),

  // File upload
  uploadFile: async (file: File, courseId: number, weekId: number) => {
    const formData = new FormData();
    formData.append("courseId", courseId.toString());
    formData.append("weekId", weekId.toString());
    formData.append("file", file);

    const token = getStoredToken();
    const response = await fetch(`${API_URL}/content/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: "include",
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = payload?.message || payload?.error || `Upload failed`;
      throw new Error(Array.isArray(message) ? message.join(", ") : String(message));
    }

    return payload as { fileUrl: string; fileName: string; fileSize: number };
  },

  // Student content access
  getCourseContent: async (courseId: number) =>
    apiRequest<CourseContentWithProgress>(`/courses/${courseId}/content`),

  // Progress tracking
  markComplete: async (contentId: number) =>
    apiRequest<ContentProgress>(`/content/${contentId}/progress`, {
      method: "POST",
    }),
  removeProgress: async (contentId: number) =>
    apiRequest<{ message: string }>(`/content/${contentId}/progress`, {
      method: "DELETE",
    }),
  getProgressSummary: async (courseId: number) =>
    apiRequest<ProgressSummary>(`/courses/${courseId}/progress`),
};

export const chatbotApi = {
  askQuestion: async (courseId: number, message: string) => {
    return apiRequest<{ reply: string }>('/students/chatbot/ask', {
      method: 'POST',
      body: JSON.stringify({ courseId, message }),
    });
  },
};
