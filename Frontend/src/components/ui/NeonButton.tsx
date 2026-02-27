"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: "solid" | "outline";
    className?: string;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
    ({ children, variant = "solid", className, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "relative inline-flex items-center justify-center px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 font-orbitron",
                    variant === "solid"
                        ? "bg-neon-green text-black neon-shadow hover:bg-white"
                        : "bg-black text-neon-green border border-neon-green hover:bg-neon-green/10 neon-shadow",
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

NeonButton.displayName = "NeonButton";
