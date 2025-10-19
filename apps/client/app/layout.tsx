import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from 'react';
import StoreProvider from '@/lib/redux/StoreProvider';
import Sidebar from '@/lib/components/Sidebar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eloquent AI task",
  description: "FAQ Chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <StoreProvider>
          <Sidebar />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
