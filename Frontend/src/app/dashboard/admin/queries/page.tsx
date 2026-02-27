"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import NeonButton from '@/components/NeonButton';

export default function AdminQueriesPage() {
    const [queries, setQueries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseText, setResponseText] = useState('');

    const fetchQueries = async () => {
        try {
            const res = await api.get('/admin/queries');
            if (res.data.success) {
                setQueries(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch admin queries", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    const handleRespond = async (id: string) => {
        if (!responseText.trim()) return;
        try {
            await api.patch(`/admin/queries/${id}/respond`, { adminResponse: responseText });
            setRespondingTo(null);
            setResponseText('');
            fetchQueries();
        } catch (error) {
            console.error("Failed to respond", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
            case 'RESOLVED': return 'text-neon-green border-neon-green/30 bg-neon-green/10';
            case 'CLOSED': return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
            default: return 'text-white border-white/30 bg-white/10';
        }
    };

    if (loading) return <div className="h-32 bg-white/5 animate-pulse rounded-xl"></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">SUPPORT TRANSMISSIONS</h1>
                <p className="text-gray-400">Manage and respond to operative network issues.</p>
            </div>

            <div className="space-y-6">
                {queries.map((q) => (
                    <GlowCard key={q.id} className="!p-0 overflow-hidden">
                        <div className="p-5 border-b border-white/10 flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white">{q.subject}</h3>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${getStatusColor(q.status)}`}>
                                        {q.status}
                                    </span>
                                </div>
                                <div className="flex gap-4 text-xs font-medium text-gray-400">
                                    <span>From: <strong className="text-white">{q.user?.username || 'Unknown'}</strong></span>
                                    <span className="text-blue-400 font-bold uppercase tracking-widest">{q.category}</span>
                                    <span>{new Date(q.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-white/[0.02]">
                            <p className="text-gray-300 text-sm whitespace-pre-wrap mb-6">{q.message}</p>

                            {q.adminResponse ? (
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-xs font-bold text-neon-green uppercase mb-2 tracking-widest">Admin Response</p>
                                    <p className="text-white text-sm bg-neon-green/5 border border-neon-green/20 p-4 rounded-lg">
                                        {q.adminResponse}
                                    </p>
                                </div>
                            ) : respondingTo === q.id ? (
                                <div className="pt-4 border-t border-white/10 space-y-3">
                                    <textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors h-24 resize-none"
                                        placeholder="Type official command response..."
                                    ></textarea>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => { setRespondingTo(null); setResponseText(''); }}
                                            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <NeonButton onClick={() => handleRespond(q.id)}>
                                            SEND TRANSMISSION
                                        </NeonButton>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-4 border-t border-white/10 flex justify-end">
                                    <NeonButton variant="outline" onClick={() => setRespondingTo(q.id)}>
                                        RESPOND
                                    </NeonButton>
                                </div>
                            )}
                        </div>
                    </GlowCard>
                ))}
                {queries.length === 0 && (
                    <div className="text-center py-20 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm">
                        <h3 className="text-xl font-orbitron text-white tracking-wide">NO TRANSMISSIONS LOGGED</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
