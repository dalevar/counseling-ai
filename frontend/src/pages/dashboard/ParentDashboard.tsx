import React from 'react';
import {
  Heart,
  Smile,
  ShieldCheck,
  BookOpen,
  ArrowRight,
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

// Mock child mood history
const childMoodData = [
  { name: 'Senin', mood: 3 },
  { name: 'Selasa', mood: 4 },
  { name: 'Rabu', mood: 2 },
  { name: 'Kamis', mood: 4 },
  { name: 'Jumat', mood: 5 },
  { name: 'Sabtu', mood: 4 },
  { name: 'Minggu', mood: 5 },
];

export const ParentDashboard: React.FC = () => {
  const childLogs = [
    { id: '1', date: 'Jumat, 10 Juli 2026', teacher: 'Ibu Sri Wahyuni, M.Psi. (Guru BK)', note: 'Budi menunjukkan keaktifan yang sangat baik dalam konseling kelompok hari ini. Rasa percaya dirinya mulai meningkat.' },
    { id: '2', date: 'Rabu, 08 Juli 2026', teacher: 'Ibu Sri Wahyuni, M.Psi. (Guru BK)', note: 'Budi agak murung karena hasil ujian matematika. Kami telah mendiskusikan strategi coping belajar yang efektif.' },
  ];

  const suggestedArticles = [
    { id: 'art-1', title: 'Cara Mendukung Anak Menghadapi Stres Ujian Sekolah', time: '5 menit baca' },
    { id: 'art-2', title: 'Mengenali Gejala Awal Kecemasan pada Remaja', time: '7 menit baca' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-pink-500/10 via-primary/10 to-secondary/5 border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left space-y-1">
          <h2 className="text-xl sm:text-2xl font-black">Selamat Datang, Ayah/Ibu Budi!</h2>
          <p className="text-sm text-muted-foreground">
            Pantau perkembangan emosional dan catatan bimbingan konseling Budi Santoso di sekolah secara real-time.
          </p>
        </div>
        <div className="shrink-0 flex gap-2">
          <Button
            size="sm"
            onClick={() => toast.success('Mengirim pesan ke Guru BK...')}
            leftIcon={<Heart className="h-4 w-4" />}
            className="bg-pink-600 hover:bg-pink-700 text-white shadow-none"
          >
            Hubungi Guru BK
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Child Mood Analytics */}
        <Card className="lg:col-span-2 text-left">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-pink-500" />
                <span>Tren Mood Budi Pekan Ini</span>
              </CardTitle>
              <CardDescription>
                Visualisasi perasaan harian anak Anda berdasarkan check-in mood mandiri.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-pink-500 text-pink-600 dark:text-pink-400">Stabil & Positif</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={childMoodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis
                    domain={[1, 5]}
                    tickCount={5}
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => {
                      if (val === 1) return '😢';
                      if (val === 3) return '😐';
                      if (val === 5) return '😆';
                      return '';
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorMood)"
                    name="Skor Mood"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Suggested parenting guidance */}
        <Card className="lg:col-span-1 text-left flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-secondary" />
              <span>Panduan Orang Tua</span>
            </CardTitle>
            <CardDescription>
              Artikel dan tips psikologi anak yang disarankan oleh Konselor Sekolah.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {suggestedArticles.map((art) => (
              <div key={art.id} className="p-3.5 border border-border bg-muted/20 rounded-2xl cursor-pointer hover:bg-muted/40 transition-colors duration-200">
                <h4 className="text-xs font-bold text-foreground leading-snug">{art.title}</h4>
                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-[10px] text-muted-foreground">{art.time}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Counseling notes & progress report */}
      <Card className="text-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>Catatan Perkembangan Konseling Sekolah</span>
          </CardTitle>
          <CardDescription>
            Ringkasan hasil bimbingan dan perkembangan psikologis anak di bawah pengawasan Guru BK.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {childLogs.map((log) => (
            <div key={log.id} className="p-4 border border-border bg-card rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary">{log.teacher}</span>
                <span className="text-[10px] text-muted-foreground">{log.date}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                "{log.note}"
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentDashboard;
