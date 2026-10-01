import React from 'react';
import { UserRole } from '../types';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from './LanguageToggle';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { language, t } = useLanguage();

  const steps = [
    {
      icon: ShieldCheck,
      enTitle: 'Private employee check-in',
      ruTitle: 'Приватная оценка сотрудников',
      enBody: 'A short 12-question check-in takes about 3 minutes.',
      ruBody: '12 вопросов о нагрузке, восстановлении и контроле — около 3 минут.',
    },
    {
      icon: Building2,
      enTitle: 'Department-level signal',
      ruTitle: 'Сигнал по подразделению',
      enBody: 'Resilience aggregates results only after the privacy threshold is reached.',
      ruBody: 'Resilience собирает результаты в агрегат только после достижения порога приватности.',
    },
    {
      icon: Sparkles,
      enTitle: 'One issue. One intervention.',
      ruTitle: 'Одна проблема. Одно действие.',
      enBody: 'Managers see the primary pressure factor and a practical intervention to try.',
      ruBody: 'Руководитель видит главный фактор давления и конкретное изменение, которое стоит попробовать.',
    },
    {
      icon: RefreshCw,
      enTitle: 'Re-check the outcome',
      ruTitle: 'Проверка результата',
      enBody: 'Repeat the check-in after 10–14 days and compare the descriptive change.',
      ruBody: 'Через 10–14 дней команда проходит повторную оценку, чтобы увидеть изменение.',
    },
  ];

  return (
    <div className="min-h-screen font-sans text-slate-900 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-4 sm:mb-5 lg:mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl bg-indigo-600 shadow-md shadow-indigo-600/20 flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="7.25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                />
              </svg>
            </div>

            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 truncate">
              Resilience.ai
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle compact />
            <div className="px-3 py-2 rounded-full bg-white/70 border border-slate-200/80 text-xs font-semibold text-slate-500 shadow-sm">
              Demo
            </div>
          </div>
        </header>

        <main className="grid lg:grid-cols-[1.08fr_0.92fr] gap-4 sm:gap-5 lg:gap-6 items-stretch">
          <section className="h-full bg-white/75 backdrop-blur-2xl border border-slate-200/80 shadow-xl shadow-slate-900/5 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-7 lg:p-8 xl:p-9">
            <div className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50/90 border border-slate-200/80 text-xs font-semibold leading-snug text-slate-600 mb-4">
              <Eye className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>
                {t(
                  'Early workforce signals without exposing individual employees.',
                  'Ранние сигналы о состоянии команд — без раскрытия данных сотрудников.'
                )}
              </span>
            </div>

            <h1
              className={
                language === 'ru'
                  ? 'text-[2rem] sm:text-[2.45rem] lg:text-[2.65rem] xl:text-[2.85rem] leading-[1.06] font-bold tracking-[-0.035em] text-slate-900 max-w-3xl'
                  : 'text-[2.1rem] sm:text-[2.6rem] lg:text-[2.75rem] xl:text-[2.95rem] leading-[1.04] font-bold tracking-[-0.035em] text-slate-900 max-w-3xl'
              }
            >
              {t(
                'See where teams are losing resilience — and what to change before it becomes a people or delivery problem.',
                'Понимайте, где командам становится тяжело — и что изменить до потерь людей и результата.'
              )}
            </h1>

            <p className="mt-4 text-[0.98rem] sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              {t(
                'Resilience turns private 3-minute employee check-ins into privacy-safe team analytics: what is under pressure, what may be driving it, what intervention to try, and what changed after the re-check.',
                'Resilience превращает приватные трёхминутные оценки сотрудников в безопасную командную аналитику: где давление выше, что его создаёт, какое изменение попробовать и что изменилось после повторной оценки.'
              )}
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                type="button"
                onClick={() => onLogin(UserRole.HR)}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-xl whitespace-nowrap"
              >
                {t('View People analytics', 'Посмотреть People-аналитику')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 flex-shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onLogin(UserRole.EMPLOYEE)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white/75 border border-slate-200/80 px-5 py-3 text-slate-700 font-semibold shadow-sm transition-all hover:bg-white hover:-translate-y-0.5 whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                {t('Try the employee check-in', 'Пройти тест как сотрудник')}
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('Signal', 'Сигнал')}
                </p>
                <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-800">
                  {t('Workload · Recovery · Control', 'Нагрузка · Восстановление · Контроль')}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('Privacy', 'Приватность')}
                </p>
                <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-800">
                  {t('Aggregates only after 5+ responses', 'Агрегаты только после 5+ ответов')}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('Loop', 'Цикл')}
                </p>
                <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-800">
                  {t('Action → re-check → delta', 'Действие → повторная оценка → изменение')}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-500">
              {t(
                'Demo environment • People-view company data is synthetic.',
                'Демо-среда • Данные компании в People-view синтетические.'
              )}
            </p>
          </section>

          <aside className="flex h-full flex-col bg-white/65 backdrop-blur-2xl border border-slate-200/80 shadow-xl shadow-slate-900/5 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-5 lg:p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-bold text-indigo-600/80 mb-2">
                {t('How the platform works', 'Как работает платформа')}
              </p>

              <h2 className="text-[1.35rem] lg:text-[1.45rem] font-bold tracking-tight leading-[1.2] text-slate-900">
                {t(
                  'From private signal to a measurable management action.',
                  'От приватного сигнала — к управленческому действию.'
                )}
              </h2>
            </div>

            <div className="mt-3 space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.enTitle}
                    className="rounded-2xl bg-white/75 border border-slate-200/70 p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-indigo-600" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-500">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <p className="text-[0.9375rem] font-semibold leading-snug text-slate-900">
                            {language === 'ru' ? step.ruTitle : step.enTitle}
                          </p>
                        </div>

                        <p className="mt-0.5 text-[0.775rem] leading-[1.45] text-slate-600">
                          {language === 'ru' ? step.ruBody : step.enBody}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-3 grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5 text-[0.8125rem] leading-snug text-slate-600">
              <div className="flex items-start gap-2.5 rounded-2xl bg-white/65 border border-slate-200/70 p-2.5">
                <Clock3 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>{t('12 questions · ~3 min', '12 вопросов · ~3 минуты')}</span>
              </div>

              <div className="flex items-start gap-2.5 rounded-2xl bg-white/65 border border-slate-200/70 p-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>{t('Not a medical diagnosis', 'Не медицинская диагностика')}</span>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
