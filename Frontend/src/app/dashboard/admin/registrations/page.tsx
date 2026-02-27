"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import NeonButton from '@/components/NeonButton';

export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRegistrations = async () => {
        try {
            const res = await api.get('/admin/registrations');
            if (res.data.success) {
                setRegistrations(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch registrations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const handleVerify = async (id: string) => {
        if (!confirm('Manually verify payment for this squad?')) return;
        try {
            await api.patch(`/admin/registrations/${id}/verify`);
            fetchRegistrations();
        } catch (error) {
            console.error("Failed to verify", error);
        }
    };

    if (loading) return <div className="h-32 bg-white/5 animate-pulse rounded-xl"></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">SQUAD OVERSIGHT</h1>
                <p className="text-gray-400">Manage and verify tournament registrations.</p>
            </div>

            <div className="overflow-x-auto bg-black/40 border border-white/10 rounded-xl backdrop-blur-xl">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-xs uppercase font-orbitron text-white">
                        <tr>
                            <th className="px-6 py-4">Squad Name</th>
                            <th className="px-6 py-4">Deployment</th>
                            <th className="px-6 py-4">IGL / Contact</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.map((reg) => (
                            <tr key={reg.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-bold text-white">{reg.teamName}</td>
                                <td className="px-6 py-4 text-neon-green">{reg.tournament?.name || 'Unknown'}</td>
                                <td className="px-6 py-4">
                                    <div className="text-white">{reg.iglName}</div>
                                    <div className="text-xs text-gray-500">{reg.iglContact}</div>
                                </td>
                                <td className="px-6 py-4 text-xs">{new Date(reg.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${reg.paymentStatus === 'VERIFIED' ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' :
                                            reg.paymentStatus === 'FAILED' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                                                'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                                        }`}>{reg.paymentStatus}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {reg.paymentStatus !== 'VERIFIED' && (
                                        <button
                                            onClick={() => handleVerify(reg.id)}
                                            className="text-xs text-neon-green hover:text-white transition-colors uppercase font-bold tracking-widest border border-neon-green/50 px-3 py-1 rounded hover:bg-neon-green/10"
                                        >
                                            Verify
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {registrations.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No registrations found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
