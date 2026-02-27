"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import NeonButton from '@/components/NeonButton';
import Link from 'next/link';
import { RiMailFill, RiLockPasswordFill, RiAlertFill, RiUserFill, RiPhoneFill } from 'react-icons/ri';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password
            });

            if (response.data.success) {
                router.push('/login?registered=true');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden py-12 selection:bg-neon-green/30 selection:text-neon-green">

            {/* Animated BG */}
            <div className="absolute inset-0 z-0">
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-neon-green/10 rounded-full blur-[150px] opacity-40 mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10 px-4"
            >
                <div className="text-center mb-8">
                    <h1 className="font-orbitron text-3xl font-black text-white glow-text tracking-widest mb-2">OPERATIVE REGISTRATION</h1>
                    <p className="text-gray-400 text-sm">Create your Callout ID</p>
                </div>

                <GlowCard className="w-full">
                    <form onSubmit={handleRegister} className="space-y-4">

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-start gap-3 text-red-400">
                                <RiAlertFill className="text-lg flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <RiUserFill className="text-gray-500 group-focus-within:text-neon-green transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-sans"
                                placeholder="Gamer Tag"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <RiMailFill className="text-gray-500 group-focus-within:text-neon-green transition-colors" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-sans"
                                placeholder="Email Address"
                                required
                            />
                        </div>

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
                                placeholder="Phone Number (Optional)"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <RiLockPasswordFill className="text-gray-500 group-focus-within:text-neon-green transition-colors" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-sans"
                                placeholder="Access Code"
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <RiLockPasswordFill className="text-gray-500 group-focus-within:text-neon-green transition-colors" />
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-sans"
                                placeholder="Confirm Access Code"
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <NeonButton
                                type="submit"
                                fullWidth
                                disabled={isLoading}
                                className={isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                            >
                                {isLoading ? 'Processing...' : 'ESTABLISH LINK'}
                            </NeonButton>
                        </div>

                        <div className="text-center pt-4 border-t border-white/10">
                            <p className="text-gray-400 text-sm">
                                Already established?{' '}
                                <Link href="/login" className="text-neon-green hover:text-white transition-colors glow-text">
                                    Login Here
                                </Link>
                            </p>
                        </div>
                    </form>
                </GlowCard>
            </motion.div>
        </div>
    );
}
