"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const increment = value / (duration * 60);

            const timer = setInterval(() => {
                start += increment;
                if (start >= value) {
                    setCount(value);
                    clearInterval(timer);
                } else {
                    setCount(Math.ceil(start));
                }
            }, 1000 / 60);

            return () => clearInterval(timer);
        }
    }, [value, duration, isInView]);

    return <span ref={ref}>{count}</span>;
}

export function StatsSection() {
    return (
        <section className="py-20 bg-black relative border-y border-neon-green/20">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto divide-y md:divide-y-0 md:divide-x divide-neon-green/20">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="flex flex-col items-center justify-center p-6 group transition-all"
                    >
                        <div className="text-5xl font-black font-orbitron text-white group-hover:text-glow transition-all duration-300 relative">
                            <AnimatedCounter value={1000} duration={1.5} />+
                            <div className="h-1 w-0 group-hover:w-full bg-neon-green mt-2 transition-all duration-300 mx-auto neon-shadow" />
                        </div>
                        <div className="text-neon-green font-mono uppercase tracking-widest mt-4">
                            Active Players
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -5 }}
                        className="flex flex-col items-center justify-center p-6 group transition-all"
                    >
                        <div className="text-5xl font-black font-orbitron text-white group-hover:text-glow transition-all duration-300 relative">
                            ₹<AnimatedCounter value={10} duration={1.5} />K+
                            <div className="h-1 w-0 group-hover:w-full bg-neon-green mt-2 transition-all duration-300 mx-auto neon-shadow" />
                        </div>
                        <div className="text-neon-green font-mono uppercase tracking-widest mt-4">
                            Prize Pool
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -5 }}
                        className="flex flex-col items-center justify-center p-6 group transition-all"
                    >
                        <div className="text-5xl font-black font-orbitron text-white group-hover:text-glow transition-all duration-300 relative">
                            <AnimatedCounter value={20} duration={1.5} />+
                            <div className="h-1 w-0 group-hover:w-full bg-neon-green mt-2 transition-all duration-300 mx-auto neon-shadow" />
                        </div>
                        <div className="text-neon-green font-mono uppercase tracking-widest mt-4">
                            Monthly Matches
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
