import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  Smile,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import toast from 'react-hot-toast';

// Mock data for Recharts assessment trend
const assessmentData = [
  { name: 'Minggu 1', phq9: 8, gad7: 12 },
  { name: 'Minggu 2', phq9: 6, gad7: 10 },
  { name: 'Minggu 3', phq9: 4, gad7: 7 },
  { name: 'Minggu 4', phq9: 3, gad7: 5 },
];

export const StudentDashboard: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const moods = [
    { value: 1, emoji: '😢', label: 'Sedih' },
    { value: 2, emoji: '😐', label: 'Biasa' },
    { value: 3, emoji: '🙂', label: 'Baik' },
    { value: 4, emoji: '😄', label: 'Senang' },
    { value: 5, emoji: '😆', label: 'Gembira' },
  ];

  const handleMoodSubmit = (value: number, label: string) => {
    setSelectedMood(value);
    toast.success(`Jurnal mood Anda hari ini disimpan: ${label}. Tetap semangat!`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
      >
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>EduCouns AI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Halo, Ahmad! Bagaimana kabarmu hari ini?</h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Kami hadir untuk membantu memantau kondisi mentalmu. Lakukan mood check-in hari ini atau mulailah berkonsultasi dengan konselor sekolah.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            onClick={() => toast.success('Mengalihkan ke Konseling AI...')}
            leftIcon={<BrainCircuit className="h-4.5 w-4.5" />}
          >
            Konseling AI Sekarang
          </Button>
        </div>
      </motion.div>

      {/* Grid Quick Dashboard Stats & Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mood Check-In Widget */}
        <Card className="glass lg:col-span-1 border-primary/10 flex flex-col text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-secondary" />
              <span>Mood Check-In</span>
            </CardTitle>
            <CardDescription>
              Bagaimana perasaanmu sekarang? Catat mood untuk melihat perkembangan mingguan Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="flex justify-around gap-2 my-4">
              {moods.map((mood) => {
                const isActive = selectedMood === mood.value;
                return (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodSubmit(mood.value, mood.label)}
                    className={`
                      w-12 h-14 rounded-2xl border text-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 interactive-hover
                      ${
                        isActive
                          ? 'border-secondary bg-secondary/15 scale-105 shadow-md shadow-secondary/10'
                          : 'border-border bg-card/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    <span>{mood.emoji}</span>
                    <span className="text-[9px] text-muted-foreground mt-1 font-medium">{mood.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border flex gap-2 text-xs text-muted-foreground items-start">
              <Info className="h-4 w-4 shrink-0 text-secondary mt-0.5" />
              <span>Catatan jurnal mood membantu AI kami merumuskan coping strategy yang tepat untuk Anda.</span>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Scoring Trend Chart */}
        <Card className="lg:col-span-2 text-left">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Tren Tingkat Kecemasan & Depresi</span>
              </CardTitle>
              <CardDescription>
                Visualisasi perkembangan kesehatan mental Anda berdasarkan kuesioner PHQ-9 & GAD-7 bulanan.
              </CardDescription>
            </div>
            <Badge variant="success">Kondisi Membaik</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={assessmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPhq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="phq9"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPhq)"
                    name="Depresi (PHQ-9)"
                  />
                  <Area
                    type="monotone"
                    dataKey="gad7"
                    stroke="var(--color-secondary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGad)"
                    name="Kecemasan (GAD-7)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Reminder & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Next Session Reminder Card */}
        <Card className="text-left border-dashed border-primary bg-primary/[0.02]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5" />
              <span>Sesi Konseling Terdekat</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-bold text-foreground">Bimbingan Karir & Akademik</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Dengan: Guru BK Sri Wahyuni, M.Psi.</p>
              </div>
              <Badge variant="outline" className="border-primary text-primary">Besok, 09:00 WIB</Badge>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">Gabung Sesi</Button>
              <Button size="sm" variant="outline" className="flex-1">Reschedule</Button>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Assessment Alert */}
        <Card className="text-left border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4.5 w-4.5" />
              <span>Asesmen Pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-base font-bold text-foreground">Asesmen Stres Mingguan (DASS-21)</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Asesmen wajib berkala dari sekolah Anda.</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Waktu Pengerjaan: ~5 menit</span>
              <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                Mulai Tes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
