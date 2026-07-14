import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

export const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const status = location.state?.status || 'success';
  const isSuccess = status === 'success';

  return (
    <div className="flex flex-col w-full text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4 border ${
          isSuccess
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-7 w-7" />
        ) : (
          <XCircle className="h-7 w-7" />
        )}
      </motion.div>

      <h2 className="text-2xl font-black tracking-tight mb-2">
        {isSuccess ? 'Akun Terverifikasi! 🎉' : 'Verifikasi Gagal'}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-xs mx-auto">
        {isSuccess
          ? 'Selamat! Email Anda telah berhasil diverifikasi. Sekarang Anda dapat mengakses semua fitur EduCouns AI.'
          : 'Tautan atau kode verifikasi Anda salah, tidak valid, atau telah kadaluarsa. Silakan lakukan proses verifikasi ulang.'}
      </p>

      {isSuccess ? (
        <motion.button
          onClick={() => navigate('/login')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all duration-200 cursor-pointer"
        >
          Masuk Sekarang
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      ) : (
        <div className="flex flex-col gap-3">
          <motion.button
            onClick={() => navigate('/otp')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </motion.button>
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-11 rounded-xl border border-border bg-transparent text-sm font-bold flex items-center justify-center gap-2 hover:bg-muted/40 transition-all duration-200 cursor-pointer"
          >
            Kembali ke Login
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
