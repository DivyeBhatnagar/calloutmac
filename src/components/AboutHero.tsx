"use client";

import { motion } from "framer-motion";

export function AboutHero() {
    return (
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-neon-green/20">
            {/* Subtle particle / grid background */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 255, 102, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 102, 0.15) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/10 blur-[130px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="container relative z-10 px-6 mx-auto text-center flex flex-col items-center"
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100px" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-1 bg-neon-green neon-shadow mb-8"
                />

                <h1 className="text-5xl md:text-8xl font-black font-orbitron uppercase text-white tracking-widest text-glow mb-6 relative">
                    CALLOUT <span className="text-neon-green">ESPORTS</span>
                    {/* Subtle pulse under title */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-neon-green/30 blur-xl animate-pulse" />
                </h1>

                <h2 className="text-xl md:text-3xl font-sans text-gray-300 font-light mb-8 max-w-3xl">
                    Building India's <span className="text-neon-green font-bold text-glow">Competitive Esports</span> Future
                </h2>

                <p className="text-gray-400 text-base md:text-lg font-sans max-w-2xl leading-relaxed">
                    Callout Esports is a competitive gaming platform focused on empowering Indian gamers through structured tournaments, fair play, and community-driven esports experiences.
                </p>
            </motion.div>
        </section>
    );
}
