import React from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

const features = [
  {
    icon: "AI",
    title: "AI Counseling 24/7",
    desc: "Dukungan emosional kapan saja, didukung model AI klinis.",
  },
  {
    icon: "AS",
    title: "Asesmen Psikologis",
    desc: "PHQ-9, GAD-7, dan DASS-21 berbasis standar klinis internasional.",
  },
  {
    icon: "BK",
    title: "Konseling Terintegrasi",
    desc: "Terhubung langsung dengan Guru BK & Konselor sekolah.",
  },
  {
    icon: "MH",
    title: "Pemantauan Mood",
    desc: "Lacak kondisi mental harian dengan laporan terstruktur.",
  },
];

const stats = [
  { value: "10K+", label: "Siswa Aktif" },
  { value: "98%", label: "Tingkat Kepuasan" },
  { value: "500+", label: "Sekolah Mitra" },
];

const AuthLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden bg-gradient-to-br from-[hsl(221,83%,18%)] via-[hsl(225,80%,24%)] to-[hsl(235,72%,30%)]">
        <div className="absolute top-[-15%] left-[-10%] w-[480px] h-[480px] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-400/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] rounded-full bg-indigo-300/8 blur-[80px] pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-sm font-black text-white">EC</span>
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight leading-none">
                EduCouns AI
              </p>
              <p className="text-white/50 text-[11px] font-medium">
                E-Counseling Platform
              </p>
            </div>
          </div>

          <div className="my-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-[11px] font-semibold tracking-wide mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Platform Aktif & Siap Digunakan
            </span>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-[1.15] tracking-tight mb-4">
              Platform Konseling
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-300">
                Kesehatan Mental
              </span>{" "}
              Sekolah
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Mendukung siswa, guru BK, dan orang tua dalam menciptakan
              lingkungan belajar yang sehat secara emosional.
            </p>
          </div>

          <div className="space-y-3 mb-10">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 group">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-white/70 group-hover:bg-white/12 group-hover:text-white transition-all duration-200">
                  <span className="text-[10px] font-black tracking-wide">
                    {feature.icon}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">
                    {feature.title}
                  </p>
                  <p className="text-white/45 text-[11px] mt-0.5 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-6 pt-6 border-t border-white/10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-[11px] text-white/45 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl border border-border bg-card/70 backdrop-blur-md text-foreground shadow-sm hover:bg-muted/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
          >
            <span className="text-[11px] font-bold">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>
        </div>

        <div className="lg:hidden flex items-center gap-2.5 px-6 pt-8 pb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary text-primary-foreground font-black flex items-center justify-center text-sm shadow-lg shadow-primary/20">
            EC
          </div>
          <div>
            <p className="font-black text-base leading-none">EduCouns AI</p>
            <p className="text-[10px] text-muted-foreground">
              E-Counseling Platform
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[420px]">
            <Outlet />
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-[11px] text-muted-foreground/60">
            © {new Date().getFullYear()} EduCouns AI · Semua data dilindungi dan
            dienkripsi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
