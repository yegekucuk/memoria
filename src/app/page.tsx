"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { DashboardPreview } from "@/components/previews/DashboardPreview";
import { Navbar } from "@/components/landingpage/Navbar";
import { Hero } from "@/components/landingpage/Hero";
import { Features } from "@/components/landingpage/Features";
import { PageGateSkeleton } from "@/components/loading/PageGateSkeleton";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.refresh();
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <PageGateSkeleton />;
  }

  // Prevent flash of content if authenticated but waiting for redirect
  if (isAuthenticated) {
    return null;
  }

  return (
    <main>
      {/* Navbar */}
      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
      <div className="flex flex-col w-full bg-mesh min-h-screen">
        {/* Hero Section */}
        <div id="home" className="w-full pt-10 pb-0 md:pt-20 md:pb-10">
          <Hero onRegisterClick={() => setIsAuthModalOpen(true)} />
        </div>

        {/* Dashboard Preview Section */}
        <div id="preview" className="w-full hidden lg:flex justify-center px-4 relative z-10 py-24">
          <div className="w-full max-w-7xl transform transition-transform duration-500 hover:scale-[1.01]">
            <DashboardPreview />
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-transparent relative z-10 py-24">
          <Features />
        </div>

        {/* Footer */}
        <footer className="py-12 bg-white/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-white/10 relative z-10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="font-bold text-lg mb-2">Memoria</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                © {new Date().getFullYear()} @yegekucuk. All rights reserved.
              </p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm">Contact</a>
            </div>
          </div>
        </footer>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </main>
  );
}
