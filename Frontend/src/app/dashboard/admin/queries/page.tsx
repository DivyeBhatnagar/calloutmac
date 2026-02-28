"use client";

import { useState, useMemo } from 'react';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { orderBy, doc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import GlowCard from '@/components/GlowCard';
import { RiQuestionLine, RiSearchLine, RiCloseLine, RiSendPlaneLine, RiDeleteBinLine } from 'react-icons/ri';
import { Query } from '@/types';

export default function AdminQueriesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [responding, setResponding] = useState(false);

    const { data: queries, loading } = useRealtimeCollection<Query>('queries', [
        orderBy('createdAt', 'desc')
    ]);

    const filteredQueries = useMemo(() => {
        return queries.filter(query => {
            const matchesSearch = searchTerm === '' || 
                query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                query.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                query.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || query.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || query.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [queries, searchTerm, statusFilter, categoryFilter]);

    const stats = useMemo(() => {
        const total = queries.length;
        const pending = queries.filter(q => q.status === 'pending').length;
        const inProgress = queries.filter(q => q.status === 'in-progress').length;
        const resolved = queries.filter(q => q.status === 'resolved').length;
        return { total, pending, inProgress, resolved };
    }, [queries]);

    const handleUpdateStatus = async (queryId: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
        try {
            const db = getFirestore(app);
            await updateDoc(doc(db, 'queries', queryId), {
                status: newStatus,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleAddResponse = async () => {
        if (!selectedQuery || !adminResponse.trim()) {
            alert('Please enter a response');
            return;
        }

        setResponding(true);
        try {
            const db = getFirestore(app);
            await updateDoc(doc(db, 'queries', selectedQuery.id), {
                adminResponse: adminResponse,
                status: 'resolved',
                updatedAt: new Date()
            });
            alert('Response sent successfully!');
            setSelectedQuery(null);
            setAdminResponse('');
        } catch (error) {
            console.error('Error adding response:', error);
            alert('Failed to send response');
        } finally {
            setResponding(false);
        }
    };

    const handleDelete = async (queryId: string) => {
        if (!confirm('Are you sure you want to delete this query?')) return;

        try {
            const db = getFirestore(app);
            await deleteDoc(doc(db, 'queries', queryId));
            alert('Query deleted successfully!');
        } catch (error) {
            console.error('Error deleting query:', error);
            alert('Failed to delete query');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse h-24 bg-white/5 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">
                    QUERY MANAGEMENT
                </h1>
                <p className="text-gray-400">Real-time updates • {filteredQueries.length} queries</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlowCard>
                    <div>
                        <p className="text-gray-400 text-sm uppercase mb-1">Total</p>
                        <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div>
                        <p className="text-gray-400 text-sm uppercase mb-1">Pending</p>
                        <h3 className="text-2xl font-bold text-yellow-400">{stats.pending}</h3>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div>
                        <p className="text-gray-400 text-sm uppercase mb-1">In Progress</p>
                        <h3 className="text-2xl font-bold text-blue-400">{stats.inProgress}</h3>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div>
                        <p className="text-gray-400 text-sm uppercase mb-1">Resolved</p>
                        <h3 className="text-2xl font-bold text-neon-green">{stats.resolved}</h3>
                    </div>
                </GlowCard>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by subject, user, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50"
                        />
                    </div>
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green/50"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green/50"
                >
                    <option value="all">All Categories</option>
                    <option value="payment">Payment</option>
                    <option value="registration">Registration</option>
                    <option value="technical">Technical</option>
                    <option value="general">General</option>
                </select>
            </div>

            {/* Queries List */}
            <div className="space-y-3">
                {filteredQueries.length === 0 ? (
                    <div className="text-center py-12 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm">
                        <p className="text-gray-500">No queries found</p>
                    </div>
                ) : (
                    filteredQueries.map((query, idx) => (
                        <GlowCard key={query.id} delay={idx * 0.02} className="!p-4">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h4 className="text-white font-semibold">{query.subject}</h4>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                query.status === 'resolved' 
                                                    ? 'bg-neon-green/20 text-neon-green' 
                                                    : query.status === 'in-progress' 
                                                    ? 'bg-blue-500/20 text-blue-400' 
                                                    : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                                {query.status === 'resolved' ? '🟢 RESOLVED' : 
                                                 query.status === 'in-progress' ? '🔵 IN PROGRESS' : '🟡 PENDING'}
                                            </span>
                                            <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">
                                                {query.category.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">{query.message}</p>
                                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                            <span>User: {query.username}</span>
                                            <span>•</span>
                                            <span>{query.email}</span>
                                            <span>•</span>
                                            <span>{query.createdAt?.toDate?.().toLocaleString() || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {query.status !== 'resolved' && (
                                            <>
                                                {query.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(query.id, 'in-progress')}
                                                        className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded text-xs hover:bg-blue-500/30 transition-colors"
                                                    >
                                                        Mark In Progress
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedQuery(query);
                                                        setAdminResponse(query.adminResponse || '');
                                                    }}
                                                    className="px-3 py-1 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded text-xs hover:bg-neon-green/30 transition-colors"
                                                >
                                                    Respond
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(query.id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded transition-colors text-red-400"
                                        >
                                            <RiDeleteBinLine />
                                        </button>
                                    </div>
                                </div>

                                {query.adminResponse && (
                                    <div className="p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                                        <p className="text-xs font-semibold text-neon-green mb-1">Admin Response:</p>
                                        <p className="text-white text-sm">{query.adminResponse}</p>
                                    </div>
                                )}
                            </div>
                        </GlowCard>
                    ))
                )}
            </div>

            {/* Response Modal */}
            {selectedQuery && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedQuery(null)}>
                    <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-2xl font-orbitron font-bold text-white">Respond to Query</h2>
                            <button onClick={() => setSelectedQuery(null)} className="text-gray-400 hover:text-white">
                                <RiCloseLine className="text-2xl" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-white/5 rounded-lg">
                                <p className="text-sm text-gray-400 mb-2">User Query:</p>
                                <p className="text-white font-semibold mb-1">{selectedQuery.subject}</p>
                                <p className="text-gray-300 text-sm">{selectedQuery.message}</p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Your Response *</label>
                                <textarea
                                    value={adminResponse}
                                    onChange={(e) => setAdminResponse(e.target.value)}
                                    placeholder="Type your response here..."
                                    rows={5}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex gap-4">
                            <button
                                onClick={() => setSelectedQuery(null)}
                                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddResponse}
                                disabled={responding}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg hover:bg-neon-green/30 transition-colors font-semibold disabled:opacity-50"
                            >
                                <RiSendPlaneLine />
                                {responding ? 'Sending...' : 'Send Response & Mark Resolved'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
