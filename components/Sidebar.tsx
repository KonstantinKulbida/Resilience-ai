import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, Activity, Users, LogOut, HeartHandshake, PieChart, LifeBuoy, Lightbulb, StickyNote, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from './LanguageToggle';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, mobileOpen, onMobileClose }) => {
  const { t } = useLanguage();

  const menuItems = role === UserRole.HR ? [
    { id: 'dashboard', label: t('Overview', 'Обзор'), icon: LayoutDashboard },
    { id: 'team', label: t('Team', 'Команда'), icon: Users },
    { id: 'reports', label: t('Reports', 'Отчеты'), icon: PieChart },
  ] : [
    { id: 'progress', label: t('My progress', 'Мой прогресс'), icon: Activity },
    { id: 'program', label: t('Program', 'Программа'), icon: HeartHandshake },
    { id: 'insights', label: t('Insights', 'Инсайты'), icon: Lightbulb },
    { id: 'notes', label: t('My notes', 'Мои заметки'), icon: StickyNote },
    { id: 'first_aid', label: t('Quick relief', 'Скорая помощь'), icon: LifeBuoy },
    { id: 'assessment', label: t('Assessment', 'Оценка состояния'), icon: LayoutDashboard },
  ];

  const handleTab = (tab: string) => {
    setActiveTab(tab);
    onMobileClose();
  };

  const sidebarContent = (
    <div className="w-full h-full rounded-[2.5rem] bg-white/45 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-indigo-500/10 flex flex-col overflow-hidden">
      <div className="p-7 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-blue-500 shadow-lg shadow-teal-500/30"></div>
          <span>Resilience</span>
        </h1>
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden w-9 h-9 rounded-xl bg-white/50 text-slate-500 flex items-center justify-center"
          aria-label={t('Close navigation', 'Закрыть меню')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTab(item.id)}
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

      <div className="p-4 mt-auto space-y-2">
        <div className="px-4 pb-1">
          <LanguageToggle compact />
        </div>
        <button
          onClick={onLogout}
          className="flex items-center text-slate-500 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all w-full px-5 py-3.5"
        >
          <LogOut className="w-5 h-5 mr-3" strokeWidth={2} />
          <span className="text-sm font-medium">{t('Sign out', 'Выйти')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 h-[calc(100vh-2rem)] m-4 flex-col fixed left-0 top-0 z-40">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-label={t('Close navigation', 'Закрыть меню')}
          />
          <aside className="relative w-[min(19rem,calc(100vw-2rem))] h-[calc(100vh-2rem)] m-4 flex flex-col animate-enter">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
