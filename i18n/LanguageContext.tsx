import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { AppLanguage } from '../types';

type Language = AppLanguage;

// v2 intentionally ignores the old key, which could have been populated by the
// previous demo login flow forcing English. First load now follows the browser/OS
// language; a manual toggle is then persisted normally.
const STORAGE_KEY = 'resilience-language-v2';

const detectLanguage = (): Language => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    // Storage can be unavailable in restricted browser contexts; language detection still works.
  }

  const browserLanguage =
    window.navigator.languages?.[0] ||
    window.navigator.language ||
    'en';

  return browserLanguage.toLowerCase().startsWith('ru') ? 'ru' : 'en';
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (en: string, ru: string) => string;
  locale: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Keep the in-memory language even when browser storage is unavailable.
    }
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: setLanguageState,
    t: (en, ru) => (language === 'ru' ? ru : en),
    locale: language === 'ru' ? 'ru-RU' : 'en-US',
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
};
