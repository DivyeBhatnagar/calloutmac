"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { RiLogoutBoxLine, RiDashboardLine, RiShieldUserLine, RiUserLine, RiMenu3Line, RiCloseLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
    const { user, logout, loading, viewMode, toggleViewMode } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <header className="fixed top-0 w-full border-b border-neon-green/20 bg-black/80 backdrop-blur-md z-50">
            <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 sm:gap-3 group transition-transform hover:scale-105" onClick={() => setIsMobileMenuOpen(false)}>
                    <Image src="/logo.png" alt="CallOut Esports Logo" width={45} height={45} className="object-contain drop-shadow-[0_0_8px_rgba(0,255,102,0.3)] md:w-[55px] md:h-[55px]" />
                    <div className="text-xl md:text-2xl font-black font-orbitron tracking-widest flex items-center gap-1 sm:gap-2">
                        <span className="text-white">CALLOUT</span>
                        <span className="text-neon-green glow-text">ESPORTS</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8 font-mono text-sm uppercase tracking-wider text-gray-400">
                    <Link href="/about" className="hover:text-neon-green transition-colors">About</Link>
                    <Link href="/tournaments" className="hover:text-neon-green transition-colors">Tournaments</Link>
                    <Link href="/games" className="hover:text-neon-green transition-colors">Games</Link>
                </nav>

                {/* Desktop Auth / User Controls */}
                {!loading && (
                    <div className="hidden lg:flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span className="text-white">{user.username}</span>
                                    {user.role.toUpperCase() === 'ADMIN' && (
                                        <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded flex items-center gap-1">
                                            <RiShieldUserLine />
                                            ADMIN
                                        </span>
                                    )}
                                </div>

                                {user.role.toUpperCase() === 'ADMIN' && (
                                    <button
                                        onClick={toggleViewMode}
                                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all font-mono text-sm ${viewMode === 'ADMIN'
                                            ? 'bg-neon-green/20 text-neon-green border-neon-green/50 hover:bg-neon-green/30'
                                            : 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'
                                            }`}
                                        title={`Switch to ${viewMode === 'ADMIN' ? 'User' : 'Admin'} Mode`}
                                    >
                                        {viewMode === 'ADMIN' ? (
                                            <>
                                                <RiShieldUserLine className="text-lg" />
                                                <span>ADMIN MODE</span>
                                            </>
                                        ) : (
                                            <>
                                                <RiUserLine className="text-lg" />
                                                <span>USER MODE</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                <Link
                                    href={viewMode === 'ADMIN' ? '/dashboard/admin' : '/dashboard'}
                                    className="flex items-center gap-2 text-sm font-mono text-white hover:text-neon-green px-4 py-2 transition-colors"
                                >
                                    <RiDashboardLine />
                                    <span>DASHBOARD</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 border border-red-500 text-red-500 text-sm font-mono px-4 py-2 hover:bg-red-500 hover:text-white transition-all rounded-lg"
                                >
                                    <RiLogoutBoxLine />
                                    <span>LOGOUT</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-mono text-white hover:text-neon-green px-4 py-2 transition-colors">
                                    LOG IN
                                </Link>
                                <Link href="/register" className="border border-neon-green text-neon-green text-sm font-mono px-6 py-2 hover:bg-neon-green hover:text-black transition-all neon-shadow text-center rounded-lg">
                                    SIGN UP
                                </Link>
                            </>
                        )}
                    </div>
                )}

                {/* Mobile Hamburger Button */}
                <button
                    className="lg:hidden text-white text-3xl hover:text-neon-green transition-colors"
                    onClick={toggleMenu}
                >
                    {isMobileMenuOpen ? <RiCloseLine /> : <RiMenu3Line />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden absolute top-20 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-neon-green/20 overflow-hidden"
                    >
                        <div className="flex flex-col px-6 py-6 space-y-6">
                            {/* Mobile Nav Links */}
                            <nav className="flex flex-col space-y-4 font-mono text-base uppercase tracking-wider text-gray-300">
                                <Link href="/about" onClick={toggleMenu} className="hover:text-neon-green transition-colors w-full">About</Link>
                                <div className="h-px bg-white/10 w-full" />
                                <Link href="/tournaments" onClick={toggleMenu} className="hover:text-neon-green transition-colors w-full">Tournaments</Link>
                                <div className="h-px bg-white/10 w-full" />
                                <Link href="/games" onClick={toggleMenu} className="hover:text-neon-green transition-colors w-full">Games</Link>
                            </nav>

                            <div className="h-px bg-neon-green/20 w-full my-2" />

                            {/* Mobile Auth / User Controls */}
                            {!loading && (
                                <div className="flex flex-col space-y-4">
                                    {user ? (
                                        <>
                                            <div className="flex items-center gap-3 text-white mb-2">
                                                <div className="w-10 h-10 rounded-full border border-neon-green/50 flex items-center justify-center text-neon-green font-orbitron font-bold">
                                                    {user.username?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{user.username}</span>
                                                    <span className="text-xs text-gray-400">{user.email}</span>
                                                </div>
                                            </div>

                                            {user.role.toUpperCase() === 'ADMIN' && (
                                                <button
                                                    onClick={() => { toggleViewMode(); toggleMenu(); }}
                                                    className={`w-full flex justify-center items-center gap-2 px-4 py-3 border rounded-lg transition-all font-mono text-sm ${viewMode === 'ADMIN'
                                                        ? 'bg-neon-green/20 text-neon-green border-neon-green/50'
                                                        : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                                        }`}
                                                >
                                                    <RiShieldUserLine className="text-lg" />
                                                    <span>Switch to {viewMode === 'ADMIN' ? 'User' : 'Admin'}</span>
                                                </button>
                                            )}

                                            <Link
                                                href={viewMode === 'ADMIN' ? '/dashboard/admin' : '/dashboard'}
                                                onClick={toggleMenu}
                                                className="w-full flex justify-center items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all font-mono"
                                            >
                                                <RiDashboardLine className="text-lg" />
                                                <span>Dashboard</span>
                                            </Link>

                                            <button
                                                onClick={() => { logout(); toggleMenu(); }}
                                                className="w-full flex justify-center items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-500 font-mono px-4 py-3 rounded-lg"
                                            >
                                                <RiLogoutBoxLine className="text-lg" />
                                                <span>Logout</span>
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <Link href="/login" onClick={toggleMenu} className="w-full py-3 px-4 border border-white/20 rounded-lg text-center font-mono text-white hover:bg-white/5 transition-all">
                                                LOG IN
                                            </Link>
                                            <Link href="/register" onClick={toggleMenu} className="w-full py-3 px-4 border border-neon-green bg-neon-green/10 text-neon-green rounded-lg text-center font-mono hover:bg-neon-green hover:text-black transition-all">
                                                SIGN UP
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
