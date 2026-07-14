import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/button';

interface OnboardingSlide {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const slides: OnboardingSlide[] = [
  {
    title: 'AI Counseling Chat',
    description: 'Bicarakan keluh kesahmu kapan saja secara privat. Chatbot AI kami siap mendengarkan dan memberikan respon empati 24/7.',
    icon: <MessageSquare className="h-16 w-16 text-primary-foreground" />,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Asesmen Psikologis Klinis',
    description: 'Deteksi dini kondisi kesehatan mentalmu secara ilmiah menggunakan asesmen standar psikologi klinis (PHQ-9, GAD-7, DASS-21).',
    icon: <ShieldCheck className="h-16 w-16 text-primary-foreground" />,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Hubungkan dengan Guru BK',
    description: 'Butuh bantuan lebih lanjut? Agendakan sesi konseling tatap muka atau video call secara terintegrasi dengan Guru BK sekolahmu.',
    icon: <HeartHandshake className="h-16 w-16 text-primary-foreground" />,
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export const Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    localStorage.setItem('educouns-onboarding-seen', 'true');
    navigate('/login');
  };

  const activeSlide = slides[currentSlide];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-8 bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[90px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-secondary/5 blur-[90px]" />

      {/* Top Bar */}
      <div className="w-full max-w-lg flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary text-primary-foreground font-bold flex items-center justify-center text-sm">
            EC
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            EduCouns AI
          </span>
        </div>
        <button
          onClick={handleFinish}
          className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
        >
          Skip
        </button>
      </div>

      {/* Content Slider */}
      <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center py-8 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center"
          >
            {/* Slide Graphic */}
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-tr ${activeSlide.gradient} flex items-center justify-center shadow-xl shadow-primary/10 mb-8 interactive-hover`}>
              {activeSlide.icon}
            </div>

            {/* Slide Title */}
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 px-4">
              {activeSlide.title}
            </h2>

            {/* Slide Description */}
            <p className="text-sm sm:text-base text-muted-foreground max-w-md px-6 leading-relaxed">
              {activeSlide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="w-full max-w-lg flex flex-col items-center gap-6 z-10">
        {/* Progress Dot Indicators */}
        <div className="flex items-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/35 hover:bg-muted-foreground/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="w-full flex items-center justify-between gap-4 mt-2">
          {currentSlide > 0 ? (
            <Button
              variant="outline"
              onClick={() => setCurrentSlide((prev) => prev - 1)}
              className="flex-1"
            >
              Kembali
            </Button>
          ) : (
            <div className="flex-1" />
          )}

          <Button
            onClick={handleNext}
            rightIcon={currentSlide === slides.length - 1 ? undefined : <ArrowRight className="h-4 w-4" />}
            className="flex-1"
          >
            {currentSlide === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
