import React from 'react';
import { UserRole } from '../types';
import { Users, Building2, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center font-sans text-slate-900 p-4">
      
      <div className="max-w-md mx-auto w-full">
        {/* Glass Card */}
        <div className="bg-white/40 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] border border-white/50 shadow-2xl shadow-indigo-500/10">
          
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-400 to-blue-500 shadow-lg shadow-teal-500/30 mb-6">
               <div className="w-6 h-6 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-800">
              Resilience.ai
            </h1>
            <p className="text-slate-500 font-medium">
              AI-enabled платформа для профилактики выгорания
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => onLogin(UserRole.EMPLOYEE)}
              className="group w-full flex items-center justify-between p-5 rounded-3xl bg-white/50 border border-white/60 hover:bg-white/80 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-600 shadow-sm group-hover:text-teal-600 transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="font-bold text-slate-900">Сотрудник</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Личный кабинет</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
            </button>

            <button
              onClick={() => onLogin(UserRole.HR)}
              className="group w-full flex items-center justify-between p-5 rounded-3xl bg-white/50 border border-white/60 hover:bg-white/80 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-600 shadow-sm group-hover:text-blue-600 transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="font-bold text-slate-900">HR / Бизнес</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Панель управления</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
            </button>
          </div>

          <div className="mt-8 rounded-2xl bg-white/35 border border-white/50 px-4 py-3 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              Portfolio prototype • все demo-данные синтетические
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;