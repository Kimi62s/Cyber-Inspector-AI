import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export function ScanAnimation() {
  const { t } = useLanguage();

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 gap-8 relative overflow-hidden rounded-xl border border-primary/20 bg-background/50 backdrop-blur-md">
      <div className="relative">
        {/* Spinning Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-8 border border-primary/30 border-t-primary rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border border-dashed border-primary/40 rounded-full"
        />
        
        {/* Center Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 bg-background rounded-full p-4 border border-primary/50 shadow-[0_0_30px_hsl(var(--primary)_/_0.5)]"
        >
          <ShieldAlert className="h-12 w-12 text-primary" />
        </motion.div>

        {/* Vertical Scan Line local to icon */}
        <motion.div
          animate={{ y: [-40, 40] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
          className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_hsl(var(--primary))] z-20 top-1/2"
        />
      </div>

      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-xl font-mono text-primary tracking-widest uppercase"
      >
        {t('scanInProgress')}
      </motion.div>
    </div>
  );
}
