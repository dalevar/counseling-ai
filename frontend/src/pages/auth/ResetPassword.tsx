import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password minimal harus 8 karakter')
      .regex(/[a-z]/, 'Harus mengandung setidaknya satu huruf kecil')
      .regex(/[A-Z]/, 'Harus mengandung setidaknya satu huruf besar')
      .regex(/[0-9]/, 'Harus mengandung setidaknya satu angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type ResetPasswordFields = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFields) => {
    if (!token || !email) {
      toast.error('Token pemulihan tidak valid atau kadaluarsa.');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/v1/auth/reset-password', { email, token, password: data.password });
      setIsSuccess(true);
      toast.success('Kata sandi Anda berhasil diperbarui!');
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast.error(err.response?.data?.message || 'Gagal mereset kata sandi. Tautan mungkin kadaluarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col w-full text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto mb-4 border border-emerald-500/20"
        >
          <CheckCircle2 className="h-7 w-7" />
        </motion.div>
        <h2 className="text-2xl font-black tracking-tight mb-2">Kata Sandi Diperbarui!</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
          Kata sandi baru Anda telah aktif. Sekarang Anda dapat masuk kembali ke akun EduCouns AI Anda.
        </p>
        <motion.button
          onClick={() => navigate('/login')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all duration-200 cursor-pointer"
        >
          Masuk ke Aplikasi
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4 border border-primary/20"
      >
        <KeyRound className="h-5 w-5" />
      </motion.div>

      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight mb-1">Reset Kata Sandi</h2>
        <p className="text-sm text-muted-foreground">
          Masukkan kata sandi baru untuk akun{' '}
          {email && <span className="font-semibold text-foreground">{email}</span>}.
          Pastikan kata sandi aman dan mudah Anda ingat.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80">Password Baru</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 karakter, huruf besar/kecil & angka"
              {...register('password')}
              className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-muted/30 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:bg-card transition-all duration-200
                ${errors.password ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/15'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-destructive font-medium pl-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80">Konfirmasi Password Baru</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Ulangi password baru Anda"
              {...register('confirmPassword')}
              className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-muted/30 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:bg-card transition-all duration-200
                ${errors.confirmPassword ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/15'}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-[11px] text-destructive font-medium pl-1">{errors.confirmPassword.message}</p>}
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.01 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="w-full h-11 mt-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Memperbarui...
            </>
          ) : (
            'Perbarui Kata Sandi'
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default ResetPassword;
