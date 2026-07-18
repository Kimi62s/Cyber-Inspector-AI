import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Globe, Image as ImageIcon, UploadCloud, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useSound } from '../hooks/useSound';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { analyzeContent, AnalysisType } from '../services/analysis.service';
import { Button } from '../components/ui/button';
import { ScanAnimation } from '../components/ScanAnimation';

export default function AnalyzePage() {
  const { t } = useLanguage();
  const { playClickSound, playScanSound, playCompleteSound } = useSound();
  const { saveToHistory } = useAnalysisHistory();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<AnalysisType>('text');
  const [input, setInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim() && activeTab !== 'image') return;
    
    playClickSound();
    setIsScanning(true);
    playScanSound();

    try {
      const result = await analyzeContent(activeTab, input || 'image-upload.png');
      saveToHistory(result);
      playCompleteSound();
      navigate(`/result/${result.id}`);
    } catch (e) {
      console.error(e);
      setIsScanning(false);
    }
  };

  const loadExample = (type: string) => {
    if (type === 'text') {
      setInput("URGENT: Your bank account has been suspended due to suspicious activity. Click here to verify your identity and restore access: http://bank-secure-verify.xyz/login");
    } else if (type === 'url') {
      setInput("http://bank-secure-verify.xyz/login");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center max-w-4xl">
      <div className="text-center mb-12 w-full">
        <h1 className="text-4xl md:text-5xl font-black mb-4 glow-purple inline-block">{t('analyzeTitle')}</h1>
        <p className="text-xl text-muted-foreground">{t('analyzeSubtitle')}</p>
      </div>

      <div className="w-full glass rounded-2xl border-primary/20 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow behind the form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {isScanning ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="min-h-[300px] flex items-center justify-center"
            >
              <ScanAnimation />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10"
            >
              {/* Tabs */}
              <div className="flex p-1 bg-secondary/50 rounded-xl mb-8 border border-border/50 overflow-x-auto">
                <TabButton 
                  active={activeTab === 'text'} 
                  onClick={() => { setActiveTab('text'); setInput(''); }} 
                  icon={<FileText className="h-5 w-5" />}
                  label={t('pasteText')}
                />
                <TabButton 
                  active={activeTab === 'url'} 
                  onClick={() => { setActiveTab('url'); setInput(''); }} 
                  icon={<Globe className="h-5 w-5" />}
                  label={t('analyzeUrl')}
                />
                <TabButton 
                  active={activeTab === 'image'} 
                  onClick={() => { setActiveTab('image'); setInput(''); }} 
                  icon={<ImageIcon className="h-5 w-5" />}
                  label={t('uploadImage')}
                />
              </div>

              {/* Input Area */}
              <div className="mb-8 min-h-[200px]">
                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('textPlaceholder')}
                      className="w-full h-48 bg-background/50 border border-primary/20 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-mono text-sm"
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{input.length} chars</span>
                      <Button variant="ghost" size="sm" onClick={() => loadExample('text')} className="text-primary hover:text-primary/80">
                        {t('exampleText')}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'url' && (
                  <div className="space-y-4 pt-8">
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
                      <input
                        type="url"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('urlPlaceholder')}
                        className="w-full bg-background/50 border border-primary/20 rounded-xl py-4 pl-14 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                      />
                    </div>
                    <div className="flex justify-end items-center text-sm">
                      <Button variant="ghost" size="sm" onClick={() => loadExample('url')} className="text-primary hover:text-primary/80">
                        {t('exampleUrl')}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'image' && (
                  <div className="w-full h-48 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center bg-background/30 hover:bg-primary/5 transition-colors cursor-pointer group">
                    <UploadCloud className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Click or drag image to upload</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">Supports JPG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>

              {/* Action */}
              <Button 
                size="lg" 
                className="w-full h-16 text-xl tracking-wide shadow-[0_0_20px_hsl(var(--primary)_/_0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)_/_0.6)] transition-all"
                disabled={(!input.trim() && activeTab !== 'image') || isScanning}
                onClick={handleAnalyze}
              >
                <ShieldAlert className="mr-3 h-6 w-6 rtl:ml-3 rtl:mr-0" />
                {t('analyzeButton')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
        active 
          ? 'bg-primary text-primary-foreground shadow-md' 
          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
