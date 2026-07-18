import { motion } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { RiskLevel } from '../services/analysis.service';
import { useLanguage } from '../hooks/useLanguage';

export function RiskBadge({ level }: { level: RiskLevel }) {
  const { t } = useLanguage();

  const config: Record<RiskLevel, { color: string; bg: string; border: string; shadow: string; icon: any; label: string; pulse?: boolean }> = {
    safe: {
      color: 'text-chart-2',
      bg: 'bg-chart-2/10',
      border: 'border-chart-2/30',
      shadow: 'shadow-[0_0_15px_hsl(var(--chart-2)_/_0.3)]',
      icon: CheckCircle,
      label: t('safe'),
    },
    low: {
      color: 'text-chart-5',
      bg: 'bg-chart-5/10',
      border: 'border-chart-5/30',
      shadow: 'shadow-[0_0_15px_hsl(var(--chart-5)_/_0.3)]',
      icon: Info,
      label: t('low'),
    },
    suspicious: {
      color: 'text-chart-3',
      bg: 'bg-chart-3/10',
      border: 'border-chart-3/30',
      shadow: 'shadow-[0_0_15px_hsl(var(--chart-3)_/_0.3)]',
      icon: AlertTriangle,
      label: t('suspicious'),
    },
    dangerous: {
      color: 'text-chart-4',
      bg: 'bg-chart-4/10',
      border: 'border-chart-4/50',
      shadow: 'shadow-[0_0_20px_hsl(var(--chart-4)_/_0.5)]',
      icon: AlertOctagon,
      label: t('dangerous'),
      pulse: true,
    },
  };

  const { color, bg, border, shadow, icon: Icon, label, pulse } = config[level];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-md ${bg} ${border} ${shadow}`}
    >
      <motion.div
        animate={pulse ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : {}}
        transition={pulse ? { duration: 1.5, repeat: Infinity } : {}}
      >
        <Icon className={`h-6 w-6 ${color}`} />
      </motion.div>
      <span className={`text-xl font-bold uppercase tracking-wider ${color}`}>
        {label}
      </span>
    </motion.div>
  );
}
