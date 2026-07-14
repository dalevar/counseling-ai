import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has already seen onboarding or is authenticated
      const hasSeenOnboarding = localStorage.getItem('educouns-onboarding-seen');
      if (hasSeenOnboarding) {
        navigate('/login', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background blur objects */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-secondary/10 blur-[80px]" />

      <div className="flex flex-col items-center z-10">
        {/* Brand Icon Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-secondary text-primary-foreground font-black text-4xl shadow-2xl shadow-primary/30 mb-6"
        >
          EC
        </motion.div>

        {/* Brand Text Animation */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight"
        >
          EduCouns AI
        </motion.h1>

        {/* Brand Subtitle */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 0.7 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-sm font-medium text-muted-foreground mt-2 text-center max-w-[280px]"
        >
          AI-Powered Counseling & Psychological Assessment
        </motion.p>
      </div>

      {/* Loading Bar at Bottom */}
      <div className="absolute bottom-16 w-48 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ left: '-100%' }}
          animate={{ left: '100%' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-primary to-secondary rounded-full"
        />
      </div>

      {/* Security note */}
      <span className="absolute bottom-6 text-[10px] text-muted-foreground opacity-60">
        Secure & Encrypted Connection
      </span>
    </div>
  );
};

export default SplashScreen;
