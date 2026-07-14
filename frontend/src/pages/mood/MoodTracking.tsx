import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { PenLine, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import toast from 'react-hot-toast';

const moodHistory = [
  { date: '2026-07-06', mood: 3, note: 'Hari biasa, sedikit lelah karena tugas.' },
  { date: '2026-07-07', mood: 4, note: 'Bermain basket, merasa lebih baik!' },
  { date: '2026-07-08', mood: 2, note: 'Cemas menghadapi presentasi besok.' },
  { date: '2026-07-09', mood: 4, note: 'Presentasi berjalan lancar, lega!' },
  { date: '2026-07-10', mood: 5, note: 'Liburan akhir pekan, sangat menyenangkan.' },
  { date: '2026-07-11', mood: 4, note: 'Belajar bareng teman, produktif.' },
  { date: '2026-07-12', mood: 3, note: 'Biasa saja, sedikit bosan.' },
];

const moods = [
  { val: 1, emoji: '😢', label: 'Sedih', color: 'bg-blue-500/15 border-blue-500/30 text-blue-600' },
  { val: 2, emoji: '😔', label: 'Cemas', color: 'bg-purple-500/15 border-purple-500/30 text-purple-600' },
  { val: 3, emoji: '😐', label: 'Biasa', color: 'bg-muted border-border text-muted-foreground' },
  { val: 4, emoji: '🙂', label: 'Baik', color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600' },
  { val: 5, emoji: '😄', label: 'Gembira', color: 'bg-amber-500/15 border-amber-500/30 text-amber-600' },
];

export const MoodTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'journal' | 'analytics'>('checkin');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journalText, setJournalText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!selectedMood) { toast.error('Pilih mood Anda terlebih dahulu.'); return; }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSelectedMood(null);
      setJournalText('');
      toast.success('Catatan mood dan jurnal hari ini berhasil disimpan!');
    }, 1000);
  };

  const tabs = [
    { id: 'checkin', label: '📝 Check-In Hari Ini' },
    { id: 'journal', label: '📓 Jurnal' },
    { id: 'analytics', label: '📊 Analitik' },
  ] as const;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-black">Mood & Jurnal Harian</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Catat bagaimana perasaanmu setiap hari dan analisis pola emosional mingguan Anda.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold cursor-pointer border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

          {/* CHECK-IN TAB */}
          {activeTab === 'checkin' && (
            <div className="max-w-lg mx-auto space-y-4">
              <Card className="p-6 text-center space-y-4">
                <h3 className="font-bold text-base">Bagaimana perasaanmu hari ini?</h3>
                <div className="flex justify-around">
                  {moods.map((m) => (
                    <button
                      key={m.val}
                      onClick={() => setSelectedMood(m.val)}
                      className={`flex flex-col items-center p-2.5 rounded-2xl border cursor-pointer transition-all duration-200 w-14 ${
                        selectedMood === m.val ? `${m.color} scale-110 shadow-md` : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-[9px] font-semibold mt-1 text-muted-foreground">{m.label}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Tuliskan catatan singkat tentang harimu... (opsional)"
                  className="w-full rounded-xl border border-border bg-card/50 text-xs p-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
                <Button onClick={handleSave} isLoading={isSaving} className="w-full" leftIcon={<PenLine className="h-4 w-4" />}>
                  Simpan Mood Hari Ini
                </Button>
              </Card>
            </div>
          )}

          {/* JOURNAL TAB */}
          {activeTab === 'journal' && (
            <div className="space-y-3 max-w-2xl mx-auto">
              {moodHistory.map((entry) => {
                const mood = moods.find((m) => m.val === entry.mood);
                return (
                  <Card key={entry.date} className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-muted/40">
                      {mood?.emoji}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          {format(new Date(entry.date), 'EEEE, d MMMM yyyy', { locale: localeId })}
                        </span>
                        <Badge variant="outline">{mood?.label}</Badge>
                      </div>
                      <p className="text-sm mt-1 text-foreground/80 italic">"{entry.note}"</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Tren Emosi Mingguan</span>
                </CardTitle>
                <CardDescription>Visualisasi skor mood Anda selama 7 hari terakhir.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodHistory.map((d) => ({ name: format(new Date(d.date), 'EEE', { locale: localeId }), mood: d.mood }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMoodTrack" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                      <YAxis domain={[1, 5]} tickCount={5} stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="mood" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMoodTrack)" name="Skor Mood" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MoodTracking;
