"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import { RiTrophyLine } from 'react-icons/ri';

export default function MyTournaments() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const res = await api.get('/dashboard/tournaments');
                if (res.data.success) {
                    setTournaments(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch tournaments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">MY DEPLOYMENTS</h1>
                <p className="text-gray-400">History of all tournament registrations and their statuses.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-40 bg-white/5 animate-pulse rounded-xl"></div>
                    <div className="h-40 bg-white/5 animate-pulse rounded-xl"></div>
                </div>
            ) : tournaments.length === 0 ? (
                <div className="text-center py-20 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm">
                    <RiTrophyLine className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-orbitron text-white tracking-wide mb-2">NO DEPLOYMENTS YET</h3>
                    <p className="text-gray-500">You haven't registered for any tournaments.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {tournaments.map((reg, idx) => (
                        <GlowCard key={idx} delay={idx * 0.1}>
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-orbitron font-bold text-white tracking-wide">
                                            {reg.tournament?.name || 'Tournament'}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${reg.tournament?.status === 'ACTIVE' ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' :
                                                reg.tournament?.status === 'CLOSED' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                                                    'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                                            }`}>
                                            {reg.tournament?.status || 'UNKNOWN'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 text-sm">Squad Name</span>
                                            <span className="text-white font-bold">{reg.teamName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 text-sm">IGL</span>
                                            <span className="text-white font-bold">{reg.iglName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 text-sm">Registered On</span>
                                            <span className="text-gray-300 text-sm">{new Date(reg.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Payment Status</span>
                                    <span className={`px-3 py-1 text-xs font-bold rounded ${reg.paymentStatus === 'VERIFIED' ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' :
                                            reg.paymentStatus === 'FAILED' ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                                                'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                                        }`}>
                                        {reg.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </GlowCard>
                    ))}
                </div>
            )}
        </div>
    );
}
