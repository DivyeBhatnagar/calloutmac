"use client";

import { motion } from "framer-motion";
import { NeonButton } from "./ui/NeonButton";

const tournaments = [
    {
        title: "BGMI Pro League",
        game: "BGMI",
        prizePool: "₹50,000",
        slots: "64/100",
        time: "48:00:00",
    },
    {
        title: "Valorant Radiant Cup",
        game: "Valorant",
        prizePool: "₹25,000",
        slots: "16/32",
        time: "72:30:00",
    },
    {
        title: "Free Fire Clash Clashers",
        game: "Free Fire",
        prizePool: "₹10,000",
        slots: "48/48",
        time: "LIVE NOW",
        isLive: true,
    },
];

export function TournamentPreview() {
    return (
        <section className="py-24 bg-black relative border-t border-neon-green/20">
            <div className="absolute inset-0 z-0">
                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-neon-dark/5 blur-[100px] rounded-full pointer-events-none" />
            </div>

            <div className="container px-6 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white uppercase text-glow">
                            Upcoming <span className="text-neon-green">Battles</span>
                        </h2>
                    </div>
                    <NeonButton variant="outline">View All Tournaments</NeonButton>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {tournaments.map((tourney, i) => (
                        <motion.div
                            key={tourney.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            whileHover={{ y: -10 }}
                            className="bg-glass backdrop-blur-md border border-neon-green/30 p-6 flex flex-col justify-between transition-all duration-300 hover:border-neon-green hover:neon-shadow group"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-mono text-neon-green border border-neon-green py-1 px-2 uppercase tracking-wide">
                                        {tourney.game}
                                    </span>
                                    {tourney.isLive ? (
                                        <span className="text-xs font-mono bg-red-600 text-white font-bold py-1 px-3 uppercase animate-pulse">
                                            LIVE
                                        </span>
                                    ) : (
                                        <span className="text-xs font-mono text-gray-400 py-1 px-2 uppercase">
                                            Starts in: {tourney.time}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-2xl font-orbitron font-bold text-white uppercase mb-6 group-hover:text-neon-green transition-colors">
                                    {tourney.title}
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between border-b border-white/10 pb-2">
                                        <span className="text-gray-400 font-sans text-sm">Prize Pool</span>
                                        <span className="text-neon-green font-bold font-mono text-lg">{tourney.prizePool}</span>
                                    </div>
                                    <div className="flex justify-between pb-2">
                                        <span className="text-gray-400 font-sans text-sm">Slots Filled</span>
                                        <span className="text-white font-mono">{tourney.slots}</span>
                                    </div>
                                </div>
                            </div>

                            <NeonButton variant={tourney.isLive ? "solid" : "outline"} className="w-full">
                                {tourney.isLive ? "Watch Now" : "Register Now"}
                            </NeonButton>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
