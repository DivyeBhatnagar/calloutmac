"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { where, orderBy, doc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import GlowCard from '@/components/GlowCard';
import { RiQuestionLine, RiAddLine, RiCloseLine, RiCheckLine, RiTimeLine } from 'react-icons/ri';
import { Query } from '@/types';

export default function MyQueriesPage() {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [form, setForm] = useState({
        subject: '',
        message: '',
        category: 'general' as 'payment' | 'registration' | 'technical' | 'general'
    });

    const { data: queries, loading } = useRealtimeCollection<Query>(
        'queries',
        user?.id ? [where('userId', '==', user.id), orderBy('createdAt', 'desc')] : []
    );

    const handleSubmit = async () => {
        if (!form.subject.trim() || !form.message.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            const db = getFirestore(app);
            const newDocRef = doc(db, 'queries', `query_${Date.now()}`);
            
            await setDoc(newDocRef, {
                userId: user?.id,
                username: user?.username,
                email: user?.email,
                subject: form.subject,
                message: form.message,
                category: form.category,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            alert('Query submitted successfully! We will respond soon.');
            setShowModal(false);
            setForm({ subject: '', message: '', category: 'general' });
        } catch (error) {
            console.error('Error submitting query:', error);
            alert('Failed to submit query. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-32 bg-white/5 rounded-xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">
                        MY QUERIES
                    </h1>
                    <p className="text-gray-400">Submit and track your support queries • {queries.length} total</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg hover:bg-neon-green/30 transition-colors font-semibold"
                >
                    <RiAddLine className="text-xl" /> Submit Query
                </button>
            </div>

            {/* Queries List */}
            <div className="space-y-4">
                {queries.length === 0 ? (
                    <div className="text-center py-12 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm">
                        <RiQuestionLine className="text-6xl text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">No queries yet. Submit your first query!</p>
                    </div>
                ) : (
                    queries.map((query, idx) => (
                        <GlowCard key={query.id} delay={idx * 0.05} className="!p-6">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-white">{query.subject}</h3>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                query.status === 'resolved' 
                                                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' 
                                                    : query.status === 'in-progress' 
                                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                                                    : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                                            }`}>
                                                {query.status === 'resolved' ? '🟢 RESOLVED' : 
                                                 query.status === 'in-progress' ? '🔵 IN PROGRESS' : '🟡 PENDING'}
                                            </span>
                                            <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">
                                                {query.category.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-3">{query.message}</p>
                                        <p className="text-xs text-gray-500">
                                            Submitted: {query.createdAt?.toDate?.().toLocaleString() || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {query.adminResponse && (
                                    <div className="mt-4 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                                        <p className="text-sm font-semibold text-neon-green mb-2">Admin Response:</p>
                                        <p className="text-white text-sm">{query.adminResponse}</p>
                                    </div>
                                )}
                            </div>
                        </GlowCard>
                    ))
                )}
            </div>

            {/* Submit Query Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}>
                    <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-2xl font-orbitron font-bold text-white">Submit Query</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <RiCloseLine className="text-2xl" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Category *</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({...form, category: e.target.value as any})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green/50"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="payment">Payment Issues</option>
                                    <option value="registration">Registration Problems</option>
                                    <option value="technical">Technical Support</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Subject *</label>
                                <input
                                    type="text"
                                    value={form.subject}
                                    onChange={(e) => setForm({...form, subject: e.target.value})}
                                    placeholder="Brief description of your issue"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Message *</label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm({...form, message: e.target.value})}
                                    placeholder="Describe your issue in detail..."
                                    rows={5}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg hover:bg-neon-green/30 transition-colors font-semibold disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Query'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
