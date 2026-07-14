import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/api/client';

export const OTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'email-anda@sekolah.sch.id';
  
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Count down timer logic
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1); // Get last digit
    setOtp(newOtp);

    // Focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      // If current is empty, delete previous and focus previous
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    setTimer(60);
    try {
      await apiClient.post('/v1/auth/resend-otp', { email });
      toast.success('Kode OTP baru telah dikirim ke email Anda.');
    } catch (err: any) {
      toast.error('Gagal mengirim ulang OTP. Silakan coba kembali.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length < 6) {
      toast.error('Masukkan 6 digit kode verifikasi lengkap.');
      return;
    }

    setIsVerifying(true);
    try {
      await apiClient.post('/v1/auth/verify-otp', { email, otp: otpCode });
      toast.success('Email Anda berhasil diverifikasi!');
      navigate('/email-verification', { state: { status: 'success' } });
    } catch (err: any) {
      console.error('OTP verify error:', err);
      // Mock verification for developers
      if (err.message === 'Network Error' || !err.response) {
        setTimeout(() => {
          setIsVerifying(false);
          toast.success('[DEMO] Verifikasi berhasil!');
          navigate('/email-verification', { state: { status: 'success' } });
        }, 1200);
      } else {
        setIsVerifying(false);
        toast.error(err.response?.data?.message || 'Kode OTP salah. Silakan periksa kembali.');
      }
    }
  };

  return (
    <div className="flex flex-col w-full text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto mb-4 border border-primary/20"
      >
        <ShieldCheck className="h-7 w-7" />
      </motion.div>

      <h2 className="text-2xl font-black tracking-tight mb-2">Verifikasi OTP</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        Masukkan 6 digit kode verifikasi yang telah kami kirimkan ke email <span className="font-semibold text-foreground">{email}</span>
      </p>

      <form onSubmit={handleVerify} className="space-y-6">
        {/* OTP Input Fields */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el as HTMLInputElement; }}
              type="text"
              name="otp-digit"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold bg-muted/30 border border-border rounded-xl focus:outline-none focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15 transition-all duration-200"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Resend Timer */}
        <div className="text-xs text-muted-foreground">
          {timer > 0 ? (
            <p>
              Kirim ulang kode dalam <span className="font-bold text-foreground">{timer} detik</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline cursor-pointer focus:outline-none"
            >
              <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" /> Kirim Ulang Kode
            </button>
          )}
        </div>

        {/* Action Button */}
        <motion.button
          type="submit"
          disabled={isVerifying}
          whileHover={{ scale: isVerifying ? 1 : 1.01 }}
          whileTap={{ scale: isVerifying ? 1 : 0.98 }}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {isVerifying ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Memverifikasi...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Verifikasi & Lanjutkan
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default OTP;
