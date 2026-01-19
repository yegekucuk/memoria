import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from '@/context/SessionContext';
import { Layout } from '@/components/Layout';

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
        <SessionProvider>
          <Layout>
            {children}
          </Layout>
        </SessionProvider>
      </body>
    </html>
  );
}
