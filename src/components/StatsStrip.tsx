"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

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

export function StatsStrip() {
    const stats = [
        { label: "Active Players", value: 1000, suffix: "+" },
        { label: "Prize Distributed", value: 10, prefix: "₹", suffix: "K+" },
        { label: "Tournaments Hosted", value: 10, suffix: "+" },
        { label: "Admin Moderation", value: 24, suffix: "/7" },
    ];

    return (
        <section className="relative py-12 border-t border-b border-neon-green/20 bg-black overflow-hidden backdrop-blur-md">
            {/* Background Glows */}
            <div className="absolute inset-0 z-0">
                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-neon-green/10 blur-[80px]" />
                <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-neon-dark/10 blur-[80px]" />
            </div>

            <div className="container relative z-10 px-6 mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-neon-green/20">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="flex flex-col items-center justify-center text-center px-4"
                        >
                            <div className="text-4xl lg:text-5xl font-orbitron font-bold text-white mb-2 text-glow transition-all duration-300">
                                {stat.prefix}
                                {stat.value > 0 && typeof stat.value === "number" && stat.suffix !== "/7" ? (
                                    <AnimatedCounter value={stat.value} duration={1.5} />
                                ) : (
                                    stat.value
                                )}
                                {stat.suffix}
                            </div>
                            <div className="text-neon-green font-sans text-sm tracking-widest uppercase opacity-80">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
