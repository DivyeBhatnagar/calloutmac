"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { RiLogoutBoxLine, RiDashboardLine, RiShieldUserLine, RiUserLine } from "react-icons/ri";

export function Header() {
    const { user, logout, loading, viewMode, toggleViewMode } = useAuth();

    return (
        <header className="fixed top-0 w-full border-b border-neon-green/20 bg-black/80 backdrop-blur-md z-50">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="CallOut Esports Logo" width={40} height={40} className="object-contain" />
                    <div className="text-2xl font-black font-orbitron tracking-widest text-white">
                        CALL<span className="text-neon-green">OUT</span>
                    </div>
                </Link>
                <nav className="hidden md:flex items-center gap-8 font-mono text-sm uppercase tracking-wider text-gray-400">
                    <Link href="/about" className="hover:text-neon-green transition-colors">About</Link>
                    <a href="#tournaments" className="hover:text-neon-green transition-colors">Tournaments</a>
                    <a href="#games" className="hover:text-neon-green transition-colors">Games</a>
                    <a href="#leaderboard" className="hover:text-neon-green transition-colors">Leaderboard</a>
                </nav>
                
                {!loading && (
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                                    <span className="text-white">{user.username}</span>
                                    {user.role.toUpperCase() === 'ADMIN' && (
                                        <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded flex items-center gap-1">
                                            <RiShieldUserLine />
                                            ADMIN
                                        </span>
                                    )}
                                </div>

                                {/* Admin Mode Toggle - Only visible to admins */}
                                {user.role.toUpperCase() === 'ADMIN' && (
                                    <button
                                        onClick={toggleViewMode}
                                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all font-mono text-sm ${
                                            viewMode === 'ADMIN'
                                                ? 'bg-neon-green/20 text-neon-green border-neon-green/50 hover:bg-neon-green/30'
                                                : 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'
                                        }`}
                                        title={`Switch to ${viewMode === 'ADMIN' ? 'User' : 'Admin'} Mode`}
                                    >
                                        {viewMode === 'ADMIN' ? (
                                            <>
                                                <RiShieldUserLine className="text-lg" />
                                                <span className="hidden lg:inline">ADMIN MODE</span>
                                            </>
                                        ) : (
                                            <>
                                                <RiUserLine className="text-lg" />
                                                <span className="hidden lg:inline">USER MODE</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                <Link 
                                    href={viewMode === 'ADMIN' ? '/dashboard/admin' : '/dashboard'} 
                                    className="flex items-center gap-2 text-sm font-mono text-white hover:text-neon-green px-4 py-2 transition-colors"
                                >
                                    <RiDashboardLine />
                                    <span className="hidden lg:inline">DASHBOARD</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 border border-red-500 text-red-500 text-sm font-mono px-4 py-2 hover:bg-red-500 hover:text-white transition-all rounded-lg"
                                >
                                    <RiLogoutBoxLine />
                                    <span className="hidden lg:inline">LOGOUT</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="hidden md:block text-sm font-mono text-white hover:text-neon-green px-4 py-2 transition-colors">
                                    LOG IN
                                </Link>
                                <Link href="/register" className="border border-neon-green text-neon-green text-sm font-mono px-6 py-2 hover:bg-neon-green hover:text-black transition-all neon-shadow text-center rounded-lg">
                                    SIGN UP
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
