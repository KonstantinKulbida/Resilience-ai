import React from 'react';
import { UserRole } from '../types';
import { ArrowRight, Building2, Clock3, LockKeyhole, ShieldCheck } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen font-sans text-slate-900 p-4 sm:p-6 lg:p-8 flex items-center">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-400 to-blue-500 shadow-lg shadow-teal-500/25 flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-full" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 truncate">Resilience.ai</span>
          </div>
          <LanguageToggle compact />
        </header>

        <main className="grid lg:grid-cols-[1.12fr_0.88fr] gap-5 sm:gap-6 lg:gap-8 items-stretch">
          <section className="bg-white/45 backdrop-blur-2xl border border-white/55 shadow-2xl shadow-indigo-500/10 rounded-[2rem] sm:rounded-[2.75rem] p-7 sm:p-10 lg:p-14 flex flex-col justify-center min-h-[520px]">
            <div className="inline-flex self-start items-center gap-2 px-3.5 py-2 rounded-full bg-white/55 border border-white/70 text-xs font-semibold text-slate-600 mb-7">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              {t('Private wellbeing screening', 'Приватная оценка состояния')}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.55rem] lg:leading-[1.04] font-bold tracking-[-0.035em] text-slate-900 max-w-3xl">
              {t(
                'Spot burnout risk early — and know what to do next.',
                'Заметьте риск выгорания раньше — и поймите, что делать дальше.'
              )}
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {t(
                'A private 3-minute resilience screening with clear results and personalized recommendations. Your employer never sees your individual answers.',
                'Приватная 3-минутная оценка состояния с понятным результатом и персональными рекомендациями. Работодатель не видит ваши индивидуальные ответы.'
              )}
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                type="button"
                onClick={() => onLogin(UserRole.EMPLOYEE)}
                className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-white font-semibold shadow-xl shadow-slate-900/15 transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                {t('Start my screening', 'Начать оценку')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => onLogin(UserRole.HR)}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white/55 border border-white/70 px-6 py-4 text-slate-700 font-semibold transition-all hover:bg-white/80 hover:-translate-y-0.5"
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                {t('For HR & People teams', 'Для HR и People-команд')}
              </button>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-2.5 rounded-2xl bg-white/35 border border-white/50 p-3.5">
                <LockKeyhole className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>{t('Private by design', 'Приватность по умолчанию')}</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-2xl bg-white/35 border border-white/50 p-3.5">
                <Clock3 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>{t('12 questions · ~3 min', '12 вопросов · ~3 минуты')}</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-2xl bg-white/35 border border-white/50 p-3.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>{t('Not a medical diagnosis', 'Не медицинская диагностика')}</span>
              </div>
            </div>
          </section>

          <aside className="bg-white/35 backdrop-blur-2xl border border-white/50 shadow-xl shadow-indigo-500/5 rounded-[2rem] sm:rounded-[2.75rem] p-7 sm:p-9 lg:p-10 flex flex-col justify-between gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-bold text-indigo-600/80 mb-4">
                {t('What you get', 'Что вы получите')}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {t('A useful result, not just a score.', 'Не просто балл, а понятный следующий шаг.')}
              </h2>
              <div className="mt-7 space-y-4">
                {[
                  t('A clear burnout-risk level based on your answers.', 'Понятный уровень риска выгорания на основе ваших ответов.'),
                  t('An explanation of the factors shaping your result.', 'Объяснение факторов, которые повлияли на результат.'),
                  t('Personalized actions you can try next.', 'Персональные действия, которые можно попробовать дальше.'),
                ].map((item, index) => (
                  <div key={item} className="flex gap-3.5 items-start">
                    <div className="w-7 h-7 rounded-xl bg-white/65 border border-white/75 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed text-slate-600 pt-0.5">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-slate-900/90 text-white p-5 sm:p-6 shadow-xl">
              <div className="flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 text-teal-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1.5">{t('Your answers stay personal', 'Ваши ответы остаются личными')}</p>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {t(
                      'HR sees aggregated team insights only — never your individual answers or personal wellbeing score.',
                      'HR видит только агрегированные данные команды — не ваши индивидуальные ответы и не личный показатель состояния.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </main>

        <p className="text-center text-[11px] sm:text-xs text-slate-500/80 mt-5 sm:mt-6 px-4">
          {t(
            'Resilience.ai supports wellbeing awareness and is not a substitute for professional medical advice.',
            'Resilience.ai помогает отслеживать состояние и не заменяет профессиональную медицинскую помощь.'
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
