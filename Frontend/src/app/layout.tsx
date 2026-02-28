import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CALLOUT ESPORTS",
  description: "India's Most Competitive Esports Battleground",
};

import { Header } from "@/components/Header";
import { FooterWrapper } from "@/components/FooterWrapper";
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${inter.variable} font-sans antialiased text-white bg-black overflow-x-hidden`}
      >
        <AuthProvider>
          <Header />
          <main className="min-h-screen pt-20 bg-black text-white font-sans selection:bg-neon-green/30 selection:text-neon-green">
            {children}
          </main>
          <FooterWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
