import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

type ForgotPasswordFields = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: ForgotPasswordFields) => {
    setIsLoading(true);
    try {
      await apiClient.post('/v1/auth/forgot-password', data);
      setIsSubmitted(true);
      toast.success('Link pemulihan kata sandi telah dikirim!');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      // Fallback mock success
      if (err.message === 'Network Error' || !err.response) {
        setTimeout(() => {
          setIsLoading(false);
          setIsSubmitted(true);
          toast.success('[DEMO] Link pemulihan kata sandi berhasil dikirim.');
        }, 1200);
      } else {
        setIsLoading(false);
        toast.error(err.response?.data?.message || 'Gagal mengirim email pemulihan. Cek kembali email Anda.');
      }
    }
  };

  if (isSubmitted) {
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
        <h2 className="text-xl font-black tracking-tight mb-2">Periksa Email Anda</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-xs mx-auto">
          Kami telah mengirimkan instruksi pemulihan kata sandi ke email Anda. Silakan ikuti tautan di dalam email tersebut untuk mengatur ulang kata sandi Anda.
        </p>
        <Link to="/login" className="w-full">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all duration-200 cursor-pointer"
          >
            Kembali ke Halaman Masuk
          </motion.button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="mb-4">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Kembali ke Halaman Masuk
        </Link>
      </div>

      <div className="mb-7">
        <h2 className="text-2xl font-black tracking-tight mb-1">Lupa Kata Sandi?</h2>
        <p className="text-sm text-muted-foreground">
          Masukkan email terdaftar Anda di bawah. Kami akan mengirimkan tautan pemulihan untuk mengatur ulang kata sandi Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80">Alamat Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              placeholder="nama@sekolah.sch.id"
              {...register('email')}
              className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-muted/30 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:bg-card transition-all duration-200
                ${errors.email ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/15'}`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-destructive font-medium pl-1">{errors.email.message}</p>}
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
              Mengirim...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Kirim Link Pemulihan
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default ForgotPassword;
