"use client";

import { motion } from "framer-motion";
import { NeonButton } from "./ui/NeonButton";

interface GameProps {
    name: string;
    image: string;
    delay: number;
}

const games: GameProps[] = [
    { name: "BGMI", image: "/games/BGMI.webp", delay: 0 },
    { name: "Valorant", image: "/games/VALORANT.jpg", delay: 0.1 },
    { name: "Free Fire", image: "/games/FREEFIREMAX.jpg", delay: 0.2 },
    { name: "COD Mobile", image: "/games/COD.webp", delay: 0.3 },
];

export function FeaturedGames() {
    return (
        <section className="py-24 bg-black relative border-t border-neon-green/10">
            <div className="container px-6 mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white uppercase text-glow">
                            Featured <span className="text-neon-green">Games</span>
                        </h2>
                        <p className="text-gray-400 font-sans mt-4 max-w-lg">
                            Compete in the most popular esports titles. New tournaments added daily.
                        </p>
                    </div>
                    <NeonButton variant="outline" className="hidden md:flex">
                        View All Games
                    </NeonButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {games.map((game, i) => (
                        <motion.div
                            key={game.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: game.delay, duration: 0.5 }}
                            className="group relative h-[400px] overflow-hidden bg-zinc-900 border border-neon-green/20"
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                                style={{ backgroundImage: `url(${game.image})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                            <div className="absolute inset-0 p-6 flex flex-col justify-end transition-transform duration-300">
                                <h3 className="text-2xl font-orbitron font-bold text-white uppercase mb-4 tracking-wider group-hover:text-neon-green transition-colors">
                                    {game.name}
                                </h3>

                                <div className="translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <NeonButton variant="solid" className="w-full text-xs py-2 h-auto">
                                        Compete Now
                                    </NeonButton>
                                </div>
                            </div>

                            {/* Hover Borders Animated */}
                            <div className="absolute inset-0 border-2 border-neon-green opacity-0 group-hover:opacity-100 group-hover:neon-shadow transition-all duration-300 pointer-events-none scale-105 group-hover:scale-100" />
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center md:hidden">
                    <NeonButton variant="outline">View All Games</NeonButton>
                </div>
            </div>
        </section>
    );
}
