import { ExternalLink, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { VTStats } from '../services/analysis.service';
import { useLanguage } from '../hooks/useLanguage';
import { AnalysisCard } from './AnalysisCard';

interface StatBubbleProps {
  label: string;
  value: number;
  color: string;
  bg: string;
}

function StatBubble({ label, value, color, bg }: StatBubbleProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl p-4 ${bg} border border-transparent`}>
      <span className={`text-3xl font-black font-mono ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground mt-1 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}

interface VTStatsPanelProps {
  stats: VTStats;
  delay?: number;
}

export function VTStatsPanel({ stats, delay = 0 }: VTStatsPanelProps) {
  const { t } = useLanguage();

  const reputationColor =
    stats.reputation > 0
      ? 'text-chart-2'
      : stats.reputation < -5
      ? 'text-chart-4'
      : 'text-muted-foreground';

  return (
    <AnalysisCard title={t('vtTitle')} icon={<Shield className="h-5 w-5" />} delay={delay}>
      <div className="space-y-5">
        {/* Detection grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBubble
            label={t('vtMalicious')}
            value={stats.malicious}
            color={stats.malicious > 0 ? 'text-chart-4' : 'text-muted-foreground'}
            bg={stats.malicious > 0 ? 'bg-chart-4/10' : 'bg-secondary/50'}
          />
          <StatBubble
            label={t('vtSuspicious')}
            value={stats.suspicious}
            color={stats.suspicious > 0 ? 'text-chart-3' : 'text-muted-foreground'}
            bg={stats.suspicious > 0 ? 'bg-chart-3/10' : 'bg-secondary/50'}
          />
          <StatBubble
            label={t('vtHarmless')}
            value={stats.harmless}
            color="text-chart-2"
            bg="bg-chart-2/10"
          />
          <StatBubble
            label={t('vtUndetected')}
            value={stats.undetected}
            color="text-muted-foreground"
            bg="bg-secondary/50"
          />
        </div>

        {/* Engines bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('vtEngines')}: {stats.totalEngines}</span>
            {stats.malicious > 0 && (
              <span className="text-chart-4 font-medium">
                {Math.round((stats.malicious / stats.totalEngines) * 100)}% {t('vtMaliciousPct')}
              </span>
            )}
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden w-full bg-secondary">
            {stats.malicious > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.malicious / stats.totalEngines) * 100}%` }}
                transition={{ duration: 0.8, delay: delay + 0.3 }}
                className="bg-chart-4 h-full"
              />
            )}
            {stats.suspicious > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.suspicious / stats.totalEngines) * 100}%` }}
                transition={{ duration: 0.8, delay: delay + 0.4 }}
                className="bg-chart-3 h-full"
              />
            )}
            {stats.harmless > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.harmless / stats.totalEngines) * 100}%` }}
                transition={{ duration: 0.8, delay: delay + 0.5 }}
                className="bg-chart-2 h-full"
              />
            )}
          </div>
        </div>

        {/* Reputation */}
        <div className="flex items-center justify-between px-1 py-2 rounded-lg bg-secondary/30">
          <span className="text-sm text-muted-foreground">{t('vtReputation')}</span>
          <span className={`text-lg font-bold font-mono ${reputationColor}`}>
            {stats.reputation > 0 ? `+${stats.reputation}` : stats.reputation}
          </span>
        </div>

        {/* Full report link */}
        <a
          href={stats.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group mt-1"
        >
          <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
          {t('vtViewFull')}
        </a>
      </div>
    </AnalysisCard>
  );
}
