import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const shouldReduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const step1 = window.setTimeout(() => setProgress(58), 220);
    const step2 = window.setTimeout(() => setProgress(92), 540);
    const step3 = window.setTimeout(() => setProgress(100), 780);
    const doneTimer = window.setTimeout(
      () => onComplete(),
      shouldReduceMotion ? 450 : 950
    );

    return () => {
      window.clearTimeout(step1);
      window.clearTimeout(step2);
      window.clearTimeout(step3);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete, shouldReduceMotion]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="جارٍ تحميل أكاديمية عزيز"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.15 : 0.35, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#f0f9ff] via-[#f8fcff] to-[#ecfeff] px-6 text-center select-none"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center max-w-sm w-full"
      >
        {/* Logo Emblem */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-lg shadow-sky-200/70 border-2 border-white bg-gradient-to-br from-sky-600 via-sky-700 to-teal-700 flex items-center justify-center">
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full"
            role="img"
            aria-label="شعار أكاديمية عزيز"
          >
            <defs>
              <linearGradient id="splashSkyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
              <linearGradient id="splashGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#splashSkyGrad)" />
            <path
              d="M12 52V36C12 24.954 20.954 16 32 16C43.046 16 52 24.954 52 36V52H12Z"
              fill="#ffffff"
              fillOpacity="0.16"
            />
            <path
              d="M19 48V35C19 27.82 24.82 22 32 22C39.18 22 45 27.82 45 35V48"
              stroke="#ffffff"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M21 44.5C24.5 42.5 28.5 42.5 32 44.8C35.5 42.5 39.5 42.5 43 44.5V35.5C39.5 33.5 35.5 33.5 32 35.8C28.5 33.5 24.5 33.5 21 35.5V44.5Z"
              fill="#ffffff"
            />
            <line
              x1="32"
              y1="35.8"
              x2="32"
              y2="44.8"
              stroke="#0284c7"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M32 9L34.1 13.8L39.2 14.3L35.3 17.7L36.5 22.8L32 20.1L27.5 22.8L28.7 17.7L24.8 14.3L29.9 13.8L32 9Z"
              fill="url(#splashGoldGrad)"
            />
          </svg>
        </div>

        {/* Platform Name directly below the Logo */}
        <h1 className="mt-5 text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
          أكاديمية عزيز
        </h1>
        <p className="mt-1.5 text-sm sm:text-base font-semibold text-sky-700">
          منصة التعليم الابتدائي التفاعلية · 2026
        </p>

        {/* Loading Indicator */}
        <div className="mt-7 w-60 space-y-2.5">
          <div className="h-2 w-full rounded-full bg-sky-100 overflow-hidden border border-sky-200/70">
            <div
              className={`h-full rounded-full bg-gradient-to-l from-sky-500 via-teal-500 to-amber-400 transition-all duration-300 ease-out ${
                progress >= 100
                  ? 'w-full'
                  : progress >= 85
                  ? 'w-11/12'
                  : progress >= 50
                  ? 'w-3/5'
                  : 'w-1/4'
              }`}
            />
          </div>
          <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
            <Loader2
              className="w-4 h-4 text-sky-600 animate-spin shrink-0"
              aria-hidden="true"
            />
            <span>جارٍ تحميل الدروس والأنشطة...</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
