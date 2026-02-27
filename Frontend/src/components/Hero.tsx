"use client";

import { motion } from "framer-motion";
import { NeonButton } from "./ui/NeonButton";

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
                        Enter The <br />
                        <span className="text-neon-green">Arena</span>
                    </h1>

                    <p className="text-gray-400 text-lg lg:text-xl font-sans max-w-lg mb-4">
                        India's Most Competitive Esports Battleground. Join elite tournaments, build your squad, and dominate the leaderboard.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <NeonButton variant="solid">Join Tournament</NeonButton>
                        <NeonButton variant="outline">Explore Games</NeonButton>
                    </div>
                </motion.div>

                {/* Right Content - 3D Levitation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="relative h-[500px] flex items-center justify-center perspective-1000 hidden lg:flex"
                >
                    {/* Animated rings */}
                    <motion.div
                        animate={{ rotateZ: 360, rotateX: 360, rotateY: 180 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute w-80 h-80 rounded-full border border-neon-green/40 border-dashed"
                        style={{ transformStyle: "preserve-3d" }}
                    />
                    <motion.div
                        animate={{ rotateZ: -360, rotateX: -180, rotateY: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute w-96 h-96 rounded-full border border-neon-dark/30 border-dashed"
                        style={{ transformStyle: "preserve-3d" }}
                    />

                    {/* Central floating cube/element */}
                    <motion.div
                        animate={{
                            y: [-15, 15, -15],
                            rotateX: [0, 10, 0],
                            rotateY: [0, -10, 0]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative w-48 h-48 bg-glass backdrop-blur-md border border-neon-green/50 flex items-center justify-center rotate-45 neon-shadow"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <div className="absolute inset-2 border border-neon-green/30" />
                        <div className="absolute inset-6 border border-neon-green/20" />
                        <div className="w-16 h-16 bg-neon-green blur-xl rounded-full absolute" />
                        <div className="-rotate-45 relative z-10 text-neon-green font-orbitron font-bold text-2xl">
                            CALLOUT
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
