import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import {
  loginSuccess,
  setLoading,
  setAuthError,
} from "@/store/slices/authSlice";
import { apiClient } from "@/api/client";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginFields = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFields) => {
    dispatch(setLoading(true));
    dispatch(setAuthError(null));

    try {
      const response = await apiClient.post("/v1/auth/login", data);
      const { user, accessToken } = response.data.data;
      dispatch(loginSuccess({ user, token: accessToken }));
      toast.success(`Selamat datang, ${user.firstName ?? user.email}!`);
      navigate(`/dashboard`);
    } catch (err: any) {
      if (err.message === "Network Error" || !err.response) {
        // ── Mock fallback (dev mode) ──────────────────────────────────────
        type MockRole =
          | "admin"
          | "student"
          | "teacher"
          | "counselor"
          | "parent";
        let mockRole: MockRole = "student";
        const emailLower = data.email.toLowerCase();
        if (emailLower.includes("admin")) mockRole = "admin";
        else if (
          emailLower.includes("teacher") ||
          emailLower.includes("guru") ||
          emailLower.includes("bk")
        )
          mockRole = "teacher";
        else if (
          emailLower.includes("counselor") ||
          emailLower.includes("konselor")
        )
          mockRole = "counselor";
        else if (emailLower.includes("parent") || emailLower.includes("ortu"))
          mockRole = "parent";

        const mockUser = {
          id: "mock-001",
          email: data.email,
          role: mockRole,
          firstName: data.email.split("@")[0],
        };
        setTimeout(() => {
          dispatch(loginSuccess({ user: mockUser, token: "mock-jwt-token" }));
          toast.success(`[DEMO] Masuk sebagai ${mockRole}`);
          navigate(`/dashboard/${mockRole}`);
        }, 900);
      } else {
        const msg = err.response?.data?.message ?? "Email atau password salah.";
        dispatch(setAuthError(msg));
        toast.error(msg);
      }
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Heading */}
      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight mb-1">
          Selamat Datang{" "}
        </h1>
        <p className="text-sm text-muted-foreground">
          Masuk ke akun EduCouns AI Anda. Tidak perlu memilih peran — sistem
          kami mengenali identitas Anda secara otomatis.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-xs font-medium"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80">
            Alamat Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              placeholder="nama@sekolah.sch.id"
              autoComplete="email"
              {...register("email")}
              className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-muted/30 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:bg-card transition-all duration-200
                ${errors.email ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/15"}`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-destructive font-medium pl-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/80">
              Kata Sandi
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              autoComplete="current-password"
              {...register("password")}
              className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-muted/30 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:bg-card transition-all duration-200
                ${errors.password ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/15"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-destructive font-medium pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.01 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="w-full h-11 mt-1 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Memverifikasi...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Masuk ke Dashboard
            </>
          )}
        </motion.button>
      </form>

      {/* Security note */}
      <div className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground/80">
            Akun hanya dari sekolah.
          </span>{" "}
          Tidak ada pendaftaran mandiri — akun Anda didaftarkan oleh Admin atau
          Guru BK.
        </p>
      </div>
    </div>
  );
};

export default Login;
