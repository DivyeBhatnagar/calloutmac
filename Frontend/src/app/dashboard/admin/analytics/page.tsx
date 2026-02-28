"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

export default function AdminAnalyticsPage() {
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [userData, setUserData] = useState<any[]>([]);
    const [tournamentData, setTournamentData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [revRes, userRes, tourneyRes] = await Promise.all([
                    api.get('/admin/analytics/revenue'),
                    api.get('/admin/analytics/users'),
                    api.get('/admin/analytics/tournaments')
                ]);

                if (revRes.data.success) setRevenueData(revRes.data.data);
                if (userRes.data.success) setUserData(userRes.data.data);
                if (tourneyRes.data.success) setTournamentData(tourneyRes.data.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 border border-neon-green/50 p-3 rounded-lg shadow-[0_0_15px_rgba(0,255,102,0.3)] backdrop-blur-md">
                    <p className="text-white font-bold tracking-wide mb-1">{label}</p>
                    <p className="text-neon-green font-orbitron">{`${payload[0].name}: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="h-64 bg-white/5 animate-pulse rounded-xl"></div>;

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">TELEMETRY & ANALYTICS</h1>
                <p className="text-gray-400">System growth and revenue metrics.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* User Growth Chart */}
                <GlowCard className="h-96 lg:col-span-2">
                    <h3 className="text-xl font-orbitron font-bold text-white mb-6 tracking-wide">Operative Acquisitions</h3>
                    <div className="w-full h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                                <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="count"
                                    name="New Users"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlowCard>

            </div>
        </div>
    );
}
