import React from 'react';
import { UserRole } from '../types';
import {
  ArrowRight,
  Building2,
  Clock3,
  LockKeyhole,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen font-sans text-slate-900 p-3 sm:p-4 lg:px-6 lg:py-4 flex items-center">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-400 to-blue-500 shadow-lg shadow-teal-500/25 flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-full" />
            </div>

            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 truncate">
              Resilience.ai
            </span>
          </div>

          <div className="px-3 py-2 rounded-full bg-white/40 border border-white/60 text-xs font-semibold text-slate-500">
            Demo
          </div>
        </header>

        <main className="grid lg:grid-cols-[1.12fr_0.88fr] gap-4 sm:gap-5 lg:gap-6 items-stretch">
          <section className="bg-white/45 backdrop-blur-2xl border border-white/55 shadow-2xl shadow-indigo-500/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="inline-flex self-start items-center gap-2 px-3.5 py-2 rounded-full bg-white/55 border border-white/70 text-xs font-semibold text-slate-600 mb-5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Private employee signals. Aggregated People insights.
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.1rem] xl:text-[3.25rem] lg:leading-[1.02] font-bold tracking-[-0.035em] text-slate-900 max-w-3xl">
              See workforce strain before it becomes attrition or delivery risk.
            </h1>

            <p className="mt-4 text-base lg:text-[1.05rem] text-slate-600 leading-relaxed max-w-2xl">
              Employees get a private 3-minute assessment and next steps.
              People teams see privacy-safe team signals and actions.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                type="button"
                onClick={() => onLogin(UserRole.EMPLOYEE)}
                className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-white font-semibold shadow-xl shadow-slate-900/15 transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Take the 3-minute assessment
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => onLogin(UserRole.HR)}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white/55 border border-white/70 px-6 py-4 text-slate-700 font-semibold transition-all hover:bg-white/80 hover:-translate-y-0.5"
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                View the People dashboard
              </button>
            </div>

            <p className="mt-5 text-xs sm:text-sm text-slate-500">
              Demo environment • People-view company data is synthetic.
            </p>
          </section>

          <aside className="bg-white/35 backdrop-blur-2xl border border-white/50 shadow-xl shadow-indigo-500/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-7 lg:p-8 flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-bold text-indigo-600/80 mb-3">
                Explore the core journey
              </p>

              <h2 className="text-2xl lg:text-[1.7rem] font-bold tracking-tight text-slate-900">
                One signal, two views.
              </h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white/45 border border-white/60 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">
                      <LockKeyhole className="w-4 h-4 text-teal-600" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        Employee view
                      </p>
                      <p className="text-xs text-slate-500">
                        Private by design
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600">
                    Complete the 12-question Work Sustainability assessment,
                    see the result, and get practical next steps.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/45 border border-white/60 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        People view
                      </p>
                      <p className="text-xs text-slate-500">
                        Aggregated signals only
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600">
                    See Team Sustainability, its drivers, the primary issue,
                    recommended intervention, owner, re-check, and outcome.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="flex items-start gap-2.5 rounded-2xl bg-white/35 border border-white/50 p-3">
                <Clock3 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>12 questions · ~3 min</span>
              </div>

              <div className="flex items-start gap-2.5 rounded-2xl bg-white/35 border border-white/50 p-3">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>Not a medical diagnosis</span>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;