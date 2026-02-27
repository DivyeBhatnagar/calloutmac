"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import { RiGamepadLine, RiTeamLine, RiMoneyCnyBoxLine, RiCheckboxCircleLine } from 'react-icons/ri';

interface AdminStats {
    totalUsers: number;
    totalTournaments: number;
    activeTournaments: number;
    totalRegistrations: number;
    totalRevenue: number;
}

export default function AdminStatsPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="animate-pulse flex gap-4"><div className="w-full h-32 bg-white/5 rounded-xl"></div></div>;
    }

    const statCards = [
        { label: 'Total Operatives', value: stats?.totalUsers || 0, icon: RiTeamLine, color: 'text-blue-400' },
        { label: 'Total Deployments', value: stats?.totalTournaments || 0, icon: RiGamepadLine, color: 'text-purple-400' },
        { label: 'Active Deployments', value: stats?.activeTournaments || 0, icon: RiCheckboxCircleLine, color: 'text-neon-green' },
        { label: 'Total Registrations', value: stats?.totalRegistrations || 0, icon: RiTeamLine, color: 'text-orange-400' },
        { label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: RiMoneyCnyBoxLine, color: 'text-yellow-400' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">SYSTEM OVERVIEW</h1>
                <p className="text-gray-400">Callout Network global telemetry and statistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
    );
}
