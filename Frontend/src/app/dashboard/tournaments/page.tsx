"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { where } from 'firebase/firestore';
import GlowCard from '@/components/GlowCard';
import { RiTrophyLine, RiTeamLine, RiUserLine, RiCloseLine, RiCalendarLine } from 'react-icons/ri';
import { Registration } from '@/types';

export default function MyTournaments() {
    const { user } = useAuth();
    const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

    const { data: rawRegs, loading, error } = useRealtimeCollection<Registration>(
        'registrations',
        user?.id ? [where('userId', '==', user.id)] : []
    );

    // Sort client-side so no composite Firestore index is needed
    const tournaments = useMemo(
        () => [...rawRegs].sort((a, b) => {
            const ta = (a.createdAt ?? a.registeredAt)?.toMillis?.() ?? 0;
            const tb = (b.createdAt ?? b.registeredAt)?.toMillis?.() ?? 0;
            return tb - ta;
        }),
        [rawRegs]
    );

    // Debug: surface Firestore errors during development
    if (error) console.error('[MyTournaments] Firestore error:', error);
    const groupedByStatus = useMemo(() => {
        const verified = tournaments.filter(r => r.paymentVerified === true);
        const pending = tournaments.filter(r => !r.paymentVerified && r.paymentStatus === 'PENDING');
        const failed = tournaments.filter(r => r.paymentStatus === 'FAILED');
        return { verified, pending, failed };
    }, [tournaments]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">MY DEPLOYMENTS</h1>
                <p className="text-gray-400">Real-time updates • {tournaments.length} total registrations</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlowCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm uppercase">Verified</p>
                            <h3 className="text-2xl font-bold text-neon-green">{groupedByStatus.verified.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center">
                            <RiTrophyLine className="text-neon-green text-xl" />
                        </div>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm uppercase">Pending</p>
                            <h3 className="text-2xl font-bold text-yellow-400">{groupedByStatus.pending.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                            <RiCalendarLine className="text-yellow-400 text-xl" />
                        </div>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm uppercase">Failed</p>
                            <h3 className="text-2xl font-bold text-red-400">{groupedByStatus.failed.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center">
                            <RiCloseLine className="text-red-400 text-xl" />
                        </div>
                    </div>
                </GlowCard>
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
                        <GlowCard key={reg.id} delay={idx * 0.1} className="cursor-pointer hover:scale-[1.02] transition-transform"
                            onClick={() => setSelectedReg(reg)}>
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-orbitron font-bold text-white tracking-wide">
                                            {reg.tournament || 'Tournament'}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${reg.status === 'ACTIVE' ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' :
                                            reg.status === 'CLOSED' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                                                'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                                            }`}>
                                            {reg.status || 'ACTIVE'}
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
                                            <span className="text-gray-300 text-sm">
                                                {reg.registeredAt?.toDate?.().toLocaleDateString() || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Payment Status</span>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${reg.paymentVerified ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' :
                                        reg.paymentStatus === 'FAILED' ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                                            'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                                        }`}>
                                        {reg.paymentVerified ? '🟢 VERIFIED' : reg.paymentStatus === 'FAILED' ? '🔴 FAILED' : '🟡 PENDING'}
                                    </span>
                                </div>
                            </div>
                        </GlowCard>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selectedReg && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedReg(null)}>
                    <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
                            <h2 className="text-2xl font-orbitron font-bold text-white">Registration Details</h2>
                            <button onClick={() => setSelectedReg(null)}
                                className="text-gray-400 hover:text-white transition-colors">
                                <RiCloseLine className="text-2xl" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Tournament Info */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">Tournament Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-400">Tournament: <span className="text-white">{selectedReg.tournament}</span></p>
                                    <p className="text-gray-400">Game: <span className="text-white">{selectedReg.game}</span></p>
                                    {selectedReg.college && (
                                        <p className="text-gray-400">College: <span className="text-white">{selectedReg.college}</span></p>
                                    )}
                                </div>
                            </div>

                            {/* Team Info */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">Team Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-400">Team Name: <span className="text-white font-semibold">{selectedReg.teamName}</span></p>
                                    <p className="text-gray-400">IGL: <span className="text-white">{selectedReg.iglName}</span></p>
                                    <p className="text-gray-400">IGL Contact: <span className="text-white">{selectedReg.iglContact}</span></p>
                                    <p className="text-gray-400">Player Count: <span className="text-white">{selectedReg.playerCount}</span></p>
                                </div>
                            </div>

                            {/* Players */}
                            {selectedReg.playerNames && selectedReg.playerNames.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-3">Team Roster</h3>
                                    <div className="space-y-2">
                                        {selectedReg.playerNames.map((name, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                <span className="text-white">{name}</span>
                                                <span className="text-gray-400 text-sm">{selectedReg.playerIds?.[idx]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payment Info */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">Payment Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-400">Status:
                                        <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${selectedReg.paymentVerified
                                            ? 'bg-neon-green/20 text-neon-green'
                                            : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {selectedReg.paymentVerified ? '✅ VERIFIED' : '⏳ PENDING VERIFICATION'}
                                        </span>
                                    </p>
                                    {selectedReg.payment && (
                                        <>
                                            <p className="text-gray-400">Transaction ID: <span className="text-white font-mono">{selectedReg.payment.transactionId}</span></p>
                                            {selectedReg.payment.amount && <p className="text-gray-400">Amount: <span className="text-white">₹{selectedReg.payment.amount}</span></p>}
                                            {selectedReg.payment.paymentDate && <p className="text-gray-400">Date: <span className="text-white">{selectedReg.payment.paymentDate}</span></p>}
                                            {selectedReg.payment.upiId && <p className="text-gray-400">UPI ID: <span className="text-white">{selectedReg.payment.upiId}</span></p>}
                                            {selectedReg.payment.bankName && <p className="text-gray-400">Bank: <span className="text-white">{selectedReg.payment.bankName}</span></p>}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
