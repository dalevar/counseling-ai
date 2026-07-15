/**
 * Admin API Service
 *
 * All endpoints require authentication (ADMIN or TEACHER role for create).
 * Base URL from apiClient already includes /api prefix.
 * Backend routes: /admin/*
 */
import { apiClient } from "./client";

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "STUDENT" | "COUNSELOR" | "TEACHER" | "PARENT";
  schoolId?: string;
  // Student-specific
  birthDate?: string;
  gender?: "L" | "P";
  classId?: string;
  className?: string;
  parentEmail?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentPhone?: string;
  // Teacher/Counselor-specific
  employeeId?: string;
  specialization?: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  role: string;
  status: string;
  tempPassword: string; // Shown once — admin must share with the user securely
}

export interface AdminUser {
  id: string;
  email: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  role: { name: string };
  student?: { firstName: string; lastName: string } | null;
  counselor?: { firstName: string; lastName: string } | null;
  teacher?: { firstName: string; lastName: string } | null;
  parent?: { firstName: string; lastName: string } | null;
}

export interface AdminStats {
  users: {
    total: number;
    students: number;
    counselors: number;
    newThisMonth: number;
  };
  sessions: { active: number; completed: number; pending: number };
  ai: { totalAssessments: number; totalConversations: number };
  wellness: { avgMoodScore: number; moodRecordsLast30Days: number };
}

export interface SchoolOption {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  classes: Array<{ id: string; name: string }>;
  _count: { teachers: number; students: number };
}

export interface CreateSchoolPayload {
  name: string;
  address?: string;
  phone?: string;
}

export interface ImportStudentsResponse {
  totalRows: number;
  successCount: number;
  failedCount: number;
  results: Array<{
    row: number;
    email: string;
    status: "SUCCESS" | "FAILED";
    userId?: string;
    tempPassword?: string;
    error?: string;
  }>;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const adminApi = {
  /** Get dashboard statistics */
  getStats: () =>
    apiClient
      .get<{ data: AdminStats }>("/admin/stats")
      .then((r) => r.data.data),

  /** Get paginated user list */
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) =>
    apiClient
      .get<{ data: AdminUser[]; meta: any }>("/admin/users", { params })
      .then((r) => r.data),

  /** Create a new user account (Admin/Teacher only) */
  createUser: (payload: CreateUserPayload) =>
    apiClient
      .post<{ data: CreateUserResponse }>("/admin/users", payload)
      .then((r) => r.data.data),

  /** Get schools visible to current user */
  getSchools: () =>
    apiClient
      .get<{ data: SchoolOption[] }>("/admin/schools")
      .then((r) => r.data.data),

  /** Register a school (Admin only) */
  createSchool: (payload: CreateSchoolPayload) =>
    apiClient
      .post<{ data: SchoolOption }>("/admin/schools", payload)
      .then((r) => r.data.data),

  /** Import students from spreadsheet (Admin/Teacher) */
  importStudents: (file: File, schoolId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (schoolId) {
      formData.append("schoolId", schoolId);
    }

    return apiClient
      .post<{ data: ImportStudentsResponse }>(
        "/admin/students/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      .then((r) => r.data.data);
  },

  /** Update user status (ACTIVE | SUSPENDED | PENDING) */
  updateUserStatus: (userId: string, status: string) =>
    apiClient
      .patch(`/admin/users/${userId}/status`, { status })
      .then((r) => r.data),

  /** Delete user account */
  deleteUser: (userId: string) =>
    apiClient.delete(`/admin/users/${userId}`).then((r) => r.data),
};
