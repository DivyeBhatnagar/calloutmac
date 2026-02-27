"use client";

import { motion } from "framer-motion";
import { NeonButton } from "./ui/NeonButton";

export function FinalCTA() {
    return (
        <section className="relative py-32 bg-black border-t border-neon-green/30 overflow-hidden flex items-center justify-center text-center">
            {/* Background glow radial */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[800px] bg-neon-green/20 blur-[150px] rounded-full mix-blend-screen opacity-60" />
            </div>

            <div className="container relative z-10 px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl mx-auto flex flex-col items-center"
                >
                    <h2 className="text-5xl md:text-7xl font-orbitron font-black text-white uppercase text-glow mb-8 leading-tight">
                        Ready To <br />
                        <span className="text-neon-green">Dominate?</span>
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl font-sans mb-12 max-w-xl">
                        Join thousands of players competing daily. Build your legacy, win rewards, and become a champion.
                    </p>

                    <NeonButton variant="solid" className="text-lg px-12 py-5 scale-110 shadow-[0_0_40px_rgba(0,255,102,0.8)]">
                        ENTER ARENA
                    </NeonButton>
                </motion.div>
            </div>

            {/* Grid Background Effect */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 255, 102, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 102, 0.2) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />
        </section>
    );
}
