import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Globe, Image as ImageIcon, UploadCloud, ShieldAlert, X } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<AnalysisType>('text');
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [analyzeError, setAnalyzeError] = useState('');

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const canSubmit = () => {
    if (isScanning) return false;
    if (activeTab === 'text') return input.trim().length > 0;
    if (activeTab === 'url') return input.trim().length > 0;
    if (activeTab === 'image') return selectedFile !== null;
    return false;
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) return;
    setSelectedFile(file);
    setInput(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleAnalyze = async () => {
    setAnalyzeError('');

    // URL validation
    if (activeTab === 'url') {
      if (!input.trim() || !isValidUrl(input.trim())) {
        setUrlError(t('invalidUrl'));
        return;
      }
    }

    if (!canSubmit()) return;

    playClickSound();
    setIsScanning(true);
    playScanSound();

    try {
      const analysisInput =
        activeTab === 'image'
          ? selectedFile?.name ?? 'image-upload.png'
          : input.trim();

      const result = await analyzeContent(activeTab, analysisInput);
      saveToHistory(result);
      playCompleteSound();
      // Pass result via router state so ResultPage receives it immediately
      navigate(`/result/${result.id}`, { state: { result } });
    } catch (e) {
      console.error(e);
      setIsScanning(false);
      setAnalyzeError(t('analyzeFailed'));
    }
  };

  const loadExample = (type: string) => {
    if (type === 'text') {
      setInput(
        'URGENT: Your bank account has been suspended due to suspicious activity. Click here to verify your identity and restore access: http://bank-secure-verify.xyz/login',
      );
    } else if (type === 'url') {
      setInput('http://bank-secure-verify.xyz/login');
      setUrlError('');
    }
  };

  const handleTabChange = (tab: AnalysisType) => {
    setActiveTab(tab);
    setInput('');
    setSelectedFile(null);
    setUrlError('');
    setAnalyzeError('');
  };

  return (
    <div className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center max-w-4xl">
      <div className="text-center mb-12 w-full">
        <h1 className="text-4xl md:text-5xl font-black mb-4 glow-purple inline-block">
          {t('analyzeTitle')}
        </h1>
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
                  onClick={() => handleTabChange('text')}
                  icon={<FileText className="h-5 w-5" />}
                  label={t('pasteText')}
                />
                <TabButton
                  active={activeTab === 'url'}
                  onClick={() => handleTabChange('url')}
                  icon={<Globe className="h-5 w-5" />}
                  label={t('analyzeUrl')}
                />
                <TabButton
                  active={activeTab === 'image'}
                  onClick={() => handleTabChange('image')}
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
                      className="w-full h-48 bg-background/50 border border-primary/20 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-mono text-sm outline-none"
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{input.length} {t('chars')}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadExample('text')}
                        className="text-primary hover:text-primary/80"
                      >
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
                        onChange={(e) => {
                          setInput(e.target.value);
                          setUrlError('');
                        }}
                        onBlur={() => {
                          if (input.trim() && !isValidUrl(input.trim())) {
                            setUrlError(t('invalidUrl'));
                          }
                        }}
                        placeholder={t('urlPlaceholder')}
                        className={`w-full bg-background/50 border rounded-xl py-4 pl-14 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary transition-all font-mono outline-none ${
                          urlError ? 'border-destructive focus:border-destructive' : 'border-primary/20 focus:border-primary'
                        }`}
                      />
                    </div>
                    {urlError && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <X className="h-4 w-4" />
                        {urlError}
                      </p>
                    )}
                    <div className="flex justify-end items-center text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadExample('url')}
                        className="text-primary hover:text-primary/80"
                      >
                        {t('exampleUrl')}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'image' && (
                  <div className="space-y-4">
                    {/* Hidden real file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />

                    {selectedFile ? (
                      /* File selected — show preview */
                      <div className="w-full h-48 border-2 border-primary/50 rounded-xl flex flex-col items-center justify-center bg-primary/5 relative group">
                        <ImageIcon className="h-10 w-10 text-primary mb-3" />
                        <p className="font-medium text-foreground text-sm max-w-xs truncate px-4">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setInput('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-3 right-3 p-1 rounded-full bg-background/60 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      /* Drop zone */
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Upload image"
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all select-none ${
                          isDragging
                            ? 'border-primary bg-primary/10 scale-[1.01]'
                            : 'border-primary/30 bg-background/30 hover:bg-primary/5 hover:border-primary/60'
                        }`}
                      >
                        <UploadCloud
                          className={`h-12 w-12 mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        <p className={`font-medium transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}>
                          {t('dropImageHere')}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">{t('dropImageFormats')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error message */}
              {analyzeError && (
                <p className="text-sm text-destructive text-center mb-4 flex items-center justify-center gap-1">
                  <X className="h-4 w-4" />
                  {analyzeError}
                </p>
              )}

              {/* Action */}
              <Button
                size="lg"
                className="w-full h-16 text-xl tracking-wide shadow-[0_0_20px_hsl(var(--primary)_/_0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)_/_0.6)] transition-all"
                disabled={!canSubmit()}
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

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
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
