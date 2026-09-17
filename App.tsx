import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { UserRole } from './types';

import EmployeeView from './components/EmployeeView';
import HRView from './components/HRView';
import LoginPage from './components/LoginPage';
import LanguageToggle from './components/LanguageToggle';

import { House } from 'lucide-react';

import { useLanguage } from './i18n/LanguageContext';

const EMPLOYEE_TAB_TO_SLUG: Record<string, string> = {
  progress: 'progress',
  program: 'program',
  insights: 'insights',
  notes: 'notes',
  first_aid: 'first-aid',
  assessment: 'assessment',
};

const EMPLOYEE_SLUG_TO_TAB = Object.fromEntries(
  Object.entries(EMPLOYEE_TAB_TO_SLUG).map(([tab, slug]) => [
    slug,
    tab,
  ])
) as Record<string, string>;

const HR_TABS = new Set([
  'dashboard',
  'team',
  'reports',
]);

interface AppRoute {
  isLoggedIn: boolean;
  role: UserRole;
  activeTab: string;
  selectedModuleId: number | null;
}

const parseRoute = (
  pathname: string
): AppRoute => {
  const parts = pathname
    .split('/')
    .filter(Boolean);

  if (parts[0] === 'employee') {
    const activeTab =
      EMPLOYEE_SLUG_TO_TAB[parts[1]] ||
      'progress';

    const moduleId =
      parts[2] === 'module'
        ? Number(parts[3])
        : Number.NaN;

    return {
      isLoggedIn: true,
      role: UserRole.EMPLOYEE,
      activeTab,
      selectedModuleId:
        Number.isFinite(moduleId)
          ? moduleId
          : null,
    };
  }

  if (parts[0] === 'hr') {
    const activeTab = HR_TABS.has(
      parts[1]
    )
      ? parts[1]
      : 'dashboard';

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
  const [pathname, setPathname] =
    useState(
      () => window.location.pathname
    );

  const mainRef =
    useRef<HTMLElement>(null);

  const { t, setLanguage } =
    useLanguage();

  const route = parseRoute(pathname);

  useEffect(() => {
    const handlePopState = () =>
      setPathname(
        window.location.pathname
      );

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () =>
      window.removeEventListener(
        'popstate',
        handlePopState
      );
  }, []);

  useLayoutEffect(() => {
    mainRef.current?.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  }, [pathname]);

  const navigate = (
    path: string,
    options?: {
      replace?: boolean;
      state?: Record<
        string,
        unknown
      >;
    }
  ) => {
    const state = {
      resilience: true,
      ...(options?.state || {}),
    };

    if (options?.replace) {
      window.history.replaceState(
        state,
        '',
        path
      );
    } else {
      window.history.pushState(
        state,
        '',
        path
      );
    }

    setPathname(path);
  };

  const handleLogin = (
    selectedRole: UserRole
  ) => {
    setLanguage('en');

    navigate(
      selectedRole === UserRole.HR
        ? '/hr/dashboard'
        : '/employee/assessment'
    );
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleModuleSelect = (
    moduleId: number
  ) => {
    const slug =
      EMPLOYEE_TAB_TO_SLUG[
        route.activeTab
      ] || 'program';

    const parentPath =
      `/employee/${slug}`;

    navigate(
      `${parentPath}/module/${moduleId}`,
      {
        state: {
          fromPath: parentPath,
        },
      }
    );
  };

  const handleModuleBack = () => {
    const state =
      window.history.state as {
        fromPath?: string;
      } | null;

    if (state?.fromPath) {
      window.history.back();
      return;
    }

    const slug =
      EMPLOYEE_TAB_TO_SLUG[
        route.activeTab
      ] || 'program';

    navigate(
      `/employee/${slug}`,
      {
        replace: true,
      }
    );
  };

  if (!route.isLoggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
      />
    );
  }

  const isEmployee =
    route.role === UserRole.EMPLOYEE;

  return (
    <div className="min-h-screen text-slate-900">
      <main
        ref={mainRef}
        className="w-full min-w-0 min-h-screen lg:h-screen overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8"
      >
        <header className="max-w-7xl mx-auto mb-7 sm:mb-9">
          <div className="bg-white/75 backdrop-blur-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 rounded-[1.75rem] px-4 sm:px-5 py-3.5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
              {/* LEFT */}
              <div className="justify-self-start flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={handleHome}
                  className="h-10 px-3 sm:px-4 rounded-xl bg-white/70 border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-2 flex-shrink-0"
                  aria-label={t(
                    'Back to demo home',
                    'На главную демо'
                  )}
                >
                  <House className="w-4 h-4" />

                  <span className="hidden lg:inline text-sm font-semibold">
                    {t(
                      'Demo home',
                      'Главная'
                    )}
                  </span>
                </button>

                <div className="hidden sm:block h-8 w-px bg-slate-200/80" />

                <button
                  type="button"
                  onClick={handleHome}
                  className="flex items-center gap-2.5 min-w-0 group"
                >
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-600/20 flex-shrink-0" />

                  <span className="hidden md:inline text-base font-bold tracking-tight text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                    Resilience
                  </span>
                </button>
              </div>

              {/* CENTER */}
              <div className="hidden sm:block text-center px-3">
                <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                  {isEmployee
                    ? t(
                        'Employee demo',
                        'Демо сотрудника'
                      )
                    : t(
                        'People analytics',
                        'Аналитика'
                      )}
                </p>

                <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                  {isEmployee
                    ? t(
                        'Private assessment experience',
                        'Приватная оценка состояния'
                      )
                    : t(
                        'Northstar Labs · synthetic demo',
                        'Northstar Labs · synthetic demo'
                      )}
                </p>
              </div>

              {/* RIGHT */}
              <div className="justify-self-end flex items-center gap-2 sm:gap-3">
                <LanguageToggle compact />

                <div className="w-10 h-10 rounded-full bg-white/80 border border-slate-200/80 flex items-center justify-center text-slate-600 text-xs font-bold shadow-inner flex-shrink-0">
                  {t(
                    'AM',
                    'АИ'
                  )}
                </div>
              </div>
            </div>

            {/* MOBILE TITLE */}
            <div className="sm:hidden mt-3 pt-3 border-t border-slate-200/70 text-center">
              <p className="text-sm font-bold text-slate-900">
                {isEmployee
                  ? t(
                      'Employee demo',
                      'Демо сотрудника'
                    )
                  : t(
                      'People analytics',
                      'Аналитика'
                    )}
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                {isEmployee
                  ? t(
                      'Private assessment experience',
                      'Приватная оценка состояния'
                    )
                  : t(
                      'Northstar Labs · synthetic demo',
                      'Northstar Labs · synthetic demo'
                    )}
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {isEmployee ? (
            <EmployeeView
              activeTab={
                route.activeTab
              }
              selectedModuleId={
                route.selectedModuleId
              }
              onModuleSelect={
                handleModuleSelect
              }
              onModuleBack={
                handleModuleBack
              }
            />
          ) : (
            <HRView
              activeTab={
                route.activeTab
              }
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
