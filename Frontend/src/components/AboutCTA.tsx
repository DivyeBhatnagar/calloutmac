"use client";

import { motion } from "framer-motion";
import { NeonButton } from "./ui/NeonButton";

export function AboutCTA() {
    return (
        <section className="relative py-32 bg-black overflow-hidden flex items-center justify-center text-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[400px] bg-neon-dark/20 blur-[150px] rounded-full mix-blend-screen opacity-60" />
            </div>

            <div className="container relative z-10 px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    <h2 className="text-5xl md:text-7xl font-orbitron font-black text-white uppercase text-glow mb-12 leading-tight">
                        Ready To Join <br />
                        <span className="text-neon-green">The Arena?</span>
                    </h2>

                    <NeonButton variant="solid" className="text-xl px-14 py-6 shadow-[0_0_50px_rgba(0,255,102,0.6)] hover:shadow-[0_0_80px_rgba(0,255,102,1)] hover:scale-110 transition-all duration-300">
                        ENTER TOURNAMENTS
                    </NeonButton>
                </motion.div>
            </div>
        </section>
    );
}
