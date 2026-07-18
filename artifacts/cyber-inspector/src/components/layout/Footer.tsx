import { Shield } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-primary/10 bg-background/50 backdrop-blur py-8 mt-auto">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary/50" />
          <span>&copy; {new Date().getFullYear()} {t('footerText')}</span>
        </div>
        <div className="text-xs max-w-md text-center md:text-end rtl:md:text-start opacity-70">
          {t('disclaimerText')}
        </div>
      </div>
    </footer>
  );
}
