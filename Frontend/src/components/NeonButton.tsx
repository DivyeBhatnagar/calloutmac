"use client";

import { HTMLMotionProps, motion } from 'framer-motion';

interface NeonButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'outline' | 'danger';
    fullWidth?: boolean;
}

export default function NeonButton({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}: NeonButtonProps) {

    const baseStyles = "relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold tracking-wider uppercase transition-all duration-300 rounded-lg overflow-hidden";
    const wClass = fullWidth ? "w-full" : "";

    const variants = {
        primary: "text-black bg-neon-green hover:bg-[#00cc55] shadow-[0_0_15px_rgba(0,255,102,0.4)] hover:shadow-[0_0_25px_rgba(0,255,102,0.6)]",
        outline: "text-neon-green border border-neon-green hover:bg-neon-green/10 shadow-[inset_0_0_10px_rgba(0,255,102,0.2)]",
        danger: "text-red-500 border border-red-500 hover:bg-red-500/10 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:text-red-400"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${wClass} ${variants[variant]} ${className}`}
            {...props}
        >
            <span className="relative z-10 font-orbitron">{children as React.ReactNode}</span>
        </motion.button>
    );
}
