import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnalysisCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
}

export function AnalysisCard({ title, icon, children, delay = 0 }: AnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-xl overflow-hidden shadow-lg border-primary/20"
    >
      <div className="px-6 py-4 border-b border-primary/10 bg-primary/5 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}
