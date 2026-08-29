import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, Activity, Users, LogOut, HeartHandshake, PieChart, LifeBuoy, BookOpen, Lightbulb, StickyNote } from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout }) => {
  const menuItems = role === UserRole.HR ? [
    { id: 'dashboard', label: 'Обзор', icon: LayoutDashboard },
    { id: 'team', label: 'Команда', icon: Users },
    { id: 'reports', label: 'Отчеты', icon: PieChart },
  ] : [
    { id: 'progress', label: 'Мой прогресс', icon: Activity },
    { id: 'program', label: 'Программа', icon: HeartHandshake },
    { id: 'insights', label: 'Инсайты', icon: Lightbulb },
    { id: 'notes', label: 'Мои заметки', icon: StickyNote },
    { id: 'first_aid', label: 'Скорая помощь', icon: LifeBuoy },
    { id: 'assessment', label: 'Оценка состояния', icon: LayoutDashboard },
  ];

  return (
    <div className="w-64 h-[calc(100vh-2rem)] m-4 flex flex-col fixed left-0 top-0 z-50">
      {/* Glass Container */}
      <div className="w-full h-full rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-indigo-500/10 flex flex-col overflow-hidden">
        
        <div className="p-8 pb-4">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-blue-500 shadow-lg shadow-teal-500/30"></div>
            <span>Resilience</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center w-full px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-white/60 text-slate-900 font-semibold shadow-lg shadow-black/5 border border-white/60 backdrop-blur-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/30'
              }`}
            >
              <item.icon 
                className={`w-5 h-5 mr-3 transition-all duration-300 ${
                  activeTab === item.id ? 'text-teal-600 scale-110' : 'text-slate-400 group-hover:text-slate-600'
                }`} 
                strokeWidth={2}
              />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={onLogout}
            className="flex items-center text-slate-500 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all w-full px-5 py-3.5"
          >
            <LogOut className="w-5 h-5 mr-3" strokeWidth={2} />
            <span className="text-sm font-medium">Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;