import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Share2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { ThreatScoreMeter } from '../components/ThreatScoreMeter';
import { RiskBadge } from '../components/RiskBadge';
import { AnalysisCard } from '../components/AnalysisCard';
import { AnalysisResult } from '../services/analysis.service';
import { Button } from '../components/ui/button';
import { generateReport } from '../lib/pdf-export';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { history } = useAnalysisHistory();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (id) {
      const found = history.find(h => h.id === id);
      if (found) {
        setResult(found);
      } else {
        // Not found in history, redirect to analyze
        navigate('/analyze');
      }
    }
  }, [id, history, navigate]);

  if (!result) return null;

  const handleDownload = () => {
    generateReport(result, language);
  };

  const getSeverityColor = (sev: string) => {
    if (sev === 'high') return 'text-destructive bg-destructive/10';
    if (sev === 'medium') return 'text-chart-3 bg-chart-3/10';
    return 'text-chart-5 bg-chart-5/10';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
          <Link to="/analyze">
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
            Back to Scanner
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground font-mono">
          {new Date(result.timestamp).toLocaleString()}
        </div>
      </div>

      {/* Top Section: Score & Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 border-primary/20 flex flex-col items-center justify-center text-center shadow-lg min-h-[350px]"
        >
          <ThreatScoreMeter score={result.threatScore} label={t('threatScore')} />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 border-primary/20 flex flex-col items-center justify-center text-center shadow-lg min-h-[350px]"
        >
          <div className="text-sm text-muted-foreground uppercase tracking-widest mb-6">{t('riskLevel')}</div>
          <RiskBadge level={result.riskLevel} />
          
          <div className="mt-8 text-lg text-foreground/90 max-w-sm leading-relaxed">
            {language === 'ar' ? result.summaryAr : result.summary}
          </div>
        </motion.div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Indicators */}
        <AnalysisCard 
          title={t('whyDangerous')} 
          icon={<AlertTriangle className="h-5 w-5" />}
          delay={0.2}
        >
          <div className="space-y-4">
            {result.indicators.map((ind, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="p-4 rounded-xl bg-background/50 border border-border/50 flex gap-4"
              >
                <div className={`mt-1 p-1.5 rounded-md text-xs font-bold uppercase tracking-wider h-fit ${getSeverityColor(ind.severity)}`}>
                  {ind.severity.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {language === 'ar' ? ind.typeAr : ind.type}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? ind.descriptionAr : ind.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnalysisCard>

        {/* Recommendations */}
        <AnalysisCard 
          title={t('recommendations')} 
          icon={<ShieldCheck className="h-5 w-5" />}
          delay={0.3}
        >
          <div className="space-y-4">
            {(language === 'ar' ? result.recommendationsAr : result.recommendations).map((rec, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-foreground pt-0.5">{rec}</p>
              </motion.div>
            ))}
          </div>
        </AnalysisCard>
      </div>

      {/* Actions bottom */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-4 border-t border-border/50 pt-8"
      >
        <Button size="lg" className="gap-2" onClick={handleDownload}>
          <Download className="h-5 w-5" />
          {t('downloadReport')}
        </Button>
        <Button size="lg" variant="outline" className="gap-2 glass" onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: `Cyber Inspector Analysis - ${result.riskLevel}`,
              text: `Check out this safety report. Score: ${result.threatScore}/100`,
              url: window.location.href,
            });
          }
        }}>
          <Share2 className="h-5 w-5" />
          {t('shareResult')}
        </Button>
        <Button size="lg" variant="secondary" className="gap-2" asChild>
          <Link to="/analyze">
            <RefreshCw className="h-5 w-5" />
            {t('analyzeAnother')}
          </Link>
        </Button>
      </motion.div>

    </div>
  );
}
