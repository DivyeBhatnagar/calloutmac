"use client";

import { motion } from "framer-motion";

const steps = [
    {
        num: "01",
        title: "Register",
        desc: "Create your free CallOut account and set up your gamer profile.",
    },
    {
        num: "02",
        title: "Build Squad",
        desc: "Invite your friends or find teammates in our global matchmaking pool.",
    },
    {
        num: "03",
        title: "Compete",
        desc: "Join daily tournaments, climb the leaderboards, and prove your skills.",
    },
    {
        num: "04",
        title: "Win & Dominate",
        desc: "Earn cash prizes, exclusive badges, and ultimate bragging rights.",
    },
];

export function HowItWorks() {
    return (
        <section className="py-24 bg-black relative">
            <div className="container px-6 mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-orbitron font-bold text-white uppercase text-glow"
                    >
                        How It <span className="text-neon-green">Works</span>
                    </motion.h2>
                </div>

                <div className="max-w-4xl mx-auto relative">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-neon-green/20 -translate-x-1/2" />

                    <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute left-[39px] md:left-1/2 top-0 w-px bg-neon-green -translate-x-1/2 neon-shadow"
                    />

                    <div className="space-y-12">
                        {steps.map((step, i) => (
                            <div key={step.num} className={`relative flex flex-col md:flex-row items-center ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>

                                {/* Center Node Badge */}
                                <div className="absolute left-[39px] md:left-1/2 -translate-x-1/2 w-14 h-14 bg-black border-2 border-neon-green rounded-full flex items-center justify-center z-10 neon-shadow">
                                    <span className="text-neon-green font-orbitron font-bold">{step.num}</span>
                                </div>

                                {/* Content Box */}
                                <motion.div
                                    initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2, duration: 0.5 }}
                                    className={`ml-20 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pl-16 text-left" : "md:pr-16 md:text-right"}`}
                                >
                                    <div className="bg-glass backdrop-blur-sm border border-neon-green/30 p-8 hover:border-neon-green transition-colors duration-300 relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-neon-green/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                        <h3 className="text-2xl font-orbitron font-bold text-white mb-3 uppercase relative z-10 group-hover:text-neon-green transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-400 font-sans relative z-10">
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
