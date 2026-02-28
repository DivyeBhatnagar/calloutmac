"use client";

import { useAuth } from '@/lib/auth-context';
import { RiMenu3Fill, RiNotification3Fill } from 'react-icons/ri';

export default function TopNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user } = useAuth();

    return (
        <header className="h-20 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
            <div className="flex items-center gap-4 lg:hidden">
                <button onClick={onMenuClick} className="text-gray-400 hover:text-neon-green transition-colors">
                    <RiMenu3Fill className="text-2xl" />
                </button>
            </div>

            <div className="hidden lg:block">
                <h2 className="text-xl font-bold text-white/90">
                    Welcome back, <span className="text-neon-green glow-text drop-shadow-[0_0_8px_rgba(0,255,102,0.5)]">{user?.username}</span>
                </h2>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-gray-400 hover:text-neon-green transition-colors">
                    <RiNotification3Fill className="text-2xl" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-neon-green rounded-full shadow-[0_0_5px_rgba(0,255,102,0.8)]"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-bold text-white">{user?.username}</span>
                        <span className="text-xs text-gray-400">{user?.role === 'ADMIN' ? 'Administrator' : 'Player'}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-neon-green/50 bg-white/5 flex items-center justify-center overflow-hidden">
                        <span className="font-orbitron font-bold text-neon-green">{user?.username?.[0]?.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
