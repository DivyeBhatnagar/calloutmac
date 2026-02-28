"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import GlowCard from '@/components/GlowCard';
import { RiQuestionLine, RiCheckLine, RiCloseLine, RiSendPlaneFill, RiArrowLeftLine, RiFilter3Line, RiSearchLine, RiDeleteBinLine } from 'react-icons/ri';
import { SupportTicket, SupportMessage } from '@/types/support';

export default function AdminSupportPage() {
    const { user, token } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Chat view state
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [replyText, setReplyText] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
        if (user && token && user.role?.toUpperCase() === 'ADMIN' && !selectedTicket) {
            fetchTickets();
        }
    }, [user, token, selectedTicket]);

    useEffect(() => {
        let result = tickets;

        if (filterStatus !== 'ALL') {
            result = result.filter(t => t.status === filterStatus);
        }
        if (filterCategory !== 'ALL') {
            result = result.filter(t => t.category === filterCategory);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.username.toLowerCase().includes(query) ||
                t.email.toLowerCase().includes(query) ||
                t.subject.toLowerCase().includes(query)
            );
        }

        setFilteredTickets(result);
    }, [tickets, filterStatus, filterCategory, searchQuery]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTickets(data.data);
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/${ticketId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data.messages);
                const updatedTicket = data.data.ticket;
                setSelectedTicket(updatedTicket);
                setTickets(prev => prev.map(t => t.ticketId === updatedTicket.ticketId ? updatedTicket : t));
            }
        } catch (error) {
            console.error('Failed to fetch ticket messages:', error);
        } finally {
            setLoadingChat(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/${selectedTicket.ticketId}/reply`, {
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
                fetchTicketDetails(selectedTicket.ticketId);
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

    const handleUpdateStatus = async (status: 'RESOLVED' | 'CLOSED') => {
        if (!selectedTicket || !window.confirm(`Are you sure you want to mark this ticket as ${status}?`)) return;

        setSubmitting(true);
        try {
            const action = status === 'RESOLVED' ? 'resolve' : 'close';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/${selectedTicket.ticketId}/${action}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchTicketDetails(selectedTicket.ticketId);
            } else {
                alert(data.message || `Failed to ${action} ticket`);
            }
        } catch (error) {
            console.error(`Failed to update status to ${status}`, error);
            alert('Error updating status.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTicket || !window.confirm('Are you sure you want to completely delete this ticket? This action cannot be undone.')) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/${selectedTicket.ticketId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Remove from list and unselect
                setTickets(prev => prev.filter(t => t.ticketId !== selectedTicket.ticketId));
                setSelectedTicket(null);
            } else {
                alert(data.message || 'Failed to delete ticket');
            }
        } catch (error) {
            console.error('Failed to delete ticket', error);
            alert('Error deleting ticket.');
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
                <div className="flex items-center justify-between">
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
                                    {selectedTicket.status}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                By {selectedTicket.username} ({selectedTicket.email}) • ID: {selectedTicket.ticketId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'RESOLVED' && (
                            <button
                                onClick={() => handleUpdateStatus('RESOLVED')}
                                disabled={submitting}
                                className="px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg hover:bg-neon-green/30 transition-colors flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                            >
                                <RiCheckLine /> Resolve
                            </button>
                        )}
                        {selectedTicket.status !== 'CLOSED' && (
                            <button
                                onClick={() => handleUpdateStatus('CLOSED')}
                                disabled={submitting}
                                className="px-4 py-2 bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 rounded-lg hover:bg-yellow-500/30 transition-colors flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                            >
                                <RiCloseLine /> Close
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={submitting}
                            className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                        >
                            <RiDeleteBinLine /> Delete
                        </button>
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
                                <div key={msg.id} className={`flex ${msg.senderRole === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl p-4 ${msg.senderRole === 'ADMIN'
                                        ? 'bg-neon-green/20 text-white rounded-tr-none border border-neon-green/30'
                                        : 'bg-white/10 text-white rounded-tl-none border border-white/20'
                                        }`}>
                                        <div className="mb-1 text-xs font-bold opacity-70">
                                            {msg.senderRole === 'ADMIN' ? 'Admin' : selectedTicket.username}
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                                        <div className="text-xs mt-2 opacity-50">
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
                                    placeholder="Type your reply to the user here..."
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">
                    SUPPORT TICKETS
                </h1>
                <p className="text-gray-400">Manage all user inquiries and support requests</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                <div className="flex-1 min-w-[200px] relative">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search username, email or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <RiFilter3Line className="text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-neon-green/50 min-w-[140px]"
                    >
                        <option value="ALL">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
                <div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-neon-green/50 min-w-[140px]"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="general">General</option>
                        <option value="payment">Payment</option>
                        <option value="registration">Registration</option>
                        <option value="technical">Technical</option>
                    </select>
                </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                    <div className="text-center py-12 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm">
                        <RiQuestionLine className="text-6xl text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">No tickets found matching your filters.</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket, idx) => (
                        <GlowCard
                            key={ticket.ticketId}
                            delay={idx * 0.05}
                            className="!p-4 cursor-pointer hover:border-neon-green/50 transition-colors"
                            onClick={() => {
                                setSelectedTicket(ticket);
                                fetchTicketDetails(ticket.ticketId);
                            }}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-white truncate">{ticket.subject}</h3>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusBadge(ticket.status)} shrink-0`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="truncate">{ticket.username} ({ticket.email})</span>
                                        <span>•</span>
                                        <span className="uppercase text-gray-300 bg-white/5 px-2 py-0.5 rounded">{ticket.category}</span>
                                        <span>•</span>
                                        <span>Updated: {new Date(ticket.lastMessageAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white text-sm font-semibold whitespace-nowrap">
                                        View Ticket
                                    </button>
                                </div>
                            </div>
                        </GlowCard>
                    ))
                )}
            </div>
        </div>
    );
}
