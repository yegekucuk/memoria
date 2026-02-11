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
  title: "howmanyhours?",
  description: "How many hours did you really work?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
