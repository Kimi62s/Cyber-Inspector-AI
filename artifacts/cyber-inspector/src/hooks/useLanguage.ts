import { useState, useEffect, useCallback } from 'react';
import { Language, translations } from '../lib/i18n';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('cyber-inspector-lang') as Language;
    if (stored && (stored === 'en' || stored === 'ar')) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cyber-inspector-lang', lang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = useCallback((key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  }, [language]);

  return { language, setLanguage, t, isRTL: language === 'ar' };
}
