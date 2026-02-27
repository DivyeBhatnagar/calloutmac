"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import NeonButton from '@/components/NeonButton';
import { RiDeleteBinLine, RiEditLine, RiAddLine } from 'react-icons/ri';

export default function AdminTournamentsPage() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        game: '',
        entryFee: 0,
        prizePool: 0,
        maxSlots: 0,
        startDate: '',
        status: 'UPCOMING'
    });

    const fetchTournaments = async () => {
        try {
            const res = await api.get('/tournaments');
            if (res.data.success) {
                setTournaments(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch tournaments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleEdit = (t: any) => {
        setFormData({
            name: t.name,
            game: t.game,
            entryFee: t.entryFee,
            prizePool: t.prizePool,
            maxSlots: t.maxSlots,
            startDate: new Date(t.startDate).toISOString().split('T')[0],
            status: t.status
        });
        setEditingId(t.id);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tournament?')) return;
        try {
            await api.delete(`/admin/tournaments/${id}`);
            fetchTournaments();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString()
            };

            if (editingId) {
                await api.put(`/admin/tournaments/${editingId}`, payload);
            } else {
                await api.post('/admin/tournaments', payload);
            }

            setIsFormOpen(false);
            setEditingId(null);
            setFormData({ name: '', game: '', entryFee: 0, prizePool: 0, maxSlots: 0, startDate: '', status: 'UPCOMING' });
            fetchTournaments();
        } catch (error) {
            console.error("Form submission failed", error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">DEPLOYMENTS MANAGER</h1>
                    <p className="text-gray-400">Create and configure tournament operations.</p>
                </div>
                <NeonButton onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); }}>
                    <span className="flex items-center gap-2"><RiAddLine /> {isFormOpen ? 'CANCEL' : 'NEW DEPLOYMENT'}</span>
                </NeonButton>
            </div>

            {isFormOpen && (
                <GlowCard className="mb-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-xl font-bold text-neon-green mb-4">{editingId ? 'Edit Deployment' : 'Create Deployment'}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-neon-green" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Game</label>
                                <input type="text" name="game" value={formData.game} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-neon-green" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Start Date</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-neon-green" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Entry Fee (₹)</label>
                                <input type="number" name="entryFee" value={formData.entryFee} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-neon-green" required min={0} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Prize Pool (₹)</label>
                                <input type="number" name="prizePool" value={formData.prizePool} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-neon-green" required min={0} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Max Slots</label>
                                <input type="number" name="maxSlots" value={formData.maxSlots} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-neon-green" required min={1} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-gray-900 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-neon-green">
                                    <option value="UPCOMING">UPCOMING</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 mt-4 border-t border-white/10">
                            <NeonButton type="submit">{editingId ? 'UPDATE' : 'DEPLOY'}</NeonButton>
                        </div>
                    </form>
                </GlowCard>
            )}

            {loading ? (
                <div className="h-32 bg-white/5 animate-pulse rounded-xl"></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((t) => (
                        <GlowCard key={t.id} className="!p-5">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white font-orbitron">{t.name}</h3>
                                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${t.status === 'ACTIVE' ? 'bg-neon-green/10 text-neon-green' :
                                        t.status === 'CLOSED' ? 'bg-red-500/10 text-red-500' :
                                            'bg-yellow-500/10 text-yellow-500'
                                    }`}>{t.status}</span>
                            </div>
                            <div className="space-y-2 mb-6 text-sm text-gray-400">
                                <p>Game: <span className="text-white">{t.game}</span></p>
                                <p>Entry: <span className="text-neon-green">₹{t.entryFee}</span> | Pool: <span className="text-yellow-400">₹{t.prizePool}</span></p>
                                <p>Slots: <span className="text-white">{t._count?.registrations || 0} / {t.maxSlots}</span></p>
                                <p>Start: <span className="text-gray-300">{new Date(t.startDate).toLocaleDateString()}</span></p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button onClick={() => handleEdit(t)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"><RiEditLine /></button>
                                <button onClick={() => handleDelete(t.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors"><RiDeleteBinLine /></button>
                            </div>
                        </GlowCard>
                    ))}
                </div>
            )}
        </div>
    );
}
