import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, BarChart2, Tag, Sun, Moon, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView,
}) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      <aside className="w-20 lg:w-72 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark transition-all duration-300 z-20">
        <div className="flex flex-col h-full p-4 justify-between">
            <div className="flex flex-col gap-8">
                {/* Navigation */}
                <nav className="lg:p-2 flex flex-col gap-2">
                    <button 
                      onClick={() => onChangeView(ViewState.DASHBOARD)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors w-full text-left ${
                        currentView === ViewState.DASHBOARD 
                        ? 'bg-primary text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                        <LayoutDashboard size={24} />
                        <p className="hidden lg:block text-sm font-medium leading-normal">Dashboard</p>
                    </button>
                    <button 
                      onClick={() => onChangeView(ViewState.ANALYTICS)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors w-full text-left ${
                        currentView === ViewState.ANALYTICS 
                        ? 'bg-primary text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                        <BarChart2 size={24} />
                        <p className="hidden lg:block text-sm font-medium leading-normal">Reports</p>
                    </button>
                    <button 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full text-left"
                    >
                        <Tag size={24} />
                        <p className="hidden lg:block text-sm font-medium leading-normal">Tags</p>
                    </button>

                </nav>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative bg-background-light dark:bg-background-dark">
          {children}
      </main>
    </div>
  );
};