"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { FeaturesSection } from "@/components/FeaturesSection";
import { DashboardPreview } from "@/components/previews/DashboardPreview";
import { Navbar } from "@/components/landingpage/Navbar";
import { Hero } from "@/components/landingpage/Hero";
import { Loader2 } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background-light dark:bg-background-dark">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flash of content if authenticated but waiting for redirect
  if (isAuthenticated) {
    return null;
  }

  return (
    <main>
      {/* Navbar */}
      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
      <div className="flex flex-col w-full bg-mesh gap-y-20 min-h-screen">
        {/* Hero Section */}
        <Hero onRegisterClick={() => setIsAuthModalOpen(true)} />

        {/* Dashboard Preview Section */}
        <div className="w-full hidden xl:flex justify-center px-4 relative z-10">
          <div className="w-full max-w-7xl transform transition-transform duration-500 hover:scale-[1.01]">
            <DashboardPreview />
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-transparent relative z-10">
          <FeaturesSection />
        </div>

        {/* Footer */}
        <footer className="py-2 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/10 relative z-10">
          <p>© 2026 @yegekucuk. All rights reserved.</p>
        </footer>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </main>
  );
}
