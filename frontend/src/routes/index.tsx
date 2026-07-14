import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "@/pages/auth/SplashScreen";
import Onboarding from "@/pages/auth/Onboarding";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import OTP from "@/pages/auth/OTP";
import EmailVerification from "@/pages/auth/EmailVerification";
import Activation from "@/pages/auth/Activation";

// Error Pages
import Unauthorized from "@/pages/error/Unauthorized";
import Forbidden from "@/pages/error/Forbidden";
import NotFound from "@/pages/error/NotFound";

// Dashboards
import StudentDashboard from "@/pages/dashboard/StudentDashboard";
import TeacherDashboard from "@/pages/dashboard/TeacherDashboard";
import CounselorDashboard from "@/pages/dashboard/CounselorDashboard";
import ParentDashboard from "@/pages/dashboard/ParentDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import DashboardRedirect from "@/pages/dashboard/DashboardRedirect";

// Profile
import Profile from "@/pages/profile/Profile";

// AI Chat
import AIChat from "@/pages/chat/AIChat";

// Feature Pages
import Counseling from "@/pages/counseling/Counseling";
import Assessment from "@/pages/assessment/Assessment";

// Admin Pages
import UserManagement from "@/pages/admin/UserManagement";
import SystemStats from "@/pages/admin/SystemStats";
import MoodTracking from "@/pages/mood/MoodTracking";
import Forum from "@/pages/forum/Forum";
import Articles from "@/pages/articles/Articles";
import Notifications from "@/pages/notifications/Notifications";

/**
 * Application Router
 *
 * Auth flow:
 *  / → /splash → /onboarding → /login
 *
 * Protected flow:
 *  /login → POST /api/v1/auth/login → role detected → /dashboard → /dashboard/:role
 *
 * Role-based access:
 *  - Student pages:    allowedRoles=['student']
 *  - Counselor pages:  allowedRoles=['counselor']
 *  - Teacher pages:    allowedRoles=['teacher']
 *  - Admin pages:      allowedRoles=['admin']
 *  - Staff pages:      allowedRoles=['admin','teacher'] (user management)
 *  - Shared pages:     allowedRoles=[] (any authenticated user)
 *
 * NOTE: RoleNames from backend are uppercase (ADMIN, STUDENT…).
 *       ProtectedRoute lowercases before comparing.
 */
export const createAppRouter = () =>
  createBrowserRouter([
    // ── Root redirect ─────────────────────────────────────────────────────────
    {
      path: "/",
      element: <Navigate to="/splash" replace />,
    },

    // ── Auth pages (no authentication required) ───────────────────────────────
    {
      element: <AuthLayout />,
      children: [
        { path: "login", element: <Login /> },
        {
          // /register: public registration is disabled — show informational page
          path: "register",
          element: <Register />,
        },
        { path: "forgot-password", element: <ForgotPassword /> },
        { path: "reset-password", element: <ResetPassword /> },
        { path: "otp", element: <OTP /> },
        { path: "email-verification", element: <EmailVerification /> },
        { path: "activation", element: <Activation /> },
      ],
    },

    // ── Shared authenticated pages (sidebar layout, any role) ─────────────────
    {
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "profile", element: <Profile /> },
        { path: "settings", element: <Profile /> },
        { path: "ai-chat", element: <AIChat /> },
        { path: "counseling", element: <Counseling /> },
        { path: "assessment", element: <Assessment /> },
        { path: "mood", element: <MoodTracking /> },
        { path: "forum", element: <Forum /> },
        { path: "articles", element: <Articles /> },
        { path: "notifications", element: <Notifications /> },
        // ── Admin / Staff pages ──────────────────────────────────────────────
        {
          path: "admin/users",
          element: (
            <ProtectedRoute allowedRoles={["admin", "teacher"]}>
              <UserManagement />
            </ProtectedRoute>
          ),
        },
        {
          path: "admin/system",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemStats />
            </ProtectedRoute>
          ),
        },
      ],
    },

    // ── Role-specific dashboards ──────────────────────────────────────────────
    {
      path: "dashboard",
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: <DashboardRedirect />,
        },
        {
          path: "student",
          element: (
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "teacher",
          element: (
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "counselor",
          element: (
            <ProtectedRoute allowedRoles={["counselor"]}>
              <CounselorDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "parent",
          element: (
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "admin",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          ),
        },
      ],
    },

    // ── Public standalone pages ───────────────────────────────────────────────
    { path: "splash", element: <SplashScreen /> },
    { path: "onboarding", element: <Onboarding /> },
    { path: "unauthorized", element: <Unauthorized /> },
    { path: "forbidden", element: <Forbidden /> },
    { path: "*", element: <NotFound /> },
  ]);

export default createAppRouter;
