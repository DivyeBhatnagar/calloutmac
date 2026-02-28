"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import GlowCard from '@/components/GlowCard';
import { RiQuestionLine, RiAddLine, RiCloseLine, RiSendPlaneFill, RiArrowLeftLine } from 'react-icons/ri';
import { SupportTicket, SupportMessage } from '@/types/support';

export default function MyQueriesPage() {
    const { user, token } = useAuth();
    const [queries, setQueries] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        subject: '',
        message: '',
        category: 'general' as 'payment' | 'registration' | 'technical' | 'general'
    });

    // Chat view state
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [replyText, setReplyText] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (selectedTicket && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, selectedTicket]);

    useEffect(() => {
        if (user && token && !selectedTicket) {
            fetchTickets();
        }
    }, [user, token, selectedTicket]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/my-tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setQueries(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (ticketId: string) => {
        setLoadingChat(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/${ticketId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data.messages);
                const updatedTicket = data.data.ticket;
                setSelectedTicket(updatedTicket);
                // Also update the list item in the background
                setQueries(prev => prev.map(t => t.ticketId === updatedTicket.ticketId ? updatedTicket : t));
            }
        } catch (error) {
            console.error('Failed to fetch ticket messages:', error);
        } finally {
            setLoadingChat(false);
        }
    };

    const handleCreateSubmit = async () => {
        if (!form.subject.trim() || !form.message.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                alert('Query submitted successfully! We will respond soon.');
                setShowCreateModal(false);
                setForm({ subject: '', message: '', category: 'general' });
                fetchTickets();
            } else {
                alert(data.message || 'Failed to submit query');
            }
        } catch (error) {
            console.error('Error submitting query:', error);
            alert('Failed to submit query. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/${selectedTicket.ticketId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: replyText })
            });
            const data = await res.json();
            if (data.success) {
                setReplyText('');
                fetchTicketDetails(selectedTicket.ticketId); // refresh chat
            } else {
                alert(data.message || 'Failed to send reply');
            }
        } catch (error) {
            console.error('Failed to send reply', error);
            alert('Error sending reply.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return 'bg-neon-green/20 text-neon-green border border-neon-green/50';
            case 'IN_PROGRESS':
                return 'bg-blue-500/20 text-blue-400 border border-blue-500/50';
            case 'OPEN':
                return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50';
            case 'CLOSED':
            default:
                return 'bg-gray-500/20 text-gray-400 border border-gray-500/50';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'RESOLVED': return '🟢 RESOLVED';
            case 'IN_PROGRESS': return '🔵 IN PROGRESS';
            case 'OPEN': return '🟡 OPEN';
            case 'CLOSED': return '⚪ CLOSED';
            default: return status;
        }
    };

    if (loading && !selectedTicket) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-32 bg-white/5 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (selectedTicket) {
        return (
            <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedTicket(null)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <RiArrowLeftLine className="text-2xl" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-orbitron font-bold text-white tracking-wider glow-text">
                                {selectedTicket.subject}
                            </h2>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(selectedTicket.status)}`}>
                                {getStatusLabel(selectedTicket.status)}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm">Ticket ID: {selectedTicket.ticketId}</p>
                    </div>
                </div>

                <div className="flex-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden flex flex-col">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {loadingChat ? (
                            <div className="animate-pulse flex items-center justify-center h-full">
                                <span className="text-gray-400">Loading messages...</span>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.senderRole === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl p-4 ${msg.senderRole === 'USER'
                                            ? 'bg-neon-green/20 text-white rounded-tr-none border border-neon-green/30'
                                            : 'bg-white/10 text-white rounded-tl-none border border-white/20'
                                        }`}>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                                        <div className={`text-xs mt-2 ${msg.senderRole === 'USER' ? 'text-neon-green/80' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white/5 border-t border-white/10">
                        {selectedTicket.status === 'CLOSED' ? (
                            <div className="text-center text-gray-400 py-2">
                                This ticket has been closed. Further replies are disabled.
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply here..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 resize-none min-h-[50px] max-h-[150px]"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleReply();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleReply}
                                    disabled={submitting || !replyText.trim()}
                                    className="h-[50px] px-6 bg-neon-green border border-neon-green/50 rounded-xl text-black flex items-center justify-center hover:bg-neon-green/80 transition-colors disabled:opacity-50 font-bold"
                                >
                                    <RiSendPlaneFill className="text-xl" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
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
                    onClick={() => setShowCreateModal(true)}
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
                        <GlowCard
                            key={query.ticketId}
                            delay={idx * 0.05}
                            className="!p-6 cursor-pointer hover:border-neon-green/50 transition-colors"
                            onClick={() => {
                                setSelectedTicket(query);
                                fetchTicketDetails(query.ticketId);
                            }}
                        >
                            <div className="space-y-4 pointer-events-none">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-white">{query.subject}</h3>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(query.status)}`}>
                                                {getStatusLabel(query.status)}
                                            </span>
                                            <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">
                                                {query.category.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Last update: {new Date(query.lastMessageAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </GlowCard>
                    ))
                )}
            </div>

            {/* Submit Query Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowCreateModal(false)}>
                    <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-2xl font-orbitron font-bold text-white">Submit Query</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                                <RiCloseLine className="text-2xl" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Category *</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                                    className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green/50"
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
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    placeholder="Brief description of your issue"
                                    className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Message *</label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                    rows={5}
                                    className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex gap-4">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSubmit}
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
