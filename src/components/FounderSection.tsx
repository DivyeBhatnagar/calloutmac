"use client";

import { motion } from "framer-motion";
import { GlowCard } from "./ui/GlowCard";
import Image from "next/image";

export function FounderSection() {
    return (
        <section className="py-24 bg-black relative">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side: Founder Name */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col space-y-4"
                    >
                        <h2 className="text-5xl md:text-7xl font-orbitron font-black text-white uppercase text-glow leading-none">
                            Faizan Ali <br />
                            <span className="text-neon-green">Rahman</span>
                        </h2>
                        <div className="text-neon-dark text-xl md:text-2xl font-mono uppercase tracking-widest pl-1 mt-4 border-l-4 border-neon-green">
                            Founder & CEO
                        </div>
                    </motion.div>

                    {/* Right Side: Founder Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <GlowCard className="p-10 hover:-translate-y-2 transition-transform duration-500 will-change-transform">
                            {/* Optional neon ring placeholder for founder image */}
                            <div className="w-24 h-24 rounded-full border-2 border-neon-green/50 neon-shadow mb-8 flex items-center justify-center bg-black/50 overflow-hidden relative">
                                <div className="absolute inset-0 bg-neon-green/10 flex items-center justify-center font-orbitron font-bold text-2xl text-neon-green">
                                    FR
                                </div>
                            </div>

                            <div className="space-y-6 text-gray-300 font-sans leading-relaxed">
                                <p>
                                    Faizan Ali Rahman is the driving force behind Callout Esports, dedicated to building a strong and competitive esports ecosystem for India's youth. With experience in esports tournament management, campus-level events, and community building, he has successfully led multiple gaming championships and large offline events.
                                </p>
                                <p>
                                    His vision is to create a platform where gamers can compete regularly, grow their skills, and gain recognition in the professional esports space. Under his leadership, Callout Esports continues to expand as a trusted name in the gaming community.
                                </p>
                            </div>
                        </GlowCard>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
