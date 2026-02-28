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

            {/* Animated BG - Subtle Professional Variant */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/5 rounded-full blur-[150px] opacity-30 mix-blend-screen pointer-events-none"></div>
                <div className="absolute inset-0 bg-[#0A0A0A] bg-opacity-90"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-lg z-10 px-4"
            >
                <div className="text-center mb-10">
                    <h1 className="font-orbitron font-bold text-3xl text-white tracking-wide mb-2">Welcome Back</h1>
                    <p className="text-gray-400 font-sans">Log in to your CallOut account</p>
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
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/40 focus:bg-white/10 transition-all font-sans"
                                    placeholder="Email Address"
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
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/40 focus:bg-white/10 transition-all font-sans"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-neon-green text-black font-bold font-sans py-3.5 px-4 rounded-lg transition-all shadow-[0_4px_14px_0_rgba(0,255,102,0.2)] hover:shadow-[0_6px_20px_rgba(0,255,102,0.3)] hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Verifying...' : 'Log In'}
                            </button>
                        </div>

                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-xs font-sans text-gray-500 uppercase tracking-wider">Or</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-medium font-sans py-3 px-4 rounded-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed border border-transparent hover:border-gray-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        <div className="text-center pt-6 border-t border-white/5 mt-4">
                            <p className="text-gray-400 font-sans text-sm">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-neon-green hover:text-white transition-colors font-medium">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </form>
                </GlowCard>
            </motion.div>
        </div>
    );
}
