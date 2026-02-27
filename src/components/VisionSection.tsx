"use client";

import { motion } from "framer-motion";
import { GlowCard } from "./ui/GlowCard";

export function VisionSection() {
    return (
        <section className="py-32 bg-black relative flex items-center justify-center">
            {/* Subtle Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[300px] bg-neon-green/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />
            </div>

            <div className="container relative z-10 px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto"
                >
                    <GlowCard className="p-12 md:p-20 text-center md:text-left border-l-4 border-l-neon-green border-t-0 border-r-0 border-b-0 rounded-none bg-black/60 shadow-[0_0_40px_rgba(0,255,102,0.15)]">
                        <h2 className="text-3xl md:text-5xl font-orbitron font-bold text-white uppercase mb-8 tracking-widest text-glow">
                            Our <span className="text-neon-green">Vision</span>
                        </h2>
                        <p className="text-xl md:text-3xl text-gray-300 font-sans font-light leading-relaxed">
                            "To create a competitive esports ecosystem in India where every gamer has access to structured tournaments, transparent systems, and a fair opportunity to grow."
                        </p>
                    </GlowCard>
                </motion.div>
            </div>
        </section>
    );
}
