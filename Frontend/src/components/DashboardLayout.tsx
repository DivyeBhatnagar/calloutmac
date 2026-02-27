"use client";

import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-black overflow-hidden selection:bg-neon-green/30 selection:text-neon-green">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-green/5 blur-[120px] rounded-full mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <Sidebar />

            <div className="flex-1 flex flex-col relative z-10 w-full">
                <TopNavbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
