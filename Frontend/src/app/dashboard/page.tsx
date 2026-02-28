"use client";

import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { where, orderBy, limit } from 'firebase/firestore';
import GlowCard from '@/components/GlowCard';
import { RiGamepadLine, RiTrophyLine, RiCheckboxCircleLine, RiTimeLine, RiUserLine, RiTeamLine, RiCalendarLine } from 'react-icons/ri';
import { Registration, Tournament } from '@/types';
import Link from 'next/link';

export default function DashboardHome() {
    const { user } = useAuth();

    const { data: rawRegs, loading: regsLoading } = useRealtimeCollection<Registration>(
        'registrations',
        user?.id ? [where('userId', '==', user.id)] : []
    );

    const registrations = useMemo(
        () => [...rawRegs].sort((a, b) => {
            const ta = (a.createdAt ?? a.registeredAt)?.toMillis?.() ?? 0;
            const tb = (b.createdAt ?? b.registeredAt)?.toMillis?.() ?? 0;
            return tb - ta;
        }),
        [rawRegs]
    );

    const { data: tournaments } = useRealtimeCollection<Tournament>('tournaments', [
        where('status', '==', 'active')
    ]);

    const stats = useMemo(() => {
        const totalParticipated = registrations.length;
        const activeRegs = registrations.filter(r => r.paymentVerified).length;
        const pendingVerifications = registrations.filter(r => !r.paymentVerified && r.paymentStatus === 'PENDING').length;
        const completed = registrations.filter(r => r.status === 'COMPLETED').length;

        return {
            totalParticipated,
            activeRegs,
            pendingVerifications,
            completed
        };
    }, [registrations]);

    const recentActivity = useMemo(() => {
        return registrations.slice(0, 5).map(reg => ({
            ...reg,
            timestamp: reg.registeredAt?.toDate?.() || new Date()
        }));
    }, [registrations]);

    if (regsLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse h-32 bg-white/5 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Tournaments', value: stats.totalParticipated, icon: RiGamepadLine, color: 'text-blue-400' },
        { label: 'Active Registrations', value: stats.activeRegs, icon: RiTrophyLine, color: 'text-neon-green' },
        { label: 'Pending Verifications', value: stats.pendingVerifications, icon: RiTimeLine, color: 'text-yellow-400' },
        { label: 'Completed', value: stats.completed, icon: RiCheckboxCircleLine, color: 'text-purple-400' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">
                    OPERATIVE STATUS
                </h1>
                <p className="text-gray-400">Real-time dashboard • Updates automatically</p>
            </div>

            {/* Stats Cards */}
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

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4 tracking-wide">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/dashboard/register">
                        <GlowCard className="cursor-pointer hover:scale-105 transition-transform">
                            <div className="flex items-center gap-3">
                                <RiGamepadLine className="text-2xl text-neon-green" />
                                <span className="text-white font-semibold">Register for Tournament</span>
                            </div>
                        </GlowCard>
                    </Link>
                    <Link href="/dashboard/tournaments">
                        <GlowCard className="cursor-pointer hover:scale-105 transition-transform">
                            <div className="flex items-center gap-3">
                                <RiTrophyLine className="text-2xl text-blue-400" />
                                <span className="text-white font-semibold">View My Tournaments</span>
                            </div>
                        </GlowCard>
                    </Link>
                    <Link href="/dashboard/queries">
                        <GlowCard className="cursor-pointer hover:scale-105 transition-transform">
                            <div className="flex items-center gap-3">
                                <RiUserLine className="text-2xl text-purple-400" />
                                <span className="text-white font-semibold">Submit Query</span>
                            </div>
                        </GlowCard>
                    </Link>
                    <Link href="/dashboard/profile">
                        <GlowCard className="cursor-pointer hover:scale-105 transition-transform">
                            <div className="flex items-center gap-3">
                                <RiUserLine className="text-2xl text-yellow-400" />
                                <span className="text-white font-semibold">Update Profile</span>
                            </div>
                        </GlowCard>
                    </Link>
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-wide">Recent Activity</h2>
                <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                        <div className="text-center py-12 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm">
                            <p className="text-gray-500">No activity yet. Register for a tournament to get started!</p>
                        </div>
                    ) : (
                        recentActivity.map((reg, idx) => (
                            <GlowCard key={reg.id} delay={0.3 + (idx * 0.1)} className="!p-4">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 border border-neon-green/30 rounded-lg flex items-center justify-center">
                                            <RiTrophyLine className="text-neon-green text-xl" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white font-orbitron tracking-wide">
                                                {reg.tournament || 'Tournament'}
                                            </h4>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <RiTeamLine /> Team: <span className="text-neon-green">{reg.teamName}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <RiCalendarLine /> {reg.timestamp.toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Payment</p>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${reg.paymentVerified
                                                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                                                    : reg.paymentStatus === 'FAILED'
                                                        ? 'bg-red-500/20 text-red-500 border border-red-500/50'
                                                        : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                                                }`}>
                                                {reg.paymentVerified ? '🟢 VERIFIED' : reg.paymentStatus === 'FAILED' ? '🔴 FAILED' : '🟡 PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </GlowCard>
                        ))
                    )}
                </div>
            </div>

            {/* Upcoming Active Tournaments */}
            <div>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-wide">Active Tournaments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tournaments.slice(0, 3).map((tournament, idx) => (
                        <GlowCard key={tournament.id} delay={idx * 0.1}>
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2">{tournament.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {tournament.currentRegistrations || 0}/{tournament.maxSlots || '∞'} slots
                                    </span>
                                    <span className="text-neon-green font-bold">₹{tournament.paymentAmount || 0}</span>
                                </div>
                            </div>
                        </GlowCard>
                    ))}
                </div>
            </div>
        </div>
    );
}
