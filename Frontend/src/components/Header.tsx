"use client";

import Link from "next/link";
import Image from "next/image";

export function Header() {
    return (
        <header className="fixed top-0 w-full border-b border-neon-green/20 bg-black/80 backdrop-blur-md z-50">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="CallOut Esports Logo" width={40} height={40} className="object-contain" />
                    <div className="text-2xl font-black font-orbitron tracking-widest text-white">
                        CALL<span className="text-neon-green">OUT</span>
                    </div>
                </Link>
                <nav className="hidden md:flex items-center gap-8 font-mono text-sm uppercase tracking-wider text-gray-400">
                    <Link href="/about" className="hover:text-neon-green transition-colors">About</Link>
                    <a href="#" className="hover:text-neon-green transition-colors">Tournaments</a>
                    <a href="#" className="hover:text-neon-green transition-colors">Games</a>
                    <a href="#" className="hover:text-neon-green transition-colors">Leaderboard</a>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden md:block text-sm font-mono text-white hover:text-neon-green px-4 py-2 transition-colors">
                        LOG IN
                    </Link>
                    <Link href="/register" className="border border-neon-green text-neon-green text-sm font-mono px-6 py-2 hover:bg-neon-green hover:text-black transition-all neon-shadow text-center">
                        SIGN UP
                    </Link>
                </div>
            </div>
        </header>
    );
}
