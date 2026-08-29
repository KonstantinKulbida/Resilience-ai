import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Briefcase, Zap, ChevronDown, Search, FileText, AlertCircle, Activity } from 'lucide-react';

interface HRViewProps {
  activeTab: string;
}

// --- MOCK DATA ---
const MOCK_DASHBOARD_DATA = {
  All: {
    stats: [
      { label: 'Участников', value: '125', change: '+12%', positive: true, icon: Users },
      { label: 'Снижение стресса', value: '32%', change: '-5%', positive: true, icon: Zap },
      { label: 'Рост эффективности', value: '18%', change: '+4%', positive: true, icon: Briefcase },
      { label: 'eNPS', value: '42', change: '+8', positive: true, icon: ArrowUpRight },
    ],
    trend: [
      { name: 'Н1', stress: 85, productivity: 40 },
      { name: 'Н2', stress: 80, productivity: 45 },
      { name: 'Н3', stress: 72, productivity: 55 },
      { name: 'Н4', stress: 65, productivity: 60 },
      { name: 'Н5', stress: 58, productivity: 68 },
      { name: 'Н6', stress: 45, productivity: 75 },
      { name: 'Н7', stress: 40, productivity: 82 },
      { name: 'Н8', stress: 35, productivity: 85 },
    ],
    risk: [
      { name: 'Высокий', value: 15 },
      { name: 'Средний', value: 30 },
      { name: 'Норма', value: 55 },
    ],
    grades: [
      { name: 'Junior', stress: 45 },
      { name: 'Middle', stress: 62 },
      { name: 'Senior', stress: 55 },
      { name: 'Lead', stress: 78 },
    ]
  },
  IT: {
    stats: [
      { label: 'Участников', value: '46', change: '+2%', positive: true, icon: Users },
      { label: 'Снижение стресса', value: '15%', change: '-2%', positive: true, icon: Zap },
      { label: 'Рост эффективности', value: '24%', change: '+12%', positive: true, icon: Briefcase },
      { label: 'eNPS', value: '35', change: '-2', positive: false, icon: ArrowDownRight },
    ],
    trend: [
      { name: 'Н1', stress: 90, productivity: 30 },
      { name: 'Н2', stress: 88, productivity: 35 },
      { name: 'Н3', stress: 85, productivity: 40 },
      { name: 'Н4', stress: 70, productivity: 60 },
      { name: 'Н5', stress: 65, productivity: 70 },
      { name: 'Н6', stress: 50, productivity: 85 },
      { name: 'Н7', stress: 45, productivity: 88 },
      { name: 'Н8', stress: 42, productivity: 90 },
    ],
    risk: [
      { name: 'Высокий', value: 25 },
      { name: 'Средний', value: 45 },
      { name: 'Норма', value: 30 },
    ],
    grades: [
      { name: 'Junior', stress: 50 },
      { name: 'Middle', stress: 65 },
      { name: 'Senior', stress: 60 },
      { name: 'Lead', stress: 85 },
    ]
  },
  Sales: {
    stats: [
      { label: 'Участников', value: '32', change: '+5%', positive: true, icon: Users },
      { label: 'Снижение стресса', value: '45%', change: '-12%', positive: true, icon: Zap },
      { label: 'Рост эффективности', value: '12%', change: '+1%', positive: true, icon: Briefcase },
      { label: 'eNPS', value: '58', change: '+15', positive: true, icon: ArrowUpRight },
    ],
    trend: [
      { name: 'Н1', stress: 70, productivity: 50 },
      { name: 'Н2', stress: 65, productivity: 55 },
      { name: 'Н3', stress: 50, productivity: 65 },
      { name: 'Н4', stress: 45, productivity: 68 },
      { name: 'Н5', stress: 40, productivity: 70 },
      { name: 'Н6', stress: 35, productivity: 72 },
      { name: 'Н7', stress: 30, productivity: 75 },
      { name: 'Н8', stress: 25, productivity: 78 },
    ],
    risk: [
      { name: 'Высокий', value: 5 },
      { name: 'Средний', value: 20 },
      { name: 'Норма', value: 75 },
    ],
    grades: [
      { name: 'Junior', stress: 35 },
      { name: 'Middle', stress: 55 },
      { name: 'Senior', stress: 45 },
      { name: 'Lead', stress: 60 },
    ]
  }
};

const MOCK_EMPLOYEES = [
  { id: 99, name: 'Иванов Александр', dept: 'IT Разработка', role: 'Senior Developer', progress: 65, status: 'Active', lastActive: 'Сейчас' },
  { id: 1, name: 'Смирнов Алексей', dept: 'IT Разработка', role: 'Senior Backend', progress: 85, status: 'Active', lastActive: '2 ч.' },
  { id: 2, name: 'Петрова Елена', dept: 'Продажи', role: 'Sales Manager', progress: 32, status: 'Active', lastActive: '1 д.' },
  { id: 3, name: 'Козлов Дмитрий', dept: 'IT Разработка', role: 'Team Lead', progress: 15, status: 'Warning', lastActive: '5 д.' },
  { id: 4, name: 'Иванова Мария', dept: 'Маркетинг', role: 'Junior Specialist', progress: 95, status: 'Completed', lastActive: '1 ч.' },
  { id: 5, name: 'Волков Сергей', dept: 'Продажи', role: 'Head of Sales', progress: 45, status: 'Active', lastActive: '3 ч.' },
  { id: 6, name: 'Соколова Анна', dept: 'HR', role: 'Recruiter', progress: 10, status: 'Active', lastActive: '2 д.' },
  { id: 7, name: 'Морозов Игорь', dept: 'IT Разработка', role: 'DevOps', progress: 60, status: 'Active', lastActive: 'Вчера' },
  { id: 8, name: 'Новикова Ольга', dept: 'Финансы', role: 'Accountant', progress: 5, status: 'Inactive', lastActive: '2 нед.' },
];

const MOCK_REPORTS = [
  { id: 1, title: 'ROI программы устойчивости', scope: 'Иллюстративный управленческий отчет' },
  { id: 2, title: 'Агрегированные риски по подразделениям', scope: 'Без персональных wellbeing-оценок' },
  { id: 3, title: 'Динамика eNPS и участия', scope: 'Пример аналитического среза' },
  { id: 4, title: 'Вовлеченность в практики', scope: 'Пример продуктовой аналитики' },
];

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

const HRView: React.FC<HRViewProps> = ({ activeTab }) => {
  const [department, setDepartment] = useState<'All' | 'IT' | 'Sales'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const currentData = useMemo(() => {
    return MOCK_DASHBOARD_DATA[department] || MOCK_DASHBOARD_DATA.All;
  }, [department]);

  const filteredEmployees = MOCK_EMPLOYEES.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeTab === 'dashboard') {
    return (
      <div key="dashboard" className="space-y-6 max-w-7xl pb-10 animate-enter">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Обзор метрик</h2>
            <p className="text-xs text-slate-500 mt-1">Synthetic demo data • HR получает только агрегированные wellbeing-показатели</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative">
              <select 
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                className="appearance-none bg-white/40 backdrop-blur-md border border-white/60 text-slate-700 py-2.5 pl-5 pr-10 rounded-2xl text-sm focus:outline-none focus:border-teal-400 hover:bg-white/60 transition-colors shadow-sm"
              >
                <option value="All">Все отделы</option>
                <option value="IT">IT Разработка</option>
                <option value="Sales">Отдел продаж</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {currentData.stats.map((stat, idx) => (
            <div key={idx} className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-slate-500 font-semibold">{stat.label}</p>
                <stat.icon className="w-4 h-4 text-slate-400" />
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
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-900">Динамика показателей</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData.trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.8)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="stress" name="Стресс" stroke="#ef4444" fill="url(#colorStress)" strokeWidth={3} />
                  <Area type="monotone" dataKey="productivity" name="Эффективность" stroke="#10b981" fill="url(#colorProd)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5 flex flex-col justify-center relative overflow-hidden">
            <h3 className="text-base font-bold text-slate-900 mb-1 z-10">Агрегированный риск выгорания</h3>
            <p className="text-xs text-slate-500 mb-3 z-10">Без раскрытия индивидуальных assessment scores</p>
            <div className="h-56 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentData.risk}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {currentData.risk.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                 <div className="text-center">
                    <span className="text-3xl font-bold text-slate-900">{currentData.risk[0].value}%</span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Высокий риск</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Burnout by Grade Chart */}
        <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-900">Уровень стресса по грейдам ({department === 'All' ? 'Все отделы' : department})</h3>
              <div className="text-xs text-slate-500 bg-white/40 px-3 py-1 rounded-full border border-white/50">
                Среднее значение за 30 дней
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.grades} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={60}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.2)'}}
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.9)', color: '#0f172a' }}
                  />
                  <Bar dataKey="stress" name="Уровень стресса (%)" radius={[12, 12, 0, 0]}>
                    {currentData.grades.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.stress > 70 ? '#ef4444' : entry.stress > 50 ? '#f59e0b' : '#3b82f6'} />
                    ))}
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
      <div key="team" className="space-y-6 max-w-7xl pb-10 animate-enter">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
             <h2 className="text-xl font-bold text-slate-900">Команда</h2>
             <p className="text-xs text-slate-500 mt-1">Приватные результаты диагностики сотрудника не отображаются HR</p>
           </div>
           <div className="relative w-full md:w-72">
             <input 
               type="text" 
               placeholder="Поиск..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-sm focus:outline-none focus:border-teal-400 focus:bg-white/60 shadow-sm transition-all"
             />
             <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
           </div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/30 border-b border-white/40 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Сотрудник</th>
                <th className="px-6 py-4">Роль</th>
                <th className="px-6 py-4">Прогресс</th>
                <th className="px-6 py-4">Последняя активность</th>
                <th className="px-6 py-4">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className={`hover:bg-white/40 transition-colors ${emp.id === 99 ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center text-slate-600 text-xs font-bold mr-4 shadow-sm border border-white/60">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{emp.name}</span>
                        {emp.id === 99 && <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Это вы</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{emp.role}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-white/50 rounded-full h-2 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2 rounded-full shadow-sm" 
                          style={{ width: `${emp.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{emp.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                    {emp.lastActive}
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-slate-500 text-xs font-medium flex items-center gap-2 bg-white/30 px-3 py-1 rounded-full w-fit">
                        <span className={`w-2 h-2 rounded-full shadow-sm ${emp.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                        {emp.status}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-sm font-medium">
              Нет данных для отображения
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'reports') {
    return (
      <div key="reports" className="space-y-6 max-w-7xl pb-10 animate-enter">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Отчеты</h2>
          <p className="text-xs text-slate-500 mt-1">Иллюстративные synthetic metrics для демонстрации B2B analytics flow</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8"></div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-4 relative z-10">Сэкономленный бюджет</p>
              <div className="text-4xl font-bold mb-2 relative z-10">1.2M ₽</div>
              <p className="text-slate-400 text-sm font-medium relative z-10">Пример ROI-сценария</p>
           </div>
           
           <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/50 shadow-lg shadow-indigo-500/5">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-4">Производительность</p>
              <div className="text-4xl font-bold text-slate-900 mb-2">+14%</div>
              <p className="text-emerald-600 text-sm font-bold flex items-center bg-emerald-100/50 w-fit px-2 py-1 rounded-lg">
                ↑ выше рынка
              </p>
           </div>

           <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/50 shadow-lg shadow-indigo-500/5">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-4">Удержание кадров</p>
              <div className="text-4xl font-bold text-slate-900 mb-2">96%</div>
              <p className="text-emerald-600 text-sm font-bold bg-emerald-100/50 w-fit px-2 py-1 rounded-lg">Стабильно</p>
           </div>

           {/* Additional Metric: Sick Leave Reduction */}
           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-xl rounded-[2rem] p-8 border border-blue-100 shadow-lg shadow-blue-500/5">
              <div className="flex justify-between items-start mb-4">
                 <p className="text-blue-900/60 text-xs uppercase tracking-wider font-bold">Снижение больничных</p>
                 <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-4xl font-bold text-blue-900 mb-2">-22%</div>
              <p className="text-blue-700 text-sm font-medium">Меньше пропусков по болезни</p>
           </div>

           {/* Additional Metric: Risk Mitigation */}
           <div className="bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-xl rounded-[2rem] p-8 border border-amber-100 shadow-lg shadow-amber-500/5">
              <div className="flex justify-between items-start mb-4">
                 <p className="text-amber-900/60 text-xs uppercase tracking-wider font-bold">Митигация рисков</p>
                 <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-4xl font-bold text-amber-900 mb-2">12 чел.</div>
              <p className="text-amber-700 text-sm font-medium">Выведены из зоны высокого риска</p>
           </div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-lg shadow-indigo-500/5 overflow-hidden">
          <div className="px-8 py-5 border-b border-white/40 bg-white/20">
            <h3 className="font-bold text-slate-900 text-sm">Примеры управленческих отчетов</h3>
          </div>
          <div className="divide-y divide-white/40">
            {MOCK_REPORTS.map((report) => (
              <div key={report.id} className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center text-slate-500 shadow-sm border border-white/60">
                     <FileText className="w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900 text-base">{report.title}</h4>
                     <p className="text-xs text-slate-500 font-medium mt-1">{report.scope}</p>
                   </div>
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/50 px-3 py-1 rounded-full border border-white/50">Demo</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default HRView;