"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    onClick?: () => void;
}

export default function GlowCard({ children, className = '', delay = 0, onClick }: GlowCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`relative group ${className}`}
            onClick={onClick}
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-green/0 via-neon-green/30 to-neon-green/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-colors duration-300">
                {children}
            </div>
        </motion.div>
    );
}
