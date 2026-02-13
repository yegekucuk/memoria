"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

interface NavbarProps {
  onAuthClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-slate-900 shadow-md border-b border-slate-200 dark:border-white/10"
          : "bg-white/90 dark:bg-slate-900/90 border-b border-white/10"
      }`}
    >
      <div className="w-full max-w-7xl flex items-center justify-between px-6 md:px-8 py-2 md:py-3">
        {/* Logo */}
        <Image
          src="/memoria-logo-3-removebg.png"
          alt="Memoria Logo"
          width={120}
          height={32}
          className="h-8 w-auto p-0.5"
          priority
        />

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#home"
            onClick={(e) => scrollToSection(e, "home")}
            className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-semibold text-xs tracking-wide uppercase"
          >
            Home
          </a>
          <a
            href="#preview"
            onClick={(e) => scrollToSection(e, "preview")}
            className="hidden lg:inline text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-semibold text-xs tracking-wide uppercase"
          >
            Preview
          </a>
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, "features")}
            className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-semibold text-xs tracking-wide uppercase"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, "how-it-works")}
            className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-semibold text-xs tracking-wide uppercase"
          >
            How It Works
          </a>
          <button
            onClick={onAuthClick}
            className="group relative flex items-center gap-2 px-5 py-1.5 bg-primary dark:bg-white text-white dark:text-[#0F172A] rounded-lg font-bold hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span className="text-sm">Get Started</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-slate-900 dark:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 p-2 md:hidden"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-4 flex flex-col gap-4">
                <a
                  href="#home"
                  onClick={(e) => scrollToSection(e, "home")}
                  className="text-base font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 pb-2"
                >
                  Home
                </a>
                <a
                  href="#features"
                  onClick={(e) => scrollToSection(e, "features")}
                  className="text-base font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 pb-2"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={(e) => scrollToSection(e, "how-it-works")}
                  className="text-base font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 pb-2"
                >
                  How It Works
                </a>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onAuthClick();
                  }}
                  className="w-full py-3 bg-primary text-white rounded-lg font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
