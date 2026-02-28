"use client";

import { motion } from "framer-motion";
import { NeonButton } from "./ui/NeonButton";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Particles & Glows */}
            <div className="absolute inset-0 z-0 bg-black">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />
            </div>

            <div className="container relative z-10 px-6 mx-auto grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-start gap-6"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="px-4 py-1.5 rounded-full border border-neon-green/30 bg-neon-green/10 text-neon-green font-mono text-xs uppercase tracking-widest"
                    >
                        Welcome to the Next Level
                    </motion.div>

                    <h1 className="text-6xl lg:text-8xl font-black font-orbitron uppercase text-white leading-none tracking-tighter text-glow">
                        CALLOUT <br />
                        <span className="text-neon-green">ESPORTS</span>
                    </h1>

                    <p className="text-gray-400 text-lg lg:text-xl font-sans max-w-lg mb-4">
                        India's Most Competitive Esports Battleground. Join elite tournaments, build your squad, and dominate the leaderboard.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/register">
                            <NeonButton variant="solid">Join Tournament</NeonButton>
                        </Link>
                        <Link href="/dashboard/tournaments">
                            <NeonButton variant="outline">Explore Games</NeonButton>
                        </Link>
                    </div>
                </motion.div>

                {/* Right Content - Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="relative hidden lg:flex items-center justify-center p-8"
                >
                    <div className="absolute inset-0 bg-neon-green/10 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
                    <img
                        src="/logo.png"
                        alt="Callout Esports"
                        className="relative z-10 w-full max-w-[400px] object-contain drop-shadow-[0_0_30px_rgba(0,255,102,0.4)] transition-transform duration-700 hover:scale-105"
                    />
                </motion.div>
            </div>
        </section>
    );
}
