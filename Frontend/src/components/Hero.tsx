"use client";

import { motion } from "framer-motion";
import { NeonButton } from "./ui/NeonButton";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-24 pb-12 bg-black">
            {/* Background Particles, Beam & Scanlines */}
            <div className="absolute inset-0 z-0">
                {/* Center Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/10 blur-[150px] rounded-full mix-blend-screen opacity-50" />

                {/* Radial gradient beam extending across */}
                <div className="absolute top-1/2 left-0 w-full h-[300px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-green/5 via-transparent to-transparent blur-3xl pointer-events-none" />

                {/* Subtle Dust Particles */}
                {Array.from({ length: 25 }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -120],
                            x: (i % 5 - 2) * 30,
                            opacity: [0, 0.4, 0]
                        }}
                        transition={{
                            duration: (i % 4) + 6,
                            repeat: Infinity,
                            delay: (i % 7),
                            ease: "linear"
                        }}
                        className="absolute w-[2px] h-[2px] bg-neon-green/40 rounded-full"
                        style={{
                            left: `${(i * 17) % 100}%`,
                            top: `${(i * 23) % 100}%`
                        }}
                    />
                ))}

                {/* Ultra faint scanlines */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, #00FF66 2px, #00FF66 4px)' }} />
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
                        className="px-4 py-1.5 rounded-full border border-neon-green/30 bg-neon-green/10 text-neon-green font-mono text-xs uppercase tracking-widest backdrop-blur-sm"
                    >
                        Welcome to the Next Level
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl lg:text-8xl font-black font-orbitron uppercase text-white leading-none tracking-tighter text-glow drop-shadow-lg text-center lg:text-left mt-4 lg:mt-0">
                        CALLOUT <br />
                        <span className="text-neon-green">ESPORTS</span>
                    </h1>

                    <p className="text-gray-400 text-base md:text-lg lg:text-xl font-sans max-w-lg mb-4 drop-shadow-md text-center lg:text-left">
                        India's Most Competitive Esports Battleground. Join elite tournaments, build your squad, and dominate the leaderboard.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto">
                        <Link href="/register" className="w-full sm:w-auto">
                            <NeonButton variant="solid" className="w-full">Join Tournament</NeonButton>
                        </Link>
                        <Link href="/dashboard/tournaments" className="w-full sm:w-auto">
                            <NeonButton variant="outline" className="w-full">Explore Games</NeonButton>
                        </Link>
                    </div>
                </motion.div>

                {/* Right Content - Cinematic Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="relative flex items-center justify-center p-8 w-full h-[300px] md:h-[400px] lg:h-[500px]"
                >
                    {/* Slow Pulse Glow */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute w-[350px] h-[350px] bg-neon-green/20 blur-[80px] rounded-full mix-blend-screen"
                    />

                    {/* Rotating Neon Rings */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[380px] h-[380px] border border-neon-green/20 border-dashed rounded-full pointer-events-none"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[440px] h-[440px] border border-neon-dark/30 border-dotted rounded-full pointer-events-none opacity-50"
                    />

                    {/* Levitating Logo */}
                    <motion.div
                        animate={{
                            y: [-12, 12, -12]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative z-10 w-full max-w-[400px] flex justify-center items-center"
                    >
                        <img
                            src="/logo.png"
                            alt="Callout Esports"
                            className="w-full h-auto object-contain drop-shadow-[0_0_25px_rgba(0,255,102,0.5)] transition-transform duration-700 hover:scale-105"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
