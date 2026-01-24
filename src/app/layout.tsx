import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from '@/context/SessionContext';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
