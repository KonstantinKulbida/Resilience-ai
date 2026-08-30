import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface LanguageToggleProps {
  compact?: boolean;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/50 bg-white/35 backdrop-blur-xl shadow-sm ${compact ? 'p-0.5' : 'p-1'}`}
      aria-label="Language switcher"
    >
      {(['en', 'ru'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          aria-pressed={language === option}
          className={`${compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} rounded-full font-bold uppercase tracking-wider transition-all ${
            language === option
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
