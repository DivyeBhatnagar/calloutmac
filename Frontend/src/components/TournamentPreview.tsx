"use client";

import { motion } from "framer-motion";
import { NeonButton } from "./ui/NeonButton";
import { useRealtimeCollection } from "@/hooks/useRealtimeCollection";
import { where, orderBy, limit } from "firebase/firestore";
import { Tournament } from "@/types";
import Link from "next/link";
import { useState, useEffect } from "react";

export function TournamentPreview() {
    const { data: allTournaments, loading } = useRealtimeCollection<Tournament>("tournaments", [
        where("status", "==", "active")
    ]);

    const [tournaments, setTournaments] = useState<Tournament[]>([]);

    useEffect(() => {
        if (allTournaments) {
            // Sort by createdAt desc locally (to avoid complex index requirements) and take top 3
            const sorted = [...allTournaments].sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
            setTournaments(sorted.slice(0, 3));
        }
    }, [allTournaments]);

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
                    <Link href="/tournaments">
                        <NeonButton variant="outline">View All Tournaments</NeonButton>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse bg-white/5 border border-white/10 h-64 rounded-xl"></div>
                        ))}
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="text-center py-12 border border-neon-green/10 rounded-xl bg-neon-green/5 backdrop-blur-sm">
                        <p className="text-gray-400 font-mono">NO ACTIVE TOURNAMENTS AVAILABLE AT THE MOMENT</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {tournaments.map((tourney, i) => (
                            <motion.div
                                key={tourney.id}
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
                                            {tourney.games?.[0]?.name || "ESPORTS"}
                                        </span>
                                        <span className="text-xs font-mono bg-red-600 text-white font-bold py-1 px-3 uppercase animate-pulse">
                                            LIVE NOW
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-orbitron font-bold text-white uppercase mb-6 group-hover:text-neon-green transition-colors">
                                        {tourney.name}
                                    </h3>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-gray-400 font-sans text-sm">Prize Pool</span>
                                            <span className="text-neon-green font-bold font-mono text-lg">
                                                ₹{tourney.paymentAmount || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pb-2">
                                            <span className="text-gray-400 font-sans text-sm">Slots Filled</span>
                                            <span className="text-white font-mono">
                                                {tourney.currentRegistrations || 0}/{tourney.maxSlots || "∞"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/tournaments`}>
                                    <NeonButton variant="solid" className="w-full">
                                        Register Now
                                    </NeonButton>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
