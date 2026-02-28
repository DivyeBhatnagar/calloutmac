"use client";

import { useMemo } from 'react';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { where, orderBy, limit } from 'firebase/firestore';
import GlowCard from '@/components/GlowCard';
import { RiGamepadLine, RiTeamLine, RiMoneyCnyBoxLine, RiCheckboxCircleLine, RiTimeLine, RiUserLine, RiQuestionLine } from 'react-icons/ri';
import { Registration, Tournament, User, Query } from '@/types';
import Link from 'next/link';

export default function AdminStatsPage() {
    const { data: tournaments, loading: tournamentsLoading } = useRealtimeCollection<Tournament>('tournaments');
    const { data: registrations, loading: regsLoading } = useRealtimeCollection<Registration>('registrations', [
        orderBy('registeredAt', 'desc')
    ]);
    const { data: users } = useRealtimeCollection<User>('users');
    const { data: queries } = useRealtimeCollection<Query>('queries');

    const stats = useMemo(() => {
        const activeTournaments = tournaments.filter(t => t.status === 'active').length;
        const totalRegistrations = registrations.length;
        const platformUsers = users.length;
        const supportQueries = queries.filter(q => q.status === 'pending').length;
        
        const verifiedRegs = registrations.filter(r => r.paymentVerified);
        const revenueThisMonth = verifiedRegs.reduce((sum, reg) => {
            const regDate = reg.registeredAt?.toDate?.() || new Date();
            const now = new Date();
            if (regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear()) {
                return sum + (reg.paymentDetails?.amount || 0);
            }
            return sum;
        }, 0);

        const pendingVerifications = registrations.filter(r => !r.paymentVerified && r.paymentStatus === 'PENDING').length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeUsersToday = users.filter(u => {
            const lastLogin = u.lastLogin?.toDate?.() || new Date(0);
            return lastLogin >= today;
        }).length;

        return {
            activeTournaments,
            totalRegistrations,
            platformUsers,
            supportQueries,
            revenueThisMonth,
            pendingVerifications,
            activeUsersToday
        };
    }, [tournaments, registrations, users, queries]);

    const recentRegistrations = useMemo(() => {
        return registrations.slice(0, 5);
    }, [registrations]);

    if (tournamentsLoading || regsLoading) {
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
        { label: 'Active Tournaments', value: stats.activeTournaments, icon: RiGamepadLine, color: 'text-neon-green', link: '/dashboard/admin/tournaments' },
        { label: 'Total Registrations', value: stats.totalRegistrations, icon: RiTeamLine, color: 'text-blue-400', link: '/dashboard/admin/registrations' },
        { label: 'Platform Users', value: stats.platformUsers, icon: RiUserLine, color: 'text-purple-400', link: '/dashboard/admin/users' },
        { label: 'Support Queries', value: stats.supportQueries, icon: RiQuestionLine, color: 'text-orange-400', link: '/dashboard/admin/queries' },
        { label: 'Revenue This Month', value: `₹${stats.revenueThisMonth}`, icon: RiMoneyCnyBoxLine, color: 'text-yellow-400', link: '/dashboard/admin/analytics' },
        { label: 'Pending Verifications', value: stats.pendingVerifications, icon: RiTimeLine, color: 'text-red-400', link: '/dashboard/admin/registrations' },
        { label: 'Active Users Today', value: stats.activeUsersToday, icon: RiCheckboxCircleLine, color: 'text-cyan-400', link: '/dashboard/admin/users' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">
                    SYSTEM OVERVIEW
                </h1>
                <p className="text-gray-400">Real-time admin dashboard • Updates automatically</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={idx} href={stat.link}>
                            <GlowCard delay={idx * 0.1} className="cursor-pointer hover:scale-105 transition-transform">
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
                        </Link>
                    );
                })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlowCard>
                    <div className="space-y-2">
                        <p className="text-gray-400 text-sm uppercase tracking-wider">Tournament Completion Rate</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-white">
                                {tournaments.length > 0 
                                    ? Math.round((tournaments.filter(t => t.status === 'closed').length / tournaments.length) * 100)
                                    : 0}%
                            </h3>
                            <span className="text-sm text-gray-500 mb-1">of all tournaments</span>
                        </div>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div className="space-y-2">
                        <p className="text-gray-400 text-sm uppercase tracking-wider">Payment Success Rate</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-white">
                                {registrations.length > 0
                                    ? Math.round((registrations.filter(r => r.paymentVerified).length / registrations.length) * 100)
                                    : 0}%
                            </h3>
                            <span className="text-sm text-gray-500 mb-1">verified payments</span>
                        </div>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div className="space-y-2">
                        <p className="text-gray-400 text-sm uppercase tracking-wider">Avg. Registrations/Tournament</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-white">
                                {tournaments.length > 0
                                    ? Math.round(registrations.length / tournaments.length)
                                    : 0}
                            </h3>
                            <span className="text-sm text-gray-500 mb-1">per tournament</span>
                        </div>
                    </div>
                </GlowCard>
            </div>

            {/* Recent Registrations */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-orbitron font-bold text-white tracking-wide">Recent Registrations</h2>
                    <Link href="/dashboard/admin/registrations" className="text-neon-green hover:underline text-sm">
                        View All →
                    </Link>
                </div>
                <div className="space-y-3">
                    {recentRegistrations.length === 0 ? (
                        <div className="text-center py-12 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm">
                            <p className="text-gray-500">No registrations yet</p>
                        </div>
                    ) : (
                        recentRegistrations.map((reg, idx) => (
                            <GlowCard key={reg.id} delay={0.2 + (idx * 0.05)} className="!p-4">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 border border-blue-400/30 rounded-lg flex items-center justify-center">
                                            <RiTeamLine className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">{reg.teamName}</h4>
                                            <p className="text-sm text-gray-400">{reg.username} • {reg.tournament}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                            reg.paymentVerified 
                                                ? 'bg-neon-green/20 text-neon-green' 
                                                : 'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                            {reg.paymentVerified ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            </GlowCard>
                        ))
                    )}
                </div>
            </div>

            {/* Pending Queries */}
            {stats.supportQueries > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-orbitron font-bold text-white tracking-wide">Pending Queries</h2>
                        <Link href="/dashboard/admin/queries" className="text-neon-green hover:underline text-sm">
                            View All →
                        </Link>
                    </div>
                    <GlowCard className="bg-orange-500/10 border-orange-500/30">
                        <div className="flex items-center gap-4">
                            <RiQuestionLine className="text-4xl text-orange-400" />
                            <div>
                                <h3 className="text-xl font-bold text-white">{stats.supportQueries} Pending Queries</h3>
                                <p className="text-gray-400">Require immediate attention</p>
                            </div>
                        </div>
                    </GlowCard>
                </div>
            )}
        </div>
    );
}
