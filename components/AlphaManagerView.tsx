import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { getAlphaManagerSession } from '../services/alphaService';
import type {
  AlphaManagerDepartment,
  AlphaManagerSession,
} from '../alpha/types';

const factorLabels = {
  workloadBalance: { en: 'Workload balance', ru: 'Баланс нагрузки' },
  recovery: { en: 'Recovery', ru: 'Восстановление' },
  controlClarity: { en: 'Control & clarity', ru: 'Контроль и ясность' },
} as const;

const ManagerView: React.FC = () => {
  const { language, t } = useLanguage();
  const token = useMemo(
    () => decodeURIComponent(window.location.hash.slice(1)),
    []
  );
  const [session, setSession] = useState<AlphaManagerSession | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) {
      setSession({ valid: false });
      return;
    }

    setError('');
    try {
      setSession(await getAlphaManagerSession(token, language));
    } catch {
      setError(
        t(
          'The manager view is temporarily unavailable.',
          'Менеджерский экран временно недоступен.'
        )
      );
    }
  };

  useEffect(() => {
    void load();
  }, [language]);

  if (error && !session) {
    return (
      <Shell>
        <Card>
          <h1 className="text-xl font-bold">
            {t('Temporarily unavailable', 'Временно недоступно')}
          </h1>
          <p className="mt-2 text-slate-600">{error}</p>
          <button
            onClick={load}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-white"
          >
            {t('Retry', 'Повторить')}
          </button>
        </Card>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <Card>{t('Loading manager view…', 'Загружаем менеджерский экран…')}</Card>
      </Shell>
    );
  }

  if (!session.valid) {
    return (
      <Shell>
        <Card>
          <h1 className="text-xl font-bold">
            {t(
              'This manager link is invalid or expired',
              'Эта менеджерская ссылка недействительна или устарела'
            )}
          </h1>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          {session.organization?.displayName}
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          {session.role === 'org_admin'
            ? t('Company overview', 'Обзор компании')
            : t(
                (session.departmentScope?.displayName || 'Department') + ' overview',
                'Подразделение ' + (session.departmentScope?.displayName || '')
              )}
        </h1>

        <p className="mt-2 text-slate-600">
          {session.role === 'org_admin'
            ? t(
                'You can see privacy-safe aggregates for departments in this company.',
                'Вы видите только приватные агрегаты по подразделениям этой компании.'
              )
            : t(
                'You can see privacy-safe aggregates for your department only.',
                'Вы видите только приватные агрегаты своего подразделения.'
              )}
        </p>

        <div className="mt-6 grid gap-4">
          {(session.departments || []).map((department) => (
            <DepartmentCard
              key={department.slug}
              department={department}
              language={language}
              t={t}
            />
          ))}
        </div>

        <p className="mt-6 text-xs text-slate-500">
          {t(
            'Individual answers, participant identities, invite tokens, and individual scores are never shown here. A department appears only after 5+ completed baseline responses.',
            'Индивидуальные ответы, личности участников, ссылки-приглашения и персональные баллы здесь не показываются. Подразделение раскрывается только после 5+ завершённых baseline-ответов.'
          )}
        </p>
      </Card>
    </Shell>
  );
};

const DepartmentCard: React.FC<{
  department: AlphaManagerDepartment;
  language: 'en' | 'ru';
  t: (en: string, ru: string) => string;
}> = ({ department, language, t }) => {
  if (!department.ready) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="font-semibold">{department.displayName}</p>
        <p className="mt-1 text-sm text-slate-600">
          {t(
            'Not enough completed responses yet. Results will appear after the privacy threshold is reached.',
            'Пока недостаточно завершённых ответов. Результаты появятся после достижения порога приватности.'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-semibold">{department.displayName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {t(
              department.n + ' completed responses',
              department.n + ' завершённых ответов'
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold">{department.overallScore}/100</p>
          <p className="text-xs text-slate-500">
            {t('Department average', 'Среднее по подразделению')}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {Object.entries(department.factors).map(([factor, value]) => (
          <div key={factor} className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold">
              {factorLabels[factor as keyof typeof factorLabels][language]}
            </p>
            <p className="mt-1 text-2xl font-bold">{value.score}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-600">
        {t('Primary pressure factor: ', 'Основной фактор давления: ')}
        <span className="font-semibold text-slate-900">
          {factorLabels[department.weakestFactor][language]}
        </span>
      </p>
    </div>
  );
};

const Card: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    {children}
  </div>
);

const Shell: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-bold">Resilience</p>
            <p className="text-xs text-slate-500">
              {t('Manager alpha', 'Менеджерская альфа')}
            </p>
          </div>
          <LanguageToggle compact />
        </header>
        {children}
      </div>
    </main>
  );
};

export default ManagerView;
