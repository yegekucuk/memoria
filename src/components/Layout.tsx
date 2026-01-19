'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      <aside className="w-20 lg:w-72 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark transition-all duration-300 z-20">
        <div className="flex flex-col h-full p-4 justify-between">
            <div className="flex flex-col gap-8">
                {/* Navigation */}
                <nav className="lg:p-2 flex flex-col gap-2">
                    <Link 
                      href="/dashboard"
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors w-full text-left ${
                        isActive('/dashboard')
                        ? 'bg-primary text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                        <LayoutDashboard size={24} />
                        <p className="hidden lg:block text-sm font-medium leading-normal">Dashboard</p>
                    </Link>
                    <Link 
                      href="/reports"
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors w-full text-left ${
                        isActive('/reports')
                        ? 'bg-primary text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                        <BarChart2 size={24} />
                        <p className="hidden lg:block text-sm font-medium leading-normal">Reports</p>
                    </Link>
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