import { Shield, History, Menu, X, Globe, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSound } from '../../hooks/useSound';
import { Button } from '../ui/button';

export function Navbar() {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { isMuted, toggleMute, playClickSound } = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleLanguageToggle = () => {
    playClickSound();
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const NavLinks = () => (
    <>
      <Link
        to="/"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          location.pathname === '/' ? 'text-primary' : 'text-foreground/80'
        }`}
        onClick={() => { playClickSound(); setIsOpen(false); }}
      >
        {t('appName').split(' ')[0]}
      </Link>
      <Link
        to="/analyze"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          location.pathname === '/analyze' ? 'text-primary' : 'text-foreground/80'
        }`}
        onClick={() => { playClickSound(); setIsOpen(false); }}
      >
        {t('analyzeNow')}
      </Link>
    </>
  );

  return (
    <nav className="fixed top-0 z-50 w-full glass border-b border-primary/20 transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => { playClickSound(); setIsOpen(false); }}>
            <div className="relative">
              <Shield className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight text-foreground glow-purple">
              {t('appName')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLinks />
            <div className="flex items-center gap-4 border-s border-border pl-4 ml-4 rtl:border-s-0 rtl:border-r rtl:pl-0 rtl:pr-4 rtl:mr-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { playClickSound(); toggleMute(); }}
                className="text-muted-foreground hover:text-primary"
                title={isMuted ? t('soundOff') : t('soundOn')}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                onClick={handleLanguageToggle}
                className="gap-2 text-muted-foreground hover:text-primary"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'en' ? 'عربي' : 'EN'}</span>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { playClickSound(); toggleMute(); }}
              className="text-muted-foreground hover:text-primary"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLanguageToggle}
              className="text-muted-foreground hover:text-primary mr-2 rtl:mr-0 rtl:ml-2"
            >
              <Globe className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { playClickSound(); setIsOpen(!isOpen); }}
              className="text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden glass border-t border-border/50 animate-in slide-in-from-top-2">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <NavLinks />
          </div>
        </div>
      )}
    </nav>
  );
}
