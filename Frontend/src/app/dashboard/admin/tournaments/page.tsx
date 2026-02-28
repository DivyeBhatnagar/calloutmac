"use client";

import { useState, useMemo } from 'react';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { orderBy, doc, setDoc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';
import GlowCard from '@/components/GlowCard';
import { RiTrophyLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiCloseLine, RiUploadLine, RiImageLine } from 'react-icons/ri';
import { Tournament } from '@/types';

interface TournamentForm {
    name: string;
    logoUrl: string;
    description: string;
    status: 'draft' | 'active' | 'closed';
    maxSlots: number;
    paymentAmount: number;
    colleges: Array<{ id: string; name: string; logoUrl?: string }>;
    games: Array<{ id: string; name: string; logoUrl?: string }>;
}

export default function AdminTournamentsPage() {
    const [showModal, setShowModal] = useState(false);
    const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
    const [saving, setSaving] = useState(false);
    
    const [form, setForm] = useState<TournamentForm>({
        name: '',
        logoUrl: '',
        description: '',
        status: 'draft',
        maxSlots: 0,
        paymentAmount: 0,
        colleges: [],
        games: []
    });

    const [collegeName, setCollegeName] = useState('');
    const [collegeLogoFile, setCollegeLogoFile] = useState<File | null>(null);
    const [gameName, setGameName] = useState('');
    const [gameLogoFile, setGameLogoFile] = useState<File | null>(null);
    const [tournamentLogoFile, setTournamentLogoFile] = useState<File | null>(null);

    const { data: tournaments, loading } = useRealtimeCollection<Tournament>('tournaments', [
        orderBy('createdAt', 'desc')
    ]);

    const stats = useMemo(() => {
        const total = tournaments.length;
        const active = tournaments.filter(t => t.status === 'active').length;
        const draft = tournaments.filter(t => t.status === 'draft').length;
        const closed = tournaments.filter(t => t.status === 'closed').length;
        return { total, active, draft, closed };
    }, [tournaments]);

    const openCreateModal = () => {
        setEditingTournament(null);
        setForm({
            name: '',
            logoUrl: '',
            description: '',
            status: 'draft',
            maxSlots: 0,
            paymentAmount: 0,
            colleges: [],
            games: []
        });
        setTournamentLogoFile(null);
        setShowModal(true);
    };

    const openEditModal = (tournament: Tournament) => {
        setEditingTournament(tournament);
        setForm({
            name: tournament.name,
            logoUrl: tournament.logoUrl || '',
            description: tournament.description,
            status: tournament.status,
            maxSlots: tournament.maxSlots,
            paymentAmount: tournament.paymentAmount,
            colleges: tournament.colleges || [],
            games: tournament.games || []
        });
        setTournamentLogoFile(null);
        setShowModal(true);
    };

    const uploadImage = async (file: File, path: string): Promise<string> => {
        const storage = getStorage(app);
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const addCollege = async () => {
        if (!collegeName.trim()) {
            alert('College name is required');
            return;
        }

        let logoUrl: string | undefined = undefined;
        if (collegeLogoFile) {
            try {
                logoUrl = await uploadImage(collegeLogoFile, 'colleges');
            } catch (error) {
                console.error('Error uploading college logo:', error);
                alert('Failed to upload college logo');
                return;
            }
        }

        const newCollege = {
            id: `college_${Date.now()}`,
            name: collegeName,
            logoUrl
        };

        setForm(prev => ({
            ...prev,
            colleges: [...prev.colleges, newCollege]
        }));

        setCollegeName('');
        setCollegeLogoFile(null);
    };

    const removeCollege = (id: string) => {
        setForm(prev => ({
            ...prev,
            colleges: prev.colleges.filter(c => c.id !== id)
        }));
    };

    const addGame = async () => {
        if (!gameName.trim()) {
            alert('Game name is required');
            return;
        }

        let logoUrl: string | undefined = undefined;
        if (gameLogoFile) {
            try {
                logoUrl = await uploadImage(gameLogoFile, 'games');
            } catch (error) {
                console.error('Error uploading game logo:', error);
                alert('Failed to upload game logo');
                return;
            }
        }

        const newGame = {
            id: `game_${Date.now()}`,
            name: gameName,
            logoUrl
        };

        setForm(prev => ({
            ...prev,
            games: [...prev.games, newGame]
        }));

        setGameName('');
        setGameLogoFile(null);
    };

    const removeGame = (id: string) => {
        setForm(prev => ({
            ...prev,
            games: prev.games.filter(g => g.id !== id)
        }));
    };

    const handleSave = async (publishNow: boolean = false) => {
        // Validation
        if (!form.name.trim()) {
            alert('Tournament name is required');
            return;
        }

        if (form.games.length === 0) {
            alert('At least one game is required');
            return;
        }

        if (form.maxSlots < 0 || form.maxSlots > 1000) {
            alert('Max slots must be between 0 and 1000');
            return;
        }

        if (form.paymentAmount < 0 || form.paymentAmount > 100000) {
            alert('Payment amount must be between 0 and 100,000');
            return;
        }

        setSaving(true);
        try {
            const db = getFirestore(app);
            
            let logoUrl = form.logoUrl;
            if (tournamentLogoFile) {
                logoUrl = await uploadImage(tournamentLogoFile, 'tournaments');
            }

            const tournamentData = {
                name: form.name,
                logoUrl,
                description: form.description,
                status: publishNow ? 'active' : form.status,
                maxSlots: form.maxSlots,
                paymentAmount: form.paymentAmount,
                currentRegistrations: editingTournament?.currentRegistrations || 0,
                colleges: form.colleges,
                games: form.games,
                updatedAt: new Date().toISOString()
            };

            if (editingTournament) {
                // Update existing tournament
                await updateDoc(doc(db, 'tournaments', editingTournament.id), tournamentData);
                alert('Tournament updated successfully!');
            } else {
                // Create new tournament
                const newDocRef = doc(db, 'tournaments', `tournament_${Date.now()}`);
                await setDoc(newDocRef, {
                    ...tournamentData,
                    createdAt: new Date().toISOString()
                });
                alert('Tournament created successfully!');
            }

            setShowModal(false);
        } catch (error) {
            console.error('Error saving tournament:', error);
            alert('Failed to save tournament. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (tournament: Tournament) => {
        if (tournament.currentRegistrations > 0) {
            alert('Cannot delete tournament with existing registrations');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${tournament.name}"?`)) {
            return;
        }

        try {
            const db = getFirestore(app);
            await deleteDoc(doc(db, 'tournaments', tournament.id));
            alert('Tournament deleted successfully!');
        } catch (error) {
            console.error('Error deleting tournament:', error);
            alert('Failed to delete tournament');
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">
                        TOURNAMENT MANAGEMENT
                    </h1>
                    <p className="text-gray-400">Create and manage tournaments • {tournaments.length} total</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg hover:bg-neon-green/30 transition-colors font-semibold"
                >
                    <RiAddLine className="text-xl" /> Create Tournament
                </button>
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
                        <p className="text-gray-400 text-sm uppercase mb-1">Active</p>
                        <h3 className="text-2xl font-bold text-neon-green">{stats.active}</h3>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div>
                        <p className="text-gray-400 text-sm uppercase mb-1">Draft</p>
                        <h3 className="text-2xl font-bold text-yellow-400">{stats.draft}</h3>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div>
                        <p className="text-gray-400 text-sm uppercase mb-1">Closed</p>
                        <h3 className="text-2xl font-bold text-gray-400">{stats.closed}</h3>
                    </div>
                </GlowCard>
            </div>

            {/* Tournaments List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.length === 0 ? (
                    <div className="col-span-full text-center py-12 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm">
                        <p className="text-gray-500">No tournaments yet. Create your first tournament!</p>
                    </div>
                ) : (
                    tournaments.map((tournament, idx) => (
                        <GlowCard key={tournament.id} delay={idx * 0.05}>
                            <div className="space-y-4">
                                {tournament.logoUrl && (
                                    <img src={tournament.logoUrl} alt={tournament.name} className="w-full h-40 object-cover rounded-lg" />
                                )}
                                <div>
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                                            tournament.status === 'active' ? 'bg-neon-green/20 text-neon-green' :
                                            tournament.status === 'draft' ? 'bg-yellow-500/20 text-yellow-500' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {tournament.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{tournament.description}</p>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Registrations:</span>
                                            <span className="text-white font-semibold">
                                                {tournament.currentRegistrations}/{tournament.maxSlots || '∞'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Entry Fee:</span>
                                            <span className="text-neon-green font-semibold">
                                                {tournament.paymentAmount === 0 ? '🎉 Free' : `₹${tournament.paymentAmount}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Games:</span>
                                            <span className="text-white">{tournament.games?.length || 0}</span>
                                        </div>
                                        {tournament.colleges && tournament.colleges.length > 0 ? (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Colleges:</span>
                                                <span className="text-white">{tournament.colleges.length}</span>
                                            </div>
                                        ) : (
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Open Tournament</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-white/10">
                                    <button
                                        onClick={() => openEditModal(tournament)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white"
                                    >
                                        <RiEditLine /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tournament)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors text-red-400"
                                        disabled={tournament.currentRegistrations > 0}
                                    >
                                        <RiDeleteBinLine />
                                    </button>
                                </div>
                            </div>
                        </GlowCard>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowModal(false)}>
                    <div className="bg-gray-900 border border-white/20 rounded-xl max-w-4xl w-full my-8"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
                            <h2 className="text-2xl font-orbitron font-bold text-white">
                                {editingTournament ? 'Edit Tournament' : 'Create Tournament'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <RiCloseLine className="text-2xl" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Basic Details */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Basic Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Tournament Name *</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({...form, name: e.target.value})}
                                            placeholder="e.g., Campus Showdown 2024"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Tournament Logo</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setTournamentLogoFile(e.target.files?.[0] || null)}
                                                className="hidden"
                                                id="tournament-logo"
                                            />
                                            <label
                                                htmlFor="tournament-logo"
                                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors text-white"
                                            >
                                                <RiUploadLine /> Upload Logo
                                            </label>
                                            {(tournamentLogoFile || form.logoUrl) && (
                                                <span className="text-sm text-gray-400">
                                                    {tournamentLogoFile ? tournamentLogoFile.name : 'Current logo set'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Description</label>
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => setForm({...form, description: e.target.value})}
                                            placeholder="Tournament details, rules, prizes..."
                                            rows={3}
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Status *</label>
                                            <select
                                                value={form.status}
                                                onChange={(e) => setForm({...form, status: e.target.value as any})}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green/50"
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="active">Active</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Max Slots (0 = Unlimited) *</label>
                                            <input
                                                type="number"
                                                value={form.maxSlots}
                                                onChange={(e) => setForm({...form, maxSlots: parseInt(e.target.value) || 0})}
                                                min="0"
                                                max="1000"
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Entry Fee (₹) *</label>
                                            <input
                                                type="number"
                                                value={form.paymentAmount}
                                                onChange={(e) => setForm({...form, paymentAmount: parseInt(e.target.value) || 0})}
                                                min="0"
                                                max="100000"
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Colleges Section */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">College Setup (Optional)</h3>
                                <p className="text-sm text-gray-400 mb-4">Leave empty for open tournaments. Add colleges to restrict registration.</p>
                                
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={collegeName}
                                            onChange={(e) => setCollegeName(e.target.value)}
                                            placeholder="College name"
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setCollegeLogoFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="college-logo"
                                        />
                                        <label
                                            htmlFor="college-logo"
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors text-white"
                                        >
                                            <RiImageLine /> Logo
                                        </label>
                                        <button
                                            onClick={addCollege}
                                            className="px-6 py-2 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg hover:bg-neon-green/30 transition-colors"
                                        >
                                            Add College
                                        </button>
                                    </div>

                                    {form.colleges.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {form.colleges.map(college => (
                                                <div key={college.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                                    {college.logoUrl && (
                                                        <img src={college.logoUrl} alt={college.name} className="w-10 h-10 object-cover rounded" />
                                                    )}
                                                    <span className="flex-1 text-white">{college.name}</span>
                                                    <button
                                                        onClick={() => removeCollege(college.id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <RiCloseLine className="text-xl" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Games Section */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Game Selection (Required) *</h3>
                                <p className="text-sm text-gray-400 mb-4">At least one game is required.</p>
                                
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={gameName}
                                            onChange={(e) => setGameName(e.target.value)}
                                            placeholder="Game name (e.g., BGMI, Free Fire)"
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setGameLogoFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="game-logo"
                                        />
                                        <label
                                            htmlFor="game-logo"
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors text-white"
                                        >
                                            <RiImageLine /> Logo
                                        </label>
                                        <button
                                            onClick={addGame}
                                            className="px-6 py-2 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg hover:bg-neon-green/30 transition-colors"
                                        >
                                            Add Game
                                        </button>
                                    </div>

                                    {form.games.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {form.games.map(game => (
                                                <div key={game.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                                    {game.logoUrl && (
                                                        <img src={game.logoUrl} alt={game.name} className="w-10 h-10 object-cover rounded" />
                                                    )}
                                                    <span className="flex-1 text-white">{game.name}</span>
                                                    <button
                                                        onClick={() => removeGame(game.id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <RiCloseLine className="text-xl" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex gap-4">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white font-semibold disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : editingTournament ? 'Update' : 'Save as Draft'}
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg hover:bg-neon-green/30 transition-colors font-semibold disabled:opacity-50"
                            >
                                {saving ? 'Publishing...' : editingTournament ? 'Update & Publish' : 'Publish Tournament'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
