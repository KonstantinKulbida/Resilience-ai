import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Briefcase, Zap, ChevronDown, Search, FileText, AlertCircle, Activity } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HRViewProps {
  activeTab: string;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

const HRView: React.FC<HRViewProps> = ({ activeTab }) => {
  const { t } = useLanguage();
  const [department, setDepartment] = useState<'All' | 'IT' | 'Sales'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const dashboardData = useMemo(() => ({
    All: {
      stats: [
        { label: t('Participants', 'Участников'), value: '125', change: '+12%', positive: true, icon: Users },
        { label: t('Stress reduction', 'Снижение стресса'), value: '32%', change: '-5%', positive: true, icon: Zap },
        { label: t('Effectiveness lift', 'Рост эффективности'), value: '18%', change: '+4%', positive: true, icon: Briefcase },
        { label: 'eNPS', value: '42', change: '+8', positive: true, icon: ArrowUpRight },
      ],
      trend: [
        { name: t('W1', 'Н1'), stress: 85, productivity: 40 }, { name: t('W2', 'Н2'), stress: 80, productivity: 45 },
        { name: t('W3', 'Н3'), stress: 72, productivity: 55 }, { name: t('W4', 'Н4'), stress: 65, productivity: 60 },
        { name: t('W5', 'Н5'), stress: 58, productivity: 68 }, { name: t('W6', 'Н6'), stress: 45, productivity: 75 },
        { name: t('W7', 'Н7'), stress: 40, productivity: 82 }, { name: t('W8', 'Н8'), stress: 35, productivity: 85 },
      ],
      risk: [
        { name: t('High', 'Высокий'), value: 15 },
        { name: t('Moderate', 'Средний'), value: 30 },
        { name: t('Healthy range', 'Норма'), value: 55 },
      ],
      grades: [
        { name: 'Junior', stress: 45 }, { name: 'Middle', stress: 62 }, { name: 'Senior', stress: 55 }, { name: 'Lead', stress: 78 },
      ],
    },
    IT: {
      stats: [
        { label: t('Participants', 'Участников'), value: '46', change: '+2%', positive: true, icon: Users },
        { label: t('Stress reduction', 'Снижение стресса'), value: '15%', change: '-2%', positive: true, icon: Zap },
        { label: t('Effectiveness lift', 'Рост эффективности'), value: '24%', change: '+12%', positive: true, icon: Briefcase },
        { label: 'eNPS', value: '35', change: '-2', positive: false, icon: ArrowDownRight },
      ],
      trend: [
        { name: t('W1', 'Н1'), stress: 90, productivity: 30 }, { name: t('W2', 'Н2'), stress: 88, productivity: 35 },
        { name: t('W3', 'Н3'), stress: 85, productivity: 40 }, { name: t('W4', 'Н4'), stress: 70, productivity: 60 },
        { name: t('W5', 'Н5'), stress: 65, productivity: 70 }, { name: t('W6', 'Н6'), stress: 50, productivity: 85 },
        { name: t('W7', 'Н7'), stress: 45, productivity: 88 }, { name: t('W8', 'Н8'), stress: 42, productivity: 90 },
      ],
      risk: [
        { name: t('High', 'Высокий'), value: 25 },
        { name: t('Moderate', 'Средний'), value: 45 },
        { name: t('Healthy range', 'Норма'), value: 30 },
      ],
      grades: [
        { name: 'Junior', stress: 50 }, { name: 'Middle', stress: 65 }, { name: 'Senior', stress: 60 }, { name: 'Lead', stress: 85 },
      ],
    },
    Sales: {
      stats: [
        { label: t('Participants', 'Участников'), value: '32', change: '+5%', positive: true, icon: Users },
        { label: t('Stress reduction', 'Снижение стресса'), value: '45%', change: '-12%', positive: true, icon: Zap },
        { label: t('Effectiveness lift', 'Рост эффективности'), value: '12%', change: '+1%', positive: true, icon: Briefcase },
        { label: 'eNPS', value: '58', change: '+15', positive: true, icon: ArrowUpRight },
      ],
      trend: [
        { name: t('W1', 'Н1'), stress: 70, productivity: 50 }, { name: t('W2', 'Н2'), stress: 65, productivity: 55 },
        { name: t('W3', 'Н3'), stress: 50, productivity: 65 }, { name: t('W4', 'Н4'), stress: 45, productivity: 68 },
        { name: t('W5', 'Н5'), stress: 40, productivity: 70 }, { name: t('W6', 'Н6'), stress: 35, productivity: 72 },
        { name: t('W7', 'Н7'), stress: 30, productivity: 75 }, { name: t('W8', 'Н8'), stress: 25, productivity: 78 },
      ],
      risk: [
        { name: t('High', 'Высокий'), value: 5 },
        { name: t('Moderate', 'Средний'), value: 20 },
        { name: t('Healthy range', 'Норма'), value: 75 },
      ],
      grades: [
        { name: 'Junior', stress: 35 }, { name: 'Middle', stress: 55 }, { name: 'Senior', stress: 45 }, { name: 'Lead', stress: 60 },
      ],
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
    return (
      <div key="dashboard" className="space-y-6 max-w-7xl pb-10 animate-enter min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('Workforce overview', 'Обзор метрик')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('Synthetic demo data • HR only sees aggregated wellbeing indicators', 'Synthetic demo data • HR получает только агрегированные wellbeing-показатели')}</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value as 'All' | 'IT' | 'Sales')}
              className="w-full sm:w-auto appearance-none bg-white/40 backdrop-blur-md border border-white/60 text-slate-700 py-2.5 pl-5 pr-10 rounded-2xl text-sm focus:outline-none focus:border-teal-400 hover:bg-white/60 transition-colors shadow-sm"
            >
              <option value="All">{t('All departments', 'Все отделы')}</option>
              <option value="IT">{t('Product & Engineering', 'IT Разработка')}</option>
              <option value="Sales">{t('Sales', 'Отдел продаж')}</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {currentData.stats.map((stat, index) => (
            <div key={index} className="bg-white/40 backdrop-blur-xl p-5 sm:p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5 min-w-0">
              <div className="flex justify-between items-center gap-2 mb-3">
                <p className="text-sm text-slate-500 font-semibold">{stat.label}</p>
                <stat.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                <span className={`text-xs font-bold py-1 px-2 rounded-lg mb-1 flex items-center ${stat.positive ? 'bg-emerald-100/50 text-emerald-700' : 'bg-red-100/50 text-red-700'}`}>
                  {stat.positive ? '↑' : '↓'} {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl p-5 sm:p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5 min-w-0">
            <h3 className="text-base font-bold text-slate-900 mb-6">{t('Wellbeing & effectiveness trend', 'Динамика показателей')}</h3>
            <div className="h-64 sm:h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData.trend} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.9)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="stress" name={t('Stress', 'Стресс')} stroke="#ef4444" fill="url(#colorStress)" strokeWidth={3} />
                  <Area type="monotone" dataKey="productivity" name={t('Effectiveness', 'Эффективность')} stroke="#10b981" fill="url(#colorProd)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xl p-5 sm:p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5 flex flex-col justify-center relative overflow-hidden min-w-0">
            <h3 className="text-base font-bold text-slate-900 mb-1 z-10">{t('Aggregated burnout risk', 'Агрегированный риск выгорания')}</h3>
            <p className="text-xs text-slate-500 mb-3 z-10">{t('Individual assessment scores are never shown to HR', 'Без раскрытия индивидуальных assessment scores')}</p>
            <div className="h-56 relative z-10 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={currentData.risk} cx="50%" cy="50%" innerRadius={58} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                    {currentData.risk.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                <div className="text-center"><span className="text-3xl font-bold text-slate-900">{currentData.risk[0].value}%</span><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('High risk', 'Высокий риск')}</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl p-5 sm:p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <h3 className="text-base font-bold text-slate-900">{t('Stress level by seniority', 'Уровень стресса по грейдам')} ({departmentLabel})</h3>
            <div className="text-xs text-slate-500 bg-white/40 px-3 py-1 rounded-full border border-white/50 w-fit">{t('30-day average', 'Среднее значение за 30 дней')}</div>
          </div>
          <div className="h-60 sm:h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.grades} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={48}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.2)' }} contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.9)', color: '#0f172a' }} />
                <Bar dataKey="stress" name={t('Stress level (%)', 'Уровень стресса (%)')} radius={[12, 12, 0, 0]}>
                  {currentData.grades.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.stress > 70 ? '#ef4444' : entry.stress > 50 ? '#f59e0b' : '#3b82f6'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
