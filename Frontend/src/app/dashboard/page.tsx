"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import { RiGamepadLine, RiTrophyLine, RiCheckboxCircleLine, RiMoneyDollarCircleLine } from 'react-icons/ri';

interface DashboardStats {
    totalTournamentsJoined: number;
    activeRegistrations: number;
    completedTournaments: number;
    totalWinnings: number;
}

export default function DashboardHome() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardInfo = async () => {
            try {
                const [statsRes, tourneyRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/tournaments')
                ]);

                if (statsRes.data.success) setStats(statsRes.data.data);
                if (tourneyRes.data.success) {
                    // just show top 3 recent
                    setTournaments(tourneyRes.data.data.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardInfo();
    }, []);

    if (loading) {
        return <div className="animate-pulse flex gap-4"><div className="w-full h-32 bg-white/5 rounded-xl"></div></div>;
    }

    const statCards = [
        { label: 'Total Joined', value: stats?.totalTournamentsJoined || 0, icon: RiGamepadLine, color: 'text-blue-400' },
        { label: 'Active', value: stats?.activeRegistrations || 0, icon: RiTrophyLine, color: 'text-neon-green' },
        { label: 'Completed', value: stats?.completedTournaments || 0, icon: RiCheckboxCircleLine, color: 'text-purple-400' },
        { label: 'Winnings', value: `₹${stats?.totalWinnings || 0}`, icon: RiMoneyDollarCircleLine, color: 'text-yellow-400' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">OPERATIVE STATUS</h1>
                <p className="text-gray-400">Your current standing in the Callout arena.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <GlowCard key={idx} delay={idx * 0.1}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm tracking-widest uppercase mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-orbitron font-bold text-white">{stat.value}</h3>
                                </div>
                                <div className={`p-4 rounded-lg bg-white/5 ${stat.color} border border-white/10`}>
                                    <Icon className="text-2xl" />
                                </div>
                            </div>
                        </GlowCard>
                    );
                })}
            </div>

            <div>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-wide">Recent Deployments</h2>
                <div className="space-y-4">
                    {tournaments.length === 0 ? (
                        <div className="text-center py-12 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm">
                            <p className="text-gray-500">No active deployments found. Join a tournament to start.</p>
                        </div>
                    ) : (
                        tournaments.map((reg, idx) => (
                            <GlowCard key={idx} delay={0.3 + (idx * 0.1)} className="!p-4">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 border border-neon-green/30 rounded-lg flex items-center justify-center">
                                            <RiTrophyLine className="text-neon-green text-xl" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white font-orbitron tracking-wide">{reg.tournament?.name || 'Unknown Event'}</h4>
                                            <p className="text-sm text-gray-400">Team: <span className="text-neon-green glow-text">{reg.teamName}</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                                            <p className={`text-sm font-bold ${reg.tournament?.status === 'ACTIVE' ? 'text-neon-green' : 'text-gray-400'}`}>
                                                {reg.tournament?.status || 'N/A'}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Payment</p>
                                            <span className={`px-2 py-1 text-xs font-bold rounded ${reg.paymentStatus === 'VERIFIED' ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' :
                                                    reg.paymentStatus === 'FAILED' ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                                                        'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                                                }`}>
                                                {reg.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </GlowCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
