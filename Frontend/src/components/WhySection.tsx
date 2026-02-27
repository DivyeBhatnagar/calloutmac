"use client";

import { motion } from "framer-motion";
import { RiSwordFill, RiShieldFlashFill, RiTrophyFill } from "react-icons/ri";
import { ReactNode } from "react";

interface CardProps {
    icon: ReactNode;
    title: string;
    description: string;
    delay: number;
}

function AntigravityCard({ icon, title, description, delay }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay, duration: 0.6 }}
            whileHover={{ y: -15, scale: 1.02 }}
            className="group relative bg-glass backdrop-blur-md border border-neon-green/30 p-8 flex flex-col items-center text-center transition-all duration-500 hover:border-neon-green hover:neon-shadow overflow-hidden"
            style={{
                transformStyle: "preserve-3d",
                perspective: "1000px"
            }}
        >
            {/* Background Subtle Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon Container */}
            <div className="relative mb-6 text-neon-green text-5xl group-hover:scale-110 transition-transform duration-500 group-hover:text-glow">
                {icon}
            </div>

            <h3 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-wider group-hover:text-neon-green transition-colors">
                {title}
            </h3>
            <p className="text-gray-400 font-sans text-sm">
                {description}
            </p>

            {/* Decorative Corner Touches */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-green/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-green/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-green/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-green/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
}

export function WhySection() {
    return (
        <section className="py-24 bg-black relative">
            <div className="container px-6 mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-3 py-1 mb-4 rounded-full border border-neon-green/30 bg-neon-green/10 text-neon-green font-mono text-xs uppercase tracking-widest"
                    >
                        Why Choose Us
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-orbitron font-bold text-white uppercase"
                    >
                        Built For <span className="text-neon-green">Champions</span>
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <AntigravityCard
                        icon={<RiSwordFill />}
                        title="Competitive Tournaments"
                        description="High-stakes daily and weekly tournaments for all skill levels. Prove your worth in the arena."
                        delay={0.1}
                    />
                    <AntigravityCard
                        icon={<RiShieldFlashFill />}
                        title="Fair Play Enforcement"
                        description="Strict anti-cheat policies and dedicated 24/7 admin moderation to ensure a level playing field."
                        delay={0.2}
                    />
                    <AntigravityCard
                        icon={<RiTrophyFill />}
                        title="Instant Rewards"
                        description="Guaranteed prize payouts directly to your account right after the tournament concludes."
                        delay={0.3}
                    />
                </div>
            </div>
        </section>
    );
}
