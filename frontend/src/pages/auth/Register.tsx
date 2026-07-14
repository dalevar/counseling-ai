import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Register — Halaman Pendaftaran Ditutup
 *
 * Pendaftaran publik tidak tersedia.
 * Akun pengguna, khususnya akun siswa, hanya dapat
 * dibuatkan oleh sekolah melalui Admin sekolah atau Guru BK.
 *
 * Halaman ini muncul sebagai fallback jika ada yang mengakses /register secara langsung.
 */
export const Register: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Hubungi Sekolah',
      desc: 'Siswa harus meminta sekolah, Admin, atau Guru BK untuk dibuatkan akun.',
    },
    {
      title: 'Akun Dibuatkan',
      desc: 'Admin sekolah atau Guru BK membuat akun Anda melalui panel internal sekolah.',
    },
    {
      title: 'Terima Kredensial',
      desc: 'Anda akan menerima informasi login atau instruksi akses dari sekolah untuk masuk pertama kali.',
    },
  ];

  return (
    <div className="flex flex-col items-center text-center w-full">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
        <span className="text-sm font-black text-amber-600 dark:text-amber-400">
          REG
        </span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-black tracking-tight mb-2">
        Pendaftaran Mandiri Tidak Tersedia
      </h2>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
        Demi keamanan data siswa, akun EduCouns AI tidak bisa dibuat sendiri.
        Akun siswa harus dibuatkan oleh <strong>Admin Sekolah</strong>,{' '}
        <strong>Guru BK</strong>, atau pihak sekolah yang berwenang.
      </p>

      {/* Steps */}
      <div className="w-full mt-6 space-y-3 text-left">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1 mb-2">
          Cara mendapatkan akun siswa
        </p>
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border"
          >
            <div className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-[10px] font-black text-primary">OK</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Back to login */}
      <div className="w-full mt-6">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="h-11 w-full rounded-xl border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
        >
          Kembali ke Halaman Login
        </button>
      </div>
    </div>
  );
};

export default Register;
