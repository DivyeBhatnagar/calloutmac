"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import NeonButton from '@/components/NeonButton';
import { RiAlertFill } from 'react-icons/ri';

export default function RegisterTournament() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const [formData, setFormData] = useState({
        teamName: '',
        iglName: '',
        iglContact: '',
        player2: '',
        player3: '',
        player4: '',
        substitute: ''
    });

    useEffect(() => {
        const fetchActiveTournaments = async () => {
            try {
                const res = await api.get('/tournaments');
                if (res.data.success) {
                    const activeOnly = res.data.data.filter((t: any) => t.status === 'ACTIVE');
                    setTournaments(activeOnly);
                }
            } catch (error) {
                console.error("Failed to fetch tournaments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActiveTournaments();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTournamentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const t = tournaments.find(t => t.id === e.target.value);
        setSelectedTournament(t || null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTournament) {
            setError('Please select a tournament');
            return;
        }

        setSubmitting(true);
        setError('');

        const playerNames = [formData.iglName];
        if (formData.player2) playerNames.push(formData.player2);
        if (formData.player3) playerNames.push(formData.player3);
        if (formData.player4) playerNames.push(formData.player4);
        if (formData.substitute) playerNames.push(formData.substitute);

        try {
            const payload = {
                tournamentId: selectedTournament.id,
                teamName: formData.teamName,
                iglName: formData.iglName,
                iglContact: formData.iglContact,
                playerNames
            };

            const res = await api.post('/registrations', payload);

            if (res.data.success) {
                router.push('/dashboard/tournaments');
                // Note: Razorpay order wrapper would go here for paid tournaments
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">NEW DEPLOYMENT</h1>
                <p className="text-gray-400">Register your squad for an upcoming active tournament.</p>
            </div>

            <GlowCard>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-start gap-3 text-red-400">
                            <RiAlertFill className="text-xl flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Select Operation</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                                onChange={handleTournamentSelect}
                                required
                                defaultValue=""
                            >
                                <option value="" disabled>-- Choose a Tournament --</option>
                                {tournaments.map(t => (
                                    <option key={t.id} value={t.id} className="bg-gray-900 text-white">
                                        {t.name} (Entry: ₹{t.entryFee})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 capitalize tracking-wide mb-2">Squad Name</label>
                                <input
                                    type="text"
                                    name="teamName"
                                    value={formData.teamName}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 capitalize tracking-wide mb-2">IGL Contact (Discord/Phone)</label>
                                <input
                                    type="text"
                                    name="iglContact"
                                    value={formData.iglContact}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="border-t border-white/10 my-6"></div>
                        <h3 className="text-lg font-orbitron font-bold text-white tracking-wide mb-4">Roster</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">In-Game Leader (IGL)</label>
                                <input
                                    type="text"
                                    name="iglName"
                                    value={formData.iglName}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Player 2</label>
                                <input
                                    type="text"
                                    name="player2"
                                    value={formData.player2}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Player 3</label>
                                <input
                                    type="text"
                                    name="player3"
                                    value={formData.player3}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Player 4</label>
                                <input
                                    type="text"
                                    name="player4"
                                    value={formData.player4}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Substitute (Optional)</label>
                                <input
                                    type="text"
                                    name="substitute"
                                    value={formData.substitute}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/10 flex justify-end">
                        <NeonButton
                            type="submit"
                            disabled={submitting || loading || tournaments.length === 0}
                            className={submitting || tournaments.length === 0 ? 'opacity-70 cursor-not-allowed' : ''}
                        >
                            {submitting ? 'Transmitting Data...' : 'SECURE DROPPING POINT'}
                        </NeonButton>
                    </div>
                </form>
            </GlowCard>
        </div>
    );
}
