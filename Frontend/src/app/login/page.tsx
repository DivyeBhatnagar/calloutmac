"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import GlowCard from '@/components/GlowCard';
import NeonButton from '@/components/NeonButton';
import Link from 'next/link';
import { RiMailFill, RiLockPasswordFill, RiAlertFill, RiGoogleFill } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                const { user, token } = response.data.data;
                login(user, token);
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login to Callout Server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            const response = await api.post('/auth/google', { idToken });

            if (response.data.success) {
                const { user, token } = response.data.data;
                login(user, token);
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error("Google Auth Error", err);
            setError(err.response?.data?.message || err.message || 'Google Authentication Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden selection:bg-neon-green/30 selection:text-neon-green">

            {/* Animated BG */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-green/10 rounded-full blur-[150px] opacity-50 mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10 px-4"
            >
                <div className="text-center mb-8">
                    <h1 className="font-orbitron text-4xl font-black text-white glow-text tracking-widest mb-2">CALLOUT</h1>
                    <p className="text-neon-green uppercase tracking-widest text-sm font-bold opacity-80">Command Center</p>
                </div>

                <GlowCard className="w-full">
                    <form onSubmit={handleLogin} className="space-y-6">

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-start gap-3 text-red-400">
                                <RiAlertFill className="text-xl flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <RiMailFill className="text-gray-500 group-focus-within:text-neon-green transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-sans"
                                    placeholder="Operative Email"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <RiLockPasswordFill className="text-gray-500 group-focus-within:text-neon-green transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-sans"
                                    placeholder="Access Code"
                                    required
                                />
                            </div>
                        </div>

                        <NeonButton
                            type="submit"
                            fullWidth
                            disabled={isLoading}
                            className={isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                        >
                            {isLoading ? 'Authenticating...' : 'INITIALIZE LINK'}
                        </NeonButton>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-xs font-orbitron font-bold text-gray-500 uppercase tracking-widest">Or</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black font-bold font-sans py-3 px-4 rounded-lg transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <RiGoogleFill className="text-xl text-red-500" />
                            <span>CONTINUE WITH GOOGLE</span>
                        </button>

                        <div className="text-center pt-4 border-t border-white/10">
                            <p className="text-gray-400 text-sm">
                                New to the platform?{' '}
                                <Link href="/register" className="text-neon-green hover:text-white transition-colors glow-text">
                                    Enlist Now
                                </Link>
                            </p>
                        </div>
                    </form>
                </GlowCard>
            </motion.div>
        </div>
    );
}
