import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import toast from 'react-hot-toast';

const assessmentTypes = [
  { id: 'phq9', name: 'PHQ-9', fullName: 'Patient Health Questionnaire-9', description: 'Skrining depresi yang telah tervalidasi secara klinis untuk memantau tingkat kesehatan mental.', questions: 9, duration: '5 menit', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'gad7', name: 'GAD-7', fullName: 'Generalized Anxiety Disorder-7', description: 'Skrining kecemasan umum tervalidasi untuk menilai tingkat gangguan kecemasan pada remaja.', questions: 7, duration: '3 menit', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'dass21', name: 'DASS-21', fullName: 'Depression Anxiety Stress Scale', description: 'Penilaian komprehensif atas tingkat depresi, kecemasan, dan stres secara bersamaan.', questions: 21, duration: '10 menit', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
];

const sampleQuestions = [
  'Seberapa sering Anda terganggu oleh perasaan sedih, murung, atau tanpa harapan?',
  'Seberapa sering Anda mengalami sedikit minat atau kesenangan dalam melakukan hal-hal?',
  'Seberapa sering Anda merasa lelah atau tidak berenergi?',
  'Seberapa sering Anda memiliki nafsu makan yang buruk atau makan terlalu banyak?',
];

const options = [
  { val: 0, label: 'Tidak pernah' },
  { val: 1, label: 'Beberapa hari' },
  { val: 2, label: 'Lebih dari setengah hari' },
  { val: 3, label: 'Hampir setiap hari' },
];

export const Assessment: React.FC = () => {
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleStart = (id: string) => {
    setActiveAssessment(id);
    setCurrentQ(0);
    setAnswers({});
    setIsComplete(false);
  };

  const handleAnswer = (val: number) => {
    const updated = { ...answers, [currentQ]: val };
    setAnswers(updated);
    if (currentQ < sampleQuestions.length - 1) {
      setTimeout(() => setCurrentQ((prev) => prev + 1), 300);
    } else {
      setTimeout(() => setIsComplete(true), 300);
    }
  };

  const score = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const maxScore = sampleQuestions.length * 3;
  const pct = Math.round((score / maxScore) * 100);

  const getSeverity = () => {
    if (pct <= 25) return { label: 'Minimal', variant: 'success' as const };
    if (pct <= 50) return { label: 'Ringan', variant: 'outline' as const };
    if (pct <= 75) return { label: 'Sedang', variant: 'warning' as const };
    return { label: 'Berat', variant: 'destructive' as const };
  };

  if (activeAssessment) {
    if (isComplete) {
      const severity = getSeverity();
      return (
        <div className="max-w-xl mx-auto space-y-6 text-left">
          <Card className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h2 className="text-xl font-black">Asesmen Selesai!</h2>
            <p className="text-sm text-muted-foreground">Hasil analisis skrining psikologis awal Anda telah diproses.</p>

            <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Skor Total</span>
                <span className="font-bold text-2xl">{score} / {maxScore}</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Tingkat Gejala</span>
                <Badge variant={severity.variant}>{severity.label}</Badge>
              </div>
            </div>

            {pct > 50 && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Skor Anda mengindikasikan gejala di atas ambang ringan. Disarankan untuk segera berkonsultasi dengan Guru BK atau Konselor Sekolah.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setActiveAssessment(null)}>Kembali</Button>
              <Button className="flex-1" onClick={() => toast.success('Hasil dikirim ke Guru BK.')}>Kirim ke Guru BK</Button>
            </div>
          </Card>
        </div>
      );
    }

    const progress = ((currentQ + 1) / sampleQuestions.length) * 100;
    return (
      <div className="max-w-xl mx-auto space-y-6 text-left">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveAssessment(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
            <ChevronLeft className="h-4 w-4" /> Batal
          </button>
          <span className="text-xs text-muted-foreground">{currentQ + 1} dari {sampleQuestions.length}</span>
        </div>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <Card className="p-6">
              <p className="text-sm sm:text-base font-semibold leading-relaxed mb-6">
                {currentQ + 1}. {sampleQuestions[currentQ]}
              </p>
              <div className="space-y-2.5">
                {options.map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => handleAnswer(opt.val)}
                    className="w-full flex items-center gap-3 p-3.5 border border-border rounded-2xl text-sm text-left cursor-pointer hover:bg-primary/10 hover:border-primary transition-all duration-200"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 flex items-center justify-center shrink-0" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-black">Asesmen Psikologis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Isi kuesioner psikologis terstandar untuk memantau dan memahami kondisi mentalmu saat ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assessmentTypes.map((a) => (
          <Card key={a.id} className="p-5 flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl ${a.bg} ${a.color} flex items-center justify-center font-black text-lg`}>
              {a.name.split('-')[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base">{a.name}</h3>
              <p className="text-[10px] text-muted-foreground font-medium mb-2">{a.fullName}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {a.questions} pertanyaan</span>
              <span>~{a.duration}</span>
            </div>
            <Button size="sm" onClick={() => handleStart(a.id)} rightIcon={<ChevronRight className="h-4 w-4" />}>
              Mulai Asesmen
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Assessment;
