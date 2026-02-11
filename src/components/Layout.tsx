'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2, LogIn, LogOut, Settings, Table, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { useState, useEffect, useRef } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const isActive = (path: string) => pathname?.startsWith(path);
  const isLandingPage = pathname === '/';

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent overscroll on iOS
      document.body.style.overscrollBehavior = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.overscrollBehavior = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.overscrollBehavior = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Touch handling for swipe to close
  const touchStart = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    // Only allow swipe to close if menu is open
    if (!isMobileMenuOpen) return;
    
    setIsDragging(true);
    touchStart.current = e.targetTouches[0].clientX;
    setCurrentTranslate(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || touchStart.current === null) return;
    
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStart.current;
    
    // Limits:
    // 1. Cannot be positive (moving right would detach from edge)
    // 2. Cannot be less than -width (though visible area limits this naturally)
    if (diff > 0) {
        setCurrentTranslate(0);
    } else {
        setCurrentTranslate(diff);
    }
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Logic: if dragged more than X% or pixel threshold, close it.
    // Width is w-72 (288px). Let's use 100px.
    if (currentTranslate < -100) {
        setIsMobileMenuOpen(false);
    }
    
    // Always reset translate because:
    // 1. If closed, component re-renders with closed state class
    // 2. If stays open, component re-renders with open state class
    setCurrentTranslate(0);
    touchStart.current = null;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      {!isLandingPage && (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside 
                className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 flex flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark overflow-y-auto lg:static lg:translate-x-0 ${
                    isDragging ? '' : 'transition-transform duration-300'
                } ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={isDragging ? { transform: `translateX(${currentTranslate}px)` } : undefined}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
        <div className="flex flex-col h-full p-4 justify-between">
            <div className="flex flex-col gap-6">
                {isAuthenticated && user && (
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 pb-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold truncate text-slate-900 dark:text-white" title={user.email}>{user.name || user.email}</p>
                    </div>
                )}
                {/* Navigation */}
                <nav className="lg:p-2 flex flex-col gap-2">
                    <Link 
                      href="/dashboard"
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors w-full text-left cursor-pointer ${
                        isActive('/dashboard')
                        ? 'bg-primary text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                        <LayoutDashboard size={24} />
                        <p className="text-sm font-medium leading-normal">Dashboard</p>
                    </Link>
                    <Link 
                      href="/analytics"
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors w-full text-left cursor-pointer ${
                        isActive('/analytics')
                        ? 'bg-primary text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                        <BarChart2 size={24} />
                        <p className="text-sm font-medium leading-normal">Analytics</p>
                    </Link>
                    <Link 
                      href="/sessions"
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors w-full text-left cursor-pointer ${
                        isActive('/sessions')
                        ? 'bg-primary text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                        <Table size={24} />
                        <p className="text-sm font-medium leading-normal">Sessions</p>
                    </Link>
                    <Link 
                      href="/settings"
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors w-full text-left cursor-pointer ${
                        isActive('/settings')
                        ? 'bg-primary text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                        <Settings size={24} />
                        <p className="text-sm font-medium leading-normal">Settings</p>
                    </Link>
                </nav>
            </div>

            <div className="lg:p-2 lg:mb-4">
               {isAuthenticated && user ? (
                 <div className="flex flex-col gap-2">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors w-full text-left cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                        <LogOut size={24} />
                        <p className="text-sm font-medium leading-normal">Logout</p>
                    </button>
                 </div>
               ) : (
                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors w-full text-left cursor-pointer text-primary hover:bg-primary/10"
                >
                    <LogIn size={24} />
                    <p className="text-sm font-medium leading-normal">Login / Register</p>
                </button>
               )}
            </div>
        </div>
      </aside>
      </>
      )}
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-full relative bg-background-light dark:bg-background-dark ${isMobileMenuOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {!isLandingPage && (
            <div className="lg:hidden sticky top-0 z-20 w-full">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 px-4 py-2 shadow-sm">
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Menu size={22} />
                    </button>
                    
                    <span className="font-bold text-slate-900 dark:text-white text-sm capitalize">
                        {pathname?.split('/').filter(Boolean).pop() || 'Dashboard'}
                    </span>

                    <div className="w-8 h-8 flex items-center justify-center">
                        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-xs">T</span>
                        </div>
                    </div>
                </div>
            </div>
          )}
          {children}
      </main>
    </div>
  );
};