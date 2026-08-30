import React from 'react';
import { UserRole } from '../types';
import { Users, Building2, ArrowRight } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center font-sans text-slate-900 p-4 sm:p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="flex justify-end mb-3 pr-2">
          <LanguageToggle />
        </div>

        <div className="bg-white/40 backdrop-blur-2xl p-7 sm:p-12 rounded-[2.5rem] border border-white/50 shadow-2xl shadow-indigo-500/10">
          <div className="mb-8 sm:mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-400 to-blue-500 shadow-lg shadow-teal-500/30 mb-6">
              <div className="w-6 h-6 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-800">
              Resilience.ai
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              {t('AI-enabled platform for burnout prevention and workforce resilience', 'AI-платформа для профилактики выгорания и развития устойчивости')}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => onLogin(UserRole.EMPLOYEE)}
              className="w-full group bg-white/50 hover:bg-white/80 border border-white/60 hover:border-white p-5 rounded-2xl flex items-center text-left transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-100/70 text-teal-700 flex items-center justify-center mr-4 flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900">{t('Employee', 'Сотрудник')}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t('Personal wellbeing workspace', 'Личный кабинет')}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>

            <button
              onClick={() => onLogin(UserRole.HR)}
              className="w-full group bg-white/50 hover:bg-white/80 border border-white/60 hover:border-white p-5 rounded-2xl flex items-center text-left transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center mr-4 flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900">{t('HR / Business', 'HR / Бизнес')}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t('Workforce analytics dashboard', 'Панель управления')}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              {t('Portfolio prototype • all demo data is synthetic', 'Portfolio prototype • все demo-данные синтетические')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
