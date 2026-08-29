import React, { useEffect, useState } from 'react';
import { UserRole } from './types';
import Sidebar from './components/Sidebar';
import EmployeeView from './components/EmployeeView';
import HRView from './components/HRView';
import LoginPage from './components/LoginPage';

const EMPLOYEE_TAB_TO_SLUG: Record<string, string> = {
  progress: 'progress',
  program: 'program',
  insights: 'insights',
  notes: 'notes',
  first_aid: 'first-aid',
  assessment: 'assessment',
};

const EMPLOYEE_SLUG_TO_TAB = Object.fromEntries(
  Object.entries(EMPLOYEE_TAB_TO_SLUG).map(([tab, slug]) => [slug, tab])
) as Record<string, string>;

const HR_TABS = new Set(['dashboard', 'team', 'reports']);

interface AppRoute {
  isLoggedIn: boolean;
  role: UserRole;
  activeTab: string;
  selectedModuleId: number | null;
}

const parseRoute = (pathname: string): AppRoute => {
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === 'employee') {
    const activeTab = EMPLOYEE_SLUG_TO_TAB[parts[1]] || 'progress';
    const moduleId = parts[2] === 'module' ? Number(parts[3]) : Number.NaN;

    return {
      isLoggedIn: true,
      role: UserRole.EMPLOYEE,
      activeTab,
      selectedModuleId: Number.isFinite(moduleId) ? moduleId : null,
    };
  }

  if (parts[0] === 'hr') {
    const activeTab = HR_TABS.has(parts[1]) ? parts[1] : 'dashboard';
    return {
      isLoggedIn: true,
      role: UserRole.HR,
      activeTab,
      selectedModuleId: null,
    };
  }

  return {
    isLoggedIn: false,
    role: UserRole.EMPLOYEE,
    activeTab: 'progress',
    selectedModuleId: null,
  };
};

const App: React.FC = () => {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const route = parseRoute(pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => {
    const state = { resilience: true, ...(options?.state || {}) };
    if (options?.replace) {
      window.history.replaceState(state, '', path);
    } else {
      window.history.pushState(state, '', path);
    }
    setPathname(path);
  };

  const handleLogin = (selectedRole: UserRole) => {
    navigate(selectedRole === UserRole.HR ? '/hr/dashboard' : '/employee/progress');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleTabChange = (tab: string) => {
    if (route.role === UserRole.HR) {
      navigate(`/hr/${HR_TABS.has(tab) ? tab : 'dashboard'}`);
      return;
    }

    const slug = EMPLOYEE_TAB_TO_SLUG[tab] || 'progress';
    navigate(`/employee/${slug}`);
  };

  const handleModuleSelect = (moduleId: number) => {
    const slug = EMPLOYEE_TAB_TO_SLUG[route.activeTab] || 'program';
    const parentPath = `/employee/${slug}`;
    navigate(`${parentPath}/module/${moduleId}`, { state: { fromPath: parentPath } });
  };

  const handleModuleBack = () => {
    const state = window.history.state as { fromPath?: string } | null;
    if (state?.fromPath) {
      window.history.back();
      return;
    }

    const slug = EMPLOYEE_TAB_TO_SLUG[route.activeTab] || 'program';
    navigate(`/employee/${slug}`, { replace: true });
  };

  if (!route.isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen text-slate-900">
      <Sidebar
        role={route.role}
        activeTab={route.activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
      />

      <main className="flex-1 ml-[18rem] p-8 mr-4 h-screen overflow-y-auto no-scrollbar">
        <header className="flex justify-between items-center mb-10 pt-4">
          <div className="bg-white/30 backdrop-blur-xl px-6 py-3 rounded-3xl border border-white/40 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {route.role === UserRole.EMPLOYEE ? 'Личный кабинет' : 'Аналитика'}
            </h1>
            <p className="text-slate-500 text-sm">
              {route.role === UserRole.EMPLOYEE
                ? 'Программа устойчивости'
                : 'ООО "ТехноГрупп"'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/30 backdrop-blur-xl pl-6 pr-2 py-2 rounded-full border border-white/40 shadow-sm">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Александр Иванов</p>
              <p className="text-xs text-slate-500">{route.role === UserRole.EMPLOYEE ? 'Senior Developer' : 'HR Director'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-slate-100 border border-white flex items-center justify-center text-slate-600 text-xs font-bold shadow-inner">
              АИ
            </div>
          </div>
        </header>

        {route.role === UserRole.EMPLOYEE ? (
          <EmployeeView
            activeTab={route.activeTab}
            selectedModuleId={route.selectedModuleId}
            onModuleSelect={handleModuleSelect}
            onModuleBack={handleModuleBack}
          />
        ) : (
          <HRView activeTab={route.activeTab} />
        )}
      </main>
    </div>
  );
};

export default App;
