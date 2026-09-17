import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Briefcase, Zap, ChevronDown, Search, FileText, AlertCircle, Activity } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HRViewProps {
  activeTab: string;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

const SUSTAINABILITY_WEIGHTS = {
  workloadBalance: 0.4,
  recovery: 0.4,
  controlClarity: 0.2,
} as const;

type TeamFactor = keyof typeof SUSTAINABILITY_WEIGHTS;

const calculateTeamSustainability = (
  factors: Record<TeamFactor, number>
): number =>
  Math.round(
    (Object.keys(SUSTAINABILITY_WEIGHTS) as TeamFactor[]).reduce(
      (sum, factor) =>
        sum + factors[factor] * SUSTAINABILITY_WEIGHTS[factor],
      0
    )
  );

const getPrimaryTeamFactor = (
  factors: Record<TeamFactor, number>
): TeamFactor =>
  (Object.keys(SUSTAINABILITY_WEIGHTS) as TeamFactor[]).reduce(
    (primary, factor) => {
      const primaryDrag =
        SUSTAINABILITY_WEIGHTS[primary] *
        (100 - factors[primary]);

      const factorDrag =
        SUSTAINABILITY_WEIGHTS[factor] *
        (100 - factors[factor]);

      return factorDrag > primaryDrag ? factor : primary;
    }
  );


const HRView: React.FC<HRViewProps> = ({ activeTab }) => {
  const { t } = useLanguage();
  const [department, setDepartment] = useState<'All' | 'IT' | 'Sales'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const dashboardData = useMemo(() => ({
    All: {
      participation: { responses: 125, invited: 160, rate: 78 },
      factors: {
        workloadBalance: 56,
        recovery: 61,
        controlClarity: 72,
      },
      primaryIssue: t(
        'Workload is exceeding available capacity often enough to make the current pace hard to sustain.',
        'Нагрузка достаточно часто превышает доступные ресурсы, поэтому текущий темп становится трудно поддерживать.'
      ),
      intervention: {
        title: t(
          'Reduce active priority load for 2 weeks',
          'Снизить число активных приоритетов на 2 недели'
        ),
        body: t(
          'Limit teams to the top 3 active priorities and explicitly defer lower-value work instead of absorbing it.',
          'Оставить у команд три главных активных приоритета, а менее важные задачи явно отложить, а не пытаться вместить их дополнительно.'
        ),
        owner: t('COO + department leads', 'COO + руководители направлений'),
        recheck: t('Re-check in 10 days', 'Повторная оценка через 10 дней'),
      },
      outcome: {
        baseline: 58,
        label: t(
          'Improving, but still below the stable range.',
          'Есть улучшение, но команда пока не вышла в устойчивую зону.'
        ),
      },
    },

    IT: {
      participation: { responses: 46, invited: 55, rate: 84 },
      factors: {
        workloadBalance: 38,
        recovery: 57,
        controlClarity: 68,
      },
      primaryIssue: t(
        'The strongest constraint is workload balance: planned scope is consistently larger than the team can absorb sustainably.',
        'Главное ограничение — баланс нагрузки: запланированный объём стабильно выше того, который команда может устойчиво выдерживать.'
      ),
      intervention: {
        title: t(
          'Reset sprint scope and work in progress',
          'Снизить объём спринта и число параллельных задач'
        ),
        body: t(
          'Freeze lower-priority work, reduce parallel initiatives, and require an explicit trade-off when urgent work is added.',
          'Заморозить менее приоритетные задачи, сократить параллельные инициативы и при добавлении срочной работы явно определять, что будет отложено.'
        ),
        owner: t('VP Engineering', 'VP Engineering'),
        recheck: t('Re-check in 7 days', 'Повторная оценка через 7 дней'),
      },
      outcome: {
        baseline: 48,
        label: t(
          'Early improvement, but workload remains the main constraint.',
          'Есть первые улучшения, но нагрузка всё ещё остаётся главным ограничением.'
        ),
      },
    },

    Sales: {
      participation: { responses: 32, invited: 38, rate: 84 },
      factors: {
        workloadBalance: 71,
        recovery: 66,
        controlClarity: 88,
      },
      primaryIssue: t(
        'The team is broadly stable, but recovery between high-intensity sales periods is the weakest part of the system.',
        'Команда в целом находится в устойчивой зоне, но восстановление между интенсивными периодами продаж остаётся самым слабым элементом.'
      ),
      intervention: {
        title: t(
          'Protect recovery after peak sales windows',
          'Защитить восстановление после пиковых периодов продаж'
        ),
        body: t(
          'Create protected low-meeting blocks after peak periods and avoid immediately replacing finished campaigns with new urgent work.',
          'После пиковых периодов выделять защищённые блоки с минимумом встреч и не заменять завершившиеся кампании новой срочной нагрузкой сразу.'
        ),
        owner: t('Head of Sales', 'Руководитель отдела продаж'),
        recheck: t('Re-check in 14 days', 'Повторная оценка через 14 дней'),
      },
      outcome: {
        baseline: 69,
        label: t(
          'Improved further within the stable range after the intervention.',
          'После вмешательства показатель команды дополнительно улучшился в пределах устойчивой зоны.'
        ),
      },
    },
  }), [t]);

  const employees = useMemo(() => [
    { id: 99, name: t('Alex Morgan', 'Александр Иванов'), role: 'Senior Developer', progress: 65, status: 'Active', statusLabel: t('Active', 'Активен'), lastActive: t('Now', 'Сейчас') },
    { id: 1, name: t('Maya Chen', 'Смирнов Алексей'), role: 'Senior Backend', progress: 85, status: 'Active', statusLabel: t('Active', 'Активен'), lastActive: t('2 hr ago', '2 ч.') },
    { id: 2, name: t('Elena Rivera', 'Петрова Елена'), role: 'Sales Manager', progress: 32, status: 'Active', statusLabel: t('Active', 'Активен'), lastActive: t('1 day ago', '1 д.') },
    { id: 3, name: t('Daniel Kim', 'Козлов Дмитрий'), role: 'Team Lead', progress: 15, status: 'Warning', statusLabel: t('Needs attention', 'Требует внимания'), lastActive: t('5 days ago', '5 д.') },
    { id: 4, name: t('Maria Silva', 'Иванова Мария'), role: 'Junior Specialist', progress: 95, status: 'Completed', statusLabel: t('Completed', 'Завершено'), lastActive: t('1 hr ago', '1 ч.') },
    { id: 5, name: t('Sam Wilson', 'Волков Сергей'), role: 'Head of Sales', progress: 45, status: 'Active', statusLabel: t('Active', 'Активен'), lastActive: t('3 hr ago', '3 ч.') },
    { id: 6, name: t('Anna Novak', 'Соколова Анна'), role: 'Recruiter', progress: 10, status: 'Active', statusLabel: t('Active', 'Активен'), lastActive: t('2 days ago', '2 д.') },
    { id: 7, name: t('Igor Petrov', 'Морозов Игорь'), role: 'DevOps', progress: 60, status: 'Active', statusLabel: t('Active', 'Активен'), lastActive: t('Yesterday', 'Вчера') },
    { id: 8, name: t('Olivia Brown', 'Новикова Ольга'), role: 'Accountant', progress: 5, status: 'Inactive', statusLabel: t('Inactive', 'Неактивен'), lastActive: t('2 weeks ago', '2 нед.') },
  ], [t]);

  const reports = useMemo(() => [
    { id: 1, title: t('Resilience program ROI', 'ROI программы устойчивости'), scope: t('Illustrative management report', 'Иллюстративный управленческий отчет') },
    { id: 2, title: t('Aggregated department risk', 'Агрегированные риски по подразделениям'), scope: t('No individual wellbeing scores', 'Без персональных wellbeing-оценок') },
    { id: 3, title: t('eNPS & participation trends', 'Динамика eNPS и участия'), scope: t('Illustrative analytics view', 'Пример аналитического среза') },
    { id: 4, title: t('Practice engagement', 'Вовлеченность в практики'), scope: t('Illustrative product analytics', 'Пример продуктовой аналитики') },
  ], [t]);

  const currentData = dashboardData[department] || dashboardData.All;

  const currentTeamSustainability =
    calculateTeamSustainability(currentData.factors);

  const currentPrimaryFactor =
    getPrimaryTeamFactor(currentData.factors);

  const currentOutcomeDelta =
    currentTeamSustainability - currentData.outcome.baseline;

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const departmentLabel = department === 'All'
    ? t('All departments', 'Все отделы')
    : department === 'IT'
      ? t('Product & Engineering', 'IT Разработка')
      : t('Sales', 'Отдел продаж');

  if (activeTab === 'dashboard') {
    const statusFromScore = (score: number) => {
      if (score >= 80) return 'green';
      if (score >= 65) return 'stable';
      if (score >= 45) return 'needs_attention';
      return 'at_risk';
    };

    const statusLabel = (score: number) => {
      const status = statusFromScore(score);

      return {
        green: t('Green zone', 'Зелёная зона'),
        stable: t('Stable', 'Устойчиво'),
        needs_attention: t('Needs attention', 'Требует внимания'),
        at_risk: t('At risk', 'Зона риска'),
      }[status];
    };

    const statusClasses = (score: number) => {
      const status = statusFromScore(score);

      return {
        green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        stable: 'bg-sky-100 text-sky-700 border-sky-200',
        needs_attention: 'bg-amber-100 text-amber-800 border-amber-200',
        at_risk: 'bg-rose-100 text-rose-700 border-rose-200',
      }[status];
    };

    const factorLabels = {
      workloadBalance: t('Workload balance', 'Баланс нагрузки'),
      recovery: t('Recovery', 'Восстановление'),
      controlClarity: t('Control & clarity', 'Контроль и ясность'),
    };

    const factorWeights = {
      workloadBalance: 40,
      recovery: 40,
      controlClarity: 20,
    };

    return (
      <div
        key="dashboard"
        className="space-y-6 max-w-7xl pb-10 animate-enter min-w-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {t('Team Sustainability', 'Устойчивость команды')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t(
                'Synthetic demo data · aggregated team signals only · minimum 5 responses',
                'Synthetic demo data · только агрегированные командные сигналы · минимум 5 ответов'
              )}
            </p>
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={department}
              onChange={(event) =>
                setDepartment(event.target.value as 'All' | 'IT' | 'Sales')
              }
              className="w-full sm:w-auto appearance-none bg-white/75 backdrop-blur-md border border-slate-200/80 text-slate-700 py-2.5 pl-5 pr-10 rounded-2xl text-sm focus:outline-none focus:border-indigo-400 hover:bg-white transition-colors shadow-sm"
            >
              <option value="All">{t('All departments', 'Все отделы')}</option>
              <option value="IT">
                {t('Product & Engineering', 'IT Разработка')}
              </option>
              <option value="Sales">{t('Sales', 'Отдел продаж')}</option>
            </select>

            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        <section className="grid lg:grid-cols-[1.4fr_0.8fr] gap-5">
          <div className="bg-white/75 backdrop-blur-xl rounded-[2.25rem] p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-900/5">
            <p className="text-sm font-semibold text-slate-500 mb-3">
              {t('Team Sustainability', 'Устойчивость команды')}
            </p>

            <div className="flex flex-wrap items-end gap-4">
              <span className="text-6xl font-bold text-slate-950">
                {currentTeamSustainability}
              </span>
              <span className="text-lg text-slate-400 mb-2">/ 100</span>

              <span
                className={`mb-2 px-3 py-1.5 rounded-full border text-sm font-bold ${statusClasses(
                  currentTeamSustainability
                )}`}
              >
                {statusLabel(currentTeamSustainability)}
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-600 max-w-2xl leading-relaxed">
              {t(
                'A deterministic aggregate of workload balance, recovery, and control & clarity. Higher is better.',
                'Детерминированный агрегированный показатель баланса нагрузки, восстановления, контроля и ясности. Чем выше, тем лучше.'
              )}
            </p>

            <div className="mt-6 h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${currentTeamSustainability}%` }}
              />
            </div>
          </div>

          <div className="bg-white/75 backdrop-blur-xl rounded-[2.25rem] p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-900/5">
            <p className="text-sm font-semibold text-slate-500">
              {t('Participation', 'Участие')}
            </p>

            <div className="mt-3 text-4xl font-bold text-slate-900">
              {currentData.participation.rate}%
            </div>

            <p className="mt-2 text-sm text-slate-600">
              {currentData.participation.responses} /{' '}
              {currentData.participation.invited}{' '}
              {t('responses', 'ответов')}
            </p>

            <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
              {t(
                'Privacy threshold met · aggregated view enabled',
                'Порог конфиденциальности соблюдён · агрегированный просмотр доступен'
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              {t('What is driving the signal', 'Что формирует сигнал')}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {t(
                'The same three factors used in the employee assessment.',
                'Те же три фактора, которые используются в оценке сотрудника.'
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {(
              [
                'workloadBalance',
                'recovery',
                'controlClarity',
              ] as const
            ).map((factor) => {
              const score = currentData.factors[factor];
              const isPrimary = factor === currentPrimaryFactor;

              return (
                <article
                  key={factor}
                  className={`rounded-[2rem] p-5 sm:p-6 border shadow-sm ${
                    isPrimary
                      ? 'bg-white/75 border-rose-200 ring-2 ring-rose-100'
                      : 'bg-white/75 border-slate-200/80'
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {factorLabels[factor]}
                      </h4>

                      <p className="text-[11px] text-slate-400 mt-1">
                        {factorWeights[factor]}%{' '}
                        {t('weight', 'вес')}
                      </p>
                    </div>

                    {isPrimary && (
                      <span className="h-fit rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700 border border-rose-100">
                        {t('Primary issue', 'Главная проблема')}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-4xl font-bold text-slate-900">
                      {score}
                    </span>
                    <span className="text-sm text-slate-400 mb-1">/ 100</span>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <span
                    className={`inline-flex mt-4 px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusClasses(
                      score
                    )}`}
                  >
                    {statusLabel(score)}
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white/75 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] p-6 sm:p-7 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-bold text-rose-600">
              {t('Primary issue', 'Главная проблема')}
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-900">
              {factorLabels[currentPrimaryFactor]}
            </h3>

            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
              {currentData.primaryIssue}
            </p>

            <p className="mt-4 text-xs text-slate-500">
              {t(
                'Primary issue is the factor with the largest weighted impact on the overall Team Sustainability score.',
                'Главная проблема — фактор с наибольшим взвешенным влиянием на общий Team Sustainability.'
              )}
            </p>
          </div>

          <div className="bg-white/75 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] p-6 sm:p-7 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-bold text-indigo-600">
              {t(
                'Recommended intervention',
                'Рекомендуемое действие'
              )}
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-900">
              {currentData.intervention.title}
            </h3>

            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
              {currentData.intervention.body}
            </p>

            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50/80 border border-slate-200/70 p-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  {t('Owner', 'Ответственный')}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {currentData.intervention.owner}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/80 border border-slate-200/70 p-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  {t('Re-check', 'Повторная оценка')}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {currentData.intervention.recheck}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/75 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                {t('Outcome after re-check', 'Результат после повторной оценки')}
              </p>

              <div className="mt-3 flex items-end gap-3">
                <span className="text-3xl font-bold text-slate-900">
                  {currentData.outcome.baseline}
                </span>

                <ArrowUpRight className="w-5 h-5 text-emerald-600 mb-1" />

                <span className="text-4xl font-bold text-slate-900">
                  {currentTeamSustainability}
                </span>

                <span className="mb-1 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-bold">
                  {`${currentOutcomeDelta >= 0 ? '+' : ''}${currentOutcomeDelta}`}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                {currentData.outcome.label}
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-sm font-bold text-slate-900">
                {t(
                  'Signal → action → re-check → outcome',
                  'Сигнал → действие → повторная оценка → результат'
                )}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {t(
                  'This demonstrates the decision loop. Synthetic demo data is not evidence of causal impact.',
                  'Это демонстрация decision loop. Synthetic demo data не является доказательством причинного эффекта.'
                )}
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === 'team') {
    return (
      <div key="team" className="space-y-6 max-w-7xl pb-10 animate-enter min-w-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('Team', 'Команда')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('Private employee assessment results are not visible to HR', 'Приватные результаты диагностики сотрудника не отображаются HR')}</p>
          </div>
          <div className="relative w-full md:w-72">
            <input type="text" placeholder={t('Search employees...', 'Поиск...')} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-sm focus:outline-none focus:border-teal-400 focus:bg-white/60 shadow-sm transition-all" />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div className="hidden md:block bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/30 border-b border-white/40 text-slate-500 font-semibold">
              <tr><th className="px-6 py-4">{t('Employee', 'Сотрудник')}</th><th className="px-6 py-4">{t('Role', 'Роль')}</th><th className="px-6 py-4">{t('Progress', 'Прогресс')}</th><th className="px-6 py-4">{t('Last activity', 'Последняя активность')}</th><th className="px-6 py-4">{t('Status', 'Статус')}</th></tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className={`hover:bg-white/40 transition-colors ${employee.id === 99 ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-6 py-4"><div className="flex items-center"><div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center text-slate-600 text-xs font-bold mr-4 shadow-sm border border-white/60">{employee.name.split(' ').map((name) => name[0]).join('').slice(0, 2)}</div><div><span className="font-bold text-slate-900 block">{employee.name}</span>{employee.id === 99 && <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">{t('You', 'Это вы')}</span>}</div></div></td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{employee.role}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-24 bg-white/50 rounded-full h-2 shadow-inner"><div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2 rounded-full shadow-sm" style={{ width: `${employee.progress}%` }} /></div><span className="text-xs font-bold text-slate-500">{employee.progress}%</span></div></td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">{employee.lastActive}</td>
                  <td className="px-6 py-4"><span className="text-slate-500 text-xs font-medium flex items-center gap-2 bg-white/30 px-3 py-1 rounded-full w-fit"><span className={`w-2 h-2 rounded-full shadow-sm ${employee.status === 'Active' ? 'bg-emerald-400' : employee.status === 'Warning' ? 'bg-amber-400' : 'bg-slate-300'}`} />{employee.statusLabel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className={`bg-white/40 backdrop-blur-xl rounded-[1.75rem] border border-white/50 shadow-sm p-5 ${employee.id === 99 ? 'ring-1 ring-indigo-100 bg-indigo-50/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center text-slate-600 text-xs font-bold shadow-sm border border-white/60 flex-shrink-0">{employee.name.split(' ').map((name) => name[0]).join('').slice(0, 2)}</div>
                <div className="flex-1 min-w-0"><div className="flex items-start justify-between gap-2"><div><p className="font-bold text-slate-900">{employee.name}</p><p className="text-xs text-slate-500 mt-0.5">{employee.role}</p>{employee.id === 99 && <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-1">{t('You', 'Это вы')}</p>}</div><span className="text-[11px] text-slate-500 bg-white/40 px-2 py-1 rounded-full whitespace-nowrap">{employee.statusLabel}</span></div>
                  <div className="mt-4 flex items-center gap-3"><div className="flex-1 bg-white/50 rounded-full h-2 shadow-inner"><div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2 rounded-full" style={{ width: `${employee.progress}%` }} /></div><span className="text-xs font-bold text-slate-500">{employee.progress}%</span></div>
                  <p className="text-[11px] text-slate-400 mt-2">{t('Last active', 'Последняя активность')}: {employee.lastActive}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && <div className="p-10 text-center text-slate-400 text-sm font-medium">{t('No matching employees', 'Нет данных для отображения')}</div>}
      </div>
    );
  }

  if (activeTab === 'reports') {
    return (
      <div key="reports" className="space-y-6 max-w-7xl pb-10 animate-enter min-w-0">
        <div><h2 className="text-xl font-bold text-slate-900">{t('Reports', 'Отчеты')}</h2><p className="text-xs text-slate-500 mt-1">{t('Illustrative synthetic metrics for the B2B analytics flow', 'Иллюстративные synthetic metrics для демонстрации B2B analytics flow')}</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8"/><p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-4 relative z-10">{t('Illustrative savings', 'Сэкономленный бюджет')}</p><div className="text-4xl font-bold mb-2 relative z-10">{t('$14.2K', '1.2M ₽')}</div><p className="text-slate-400 text-sm font-medium relative z-10">{t('Example ROI scenario', 'Пример ROI-сценария')}</p></div>
          <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/50 shadow-lg shadow-indigo-500/5"><p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-4">{t('Productivity', 'Производительность')}</p><div className="text-4xl font-bold text-slate-900 mb-2">+14%</div><p className="text-emerald-600 text-sm font-bold flex items-center bg-emerald-100/50 w-fit px-2 py-1 rounded-lg">↑ {t('above benchmark', 'выше рынка')}</p></div>
          <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/50 shadow-lg shadow-indigo-500/5"><p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-4">{t('Retention', 'Удержание кадров')}</p><div className="text-4xl font-bold text-slate-900 mb-2">96%</div><p className="text-emerald-600 text-sm font-bold bg-emerald-100/50 w-fit px-2 py-1 rounded-lg">{t('Stable', 'Стабильно')}</p></div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-blue-100 shadow-lg shadow-blue-500/5"><div className="flex justify-between items-start mb-4"><p className="text-blue-900/60 text-xs uppercase tracking-wider font-bold">{t('Sick leave reduction', 'Снижение больничных')}</p><Activity className="w-5 h-5 text-blue-500" /></div><div className="text-4xl font-bold text-blue-900 mb-2">-22%</div><p className="text-blue-700 text-sm font-medium">{t('Fewer illness-related absences', 'Меньше пропусков по болезни')}</p></div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-amber-100 shadow-lg shadow-amber-500/5"><div className="flex justify-between items-start mb-4"><p className="text-amber-900/60 text-xs uppercase tracking-wider font-bold">{t('Risk mitigation', 'Митигация рисков')}</p><AlertCircle className="w-5 h-5 text-amber-500" /></div><div className="text-4xl font-bold text-amber-900 mb-2">12</div><p className="text-amber-700 text-sm font-medium">{t('People moved out of the high-risk segment', 'Выведены из зоны высокого риска')}</p></div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5 overflow-hidden">
          <div className="px-5 sm:px-8 py-5 border-b border-white/40 bg-white/20"><h3 className="font-bold text-slate-900 text-sm">{t('Example management reports', 'Примеры управленческих отчетов')}</h3></div>
          <div className="divide-y divide-white/40">
            {reports.map((report) => (
              <div key={report.id} className="p-5 sm:p-6 flex items-start sm:items-center justify-between gap-3"><div className="flex items-start sm:items-center gap-3 sm:gap-5 min-w-0"><div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/60 rounded-2xl flex items-center justify-center text-slate-500 shadow-sm border border-white/60 flex-shrink-0"><FileText className="w-5 sm:w-6 h-5 sm:h-6" /></div><div className="min-w-0"><h4 className="font-bold text-slate-900 text-sm sm:text-base">{report.title}</h4><p className="text-xs text-slate-500 font-medium mt-1">{report.scope}</p></div></div><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/50 px-3 py-1 rounded-full border border-white/50 flex-shrink-0">Demo</span></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default HRView;
