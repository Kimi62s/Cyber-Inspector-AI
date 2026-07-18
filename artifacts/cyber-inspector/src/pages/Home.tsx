import { motion } from 'framer-motion';
import { Shield, ArrowRight, Zap, Lock, FileCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useLanguage } from '../hooks/useLanguage';
import { HistoryPanel } from '../components/HistoryPanel';
import { ResponseCenter } from '../components/ResponseCenter';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 inline-flex items-center justify-center p-4 bg-primary/10 rounded-full border border-primary/30 shadow-[0_0_50px_hsl(var(--primary)_/_0.2)]"
            >
              <Shield className="h-16 w-16 text-primary" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-black tracking-tighter mb-6 glow-purple"
            >
              {t('heroTitle')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              {t('heroSubtitle')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 shadow-[0_0_20px_hsl(var(--primary)_/_0.5)] transition-all hover:scale-105" asChild>
                <Link to="/analyze">
                  {t('analyzeNow')} <ArrowRight className="ml-2 h-5 w-5 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 glass border-primary/30 hover:bg-primary/10 transition-all hover:scale-105" onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                {t('learnMore')}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative bg-background/50 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="h-8 w-8" />}
              title="AI-Powered Detection"
              description="Advanced heuristic analysis detects subtle patterns in phishing and scams."
              delay={0.1}
            />
            <FeatureCard 
              icon={<FileCheck className="h-8 w-8" />}
              title="Detailed Reports"
              description="Get comprehensive breakdowns of exactly why content was flagged."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Lock className="h-8 w-8" />}
              title="Privacy First"
              description="Your data never leaves the browser. Analysis is safe and secure."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Response Center */}
      <ResponseCenter />

      {/* History Section */}
      <section className="py-16 container mx-auto px-4 max-w-4xl">
        <HistoryPanel />
      </section>

      {/* Disclaimer */}
      <section className="py-12 pb-24 container mx-auto px-4 max-w-4xl">
        <div className="p-6 rounded-xl border border-chart-3/30 bg-chart-3/5 text-chart-3 flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-lg mb-2">{t('disclaimer')}</h4>
            <p className="opacity-90 leading-relaxed">{t('disclaimerText')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass p-8 rounded-2xl border-primary/10 hover:border-primary/30 transition-colors"
    >
      <div className="text-primary mb-6 p-4 bg-primary/10 rounded-xl inline-block">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
