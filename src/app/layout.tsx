import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from '@/context/SessionContext';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { Layout } from '@/components/Layout';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const codecPro = localFont({
  src: [
    {
      path: "../../public/fonts/CodecPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/CodecPro-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-codec-pro",
});

export const metadata: Metadata = {
  title: {
    default: "Memoria",
    template: "%s | Memoria",
  },
  description: "Memoria is a powerful time tracking application that helps you monitor your activities and analyze your productivity. Track sessions, view analytics and gain insights into how you spend your time.",
  keywords: ["time tracking", "productivity", "analytics", "session tracking", "time management", "activity tracker"],
  authors: [{ name: "yegekucuk" }],
  creator: "yegekucuk",
  publisher: "yegekucuk",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Memoria",
    description: "Powerful time tracking application to monitor your activities and boost productivity.",
    siteName: "Memoria",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memoria",
    description: "Powerful time tracking application to monitor your activities and boost productivity.",
    creator: "@yegekucuk",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/favicon.ico" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
      </head>
      <body className={`${inter.variable} ${codecPro.variable} font-sans antialiased`}>
        <AuthProvider>
          <SettingsProvider>
            <SessionProvider>
              <Layout>
                {children}
              </Layout>
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  className: '!bg-white dark:!bg-surface-dark !text-slate-900 dark:!text-white !border !border-slate-200 dark:!border-white/10 !shadow-lg',
                  style: {
                    borderRadius: '12px',
                  },
                }} 
              />
            </SessionProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
