import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ThreatScoreMeterProps {
  score: number;
  label: string;
}

export function ThreatScoreMeter({ score, label }: ThreatScoreMeterProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1500; // ms
    const steps = 60;
    const stepTime = duration / steps;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Determine color based on score
  let colorVar = '--chart-2'; // green
  if (score >= 76) colorVar = '--chart-4'; // red
  else if (score >= 51) colorVar = '--chart-3'; // amber
  else if (score >= 26) colorVar = '--chart-5'; // cyan/blue-ish (low risk)

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Glow effect matching score color */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-4 rounded-full blur-2xl opacity-20"
          style={{ backgroundColor: `hsl(var(${colorVar}))` }}
        />

        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            fill="none"
            className="opacity-30"
          />
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            stroke={`hsl(var(${colorVar}))`}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
              filter: `drop-shadow(0 0 8px hsl(var(${colorVar}) / 0.5))`
            }}
          />
        </svg>
        
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span 
            className="text-4xl font-black font-mono tracking-tighter"
            style={{ color: `hsl(var(${colorVar}))` }}
          >
            {displayScore}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">/ 100</span>
        </div>
      </div>
      <div className="mt-4 text-lg font-medium text-foreground tracking-wide">{label}</div>
    </div>
  );
}
