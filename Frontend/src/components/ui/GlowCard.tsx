"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    glowOnHover?: boolean;
}

export function GlowCard({ children, className, glowOnHover = true, ...props }: GlowCardProps) {
    return (
        <motion.div
            className={cn(
                "relative bg-white/5 backdrop-blur-md border border-neon-green/30 p-8 rounded-lg transition-all duration-500 overflow-hidden",
                glowOnHover ? "hover:border-neon-green hover:neon-shadow" : "border-neon-green neon-shadow",
                className
            )}
            {...props}
        >
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
