"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import GlowCard from '@/components/GlowCard';
import NeonButton from '@/components/NeonButton';
import { RiUserFill, RiPhoneFill, RiMailFill } from 'react-icons/ri';

export default function ProfilePage() {
    const { user, login, token } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        phoneNumber: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');

        try {
            const res = await api.put('/dashboard/profile', {
                phoneNumber: formData.phoneNumber
            });

            if (res.data.success) {
                setSuccess('Profile updated successfully');
                if (token && user) {
                    login({ ...user, ...res.data.data }, token); // update context
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">OPERATOR DOSSIER</h1>
                <p className="text-gray-400">View and manage your Callout ID credentials.</p>
            </div>

            <GlowCard>
                <form onSubmit={handleUpdate} className="space-y-6">

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 rounded-full border-2 border-neon-green bg-white/5 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                            <span className="font-orbitron text-4xl font-bold text-neon-green">
                                {user?.username?.[0]?.toUpperCase()}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white font-orbitron">{user?.username}</h2>
                        <span className="text-neon-green text-sm tracking-widest">{user?.role}</span>
                    </div>

                    {success && (
                        <div className="bg-neon-green/10 border border-neon-green/50 p-3 rounded-lg text-neon-green text-sm text-center">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="opacity-60 cursor-not-allowed">
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Gamer Tag (Cannot be changed)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <RiUserFill className="text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white cursor-not-allowed font-sans"
                                />
                            </div>
                        </div>

                        <div className="opacity-60 cursor-not-allowed">
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <RiMailFill className="text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white cursor-not-allowed font-sans"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Link</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <RiPhoneFill className="text-gray-500 group-focus-within:text-neon-green transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-sans"
                                    placeholder="Link Phone/Discord"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end">
                        <NeonButton type="submit" disabled={loading}>
                            {loading ? 'SYNCING...' : 'UPDATE DOSSIER'}
                        </NeonButton>
                    </div>
                </form>
            </GlowCard>
        </div>
    );
}
