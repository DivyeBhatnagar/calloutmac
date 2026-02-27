"use client";

import Image from "next/image";

export function Footer() {
    return (
        <footer className="bg-black py-12 border-t border-neon-green/10 text-center relative z-10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center justify-center gap-3 mb-6">
                    <Image src="/logo.png" alt="CallOut Esports Logo" width={60} height={60} className="object-contain" />
                    <div className="text-2xl font-black font-orbitron tracking-widest text-white">
                        CALL<span className="text-neon-green">OUT</span> ESPORTS
                    </div>
                </div>
                <p className="text-gray-500 font-sans text-sm mb-8 max-w-md mx-auto">
                    India's most competitive battleground. Join the elite. Build your legacy.
                </p>
                <div className="flex justify-center gap-6 mb-12">
                    <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-neon-green hover:border-neon-green transition-all">TW</a>
                    <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-neon-green hover:border-neon-green transition-all">IG</a>
                    <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-neon-green hover:border-neon-green transition-all">YT</a>
                    <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-neon-green hover:border-neon-green transition-all">DC</a>
                </div>
                <div className="text-gray-600 font-mono text-xs uppercase tracking-widest border-t border-white/5 pt-8">
                    © {new Date().getFullYear()} CallOut Esports. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
