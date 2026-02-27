"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import NeonButton from '@/components/NeonButton';
import { RiMessage3Line, RiAddLine } from 'react-icons/ri';

export default function UserQueriesPage() {
    const [queries, setQueries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [formData, setFormData] = useState({
        subject: '',
        category: 'GENERAL',
        message: ''
    });

    const fetchQueries = async () => {
        try {
            const res = await api.get('/dashboard/queries');
            if (res.data.success) {
                setQueries(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch queries", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await api.post('/dashboard/query', formData);
            if (res.data.success) {
                setIsFormOpen(false);
                setFormData({ subject: '', category: 'GENERAL', message: '' });
                fetchQueries();
            }
        } catch (error) {
            console.error("Error submitting query", error);
        } finally {
            setSubmitting(false);
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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">COMM LINK</h1>
                    <p className="text-gray-400">Direct transmission to Callout Command servers.</p>
                </div>
                <NeonButton onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2">
                    <RiAddLine /> {isFormOpen ? 'CANCEL' : 'NEW TRANSMISSION'}
                </NeonButton>
            </div>

            {isFormOpen && (
                <GlowCard className="mb-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-gray-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                                    required
                                >
                                    <option value="GENERAL">General Support</option>
                                    <option value="TOURNAMENT">Tournament Issue</option>
                                    <option value="PAYMENT">Payment/Prize Issue</option>
                                    <option value="REPORT">Report Player</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Message</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors h-32 resize-none"
                                required
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/10">
                            <NeonButton type="submit" disabled={submitting}>
                                {submitting ? 'SENDING...' : 'TRANSMIT'}
                            </NeonButton>
                        </div>
                    </form>
                </GlowCard>
            )}

            {loading ? (
                <div className="h-32 bg-white/5 animate-pulse rounded-xl"></div>
            ) : queries.length === 0 ? (
                <div className="text-center py-20 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm">
                    <RiMessage3Line className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-orbitron text-white tracking-wide mb-2">NO TRANSMISSIONS LOGGED</h3>
                    <p className="text-gray-500">You haven't sent any support queries yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {queries.map((q) => (
                        <GlowCard key={q.id} className="!p-0 overflow-hidden">
                            <div className="p-5 border-b border-white/10 flex justify-between items-start flex-wrap gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{q.subject}</h3>
                                    <div className="flex gap-4 text-xs font-bold tracking-widest uppercase">
                                        <span className="text-blue-400">{q.category}</span>
                                        <span className="text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded border ${getStatusColor(q.status)}`}>
                                    {q.status}
                                </span>
                            </div>
                            <div className="p-5 bg-white/[0.02]">
                                <p className="text-gray-300 text-sm whitespace-pre-wrap">{q.message}</p>

                                {q.adminResponse && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-xs font-bold text-neon-green uppercase mb-2 tracking-widest">Command Response</p>
                                        <p className="text-white text-sm bg-neon-green/5 border border-neon-green/20 p-4 rounded-lg">
                                            {q.adminResponse}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </GlowCard>
                    ))}
                </div>
            )}
        </div>
    );
}
