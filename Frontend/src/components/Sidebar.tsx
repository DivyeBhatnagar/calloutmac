"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
    RiDashboardFill,
    RiTrophyFill,
    RiAddCircleFill,
    RiMessage3Fill,
    RiUserFill,
    RiShieldUserFill,
    RiLogoutBoxFill,
    RiBarChartGroupedFill,
    RiTeamFill,
    RiArrowLeftRightLine
} from 'react-icons/ri';
import { motion } from 'framer-motion';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout, viewMode, toggleViewMode } = useAuth();

    const userLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: RiDashboardFill },
        { href: '/dashboard/tournaments', label: 'My Tournaments', icon: RiTrophyFill },
        { href: '/dashboard/register', label: 'Join Tournament', icon: RiAddCircleFill },
        { href: '/dashboard/queries', label: 'Support Queries', icon: RiMessage3Fill },
        { href: '/dashboard/profile', label: 'Profile', icon: RiUserFill },
    ];

    const adminLinks = [
        { href: '/dashboard/admin', label: 'Admin Stats', icon: RiShieldUserFill },
        { href: '/dashboard/admin/tournaments', label: 'Manage Tournaments', icon: RiTrophyFill },
        { href: '/dashboard/admin/registrations', label: 'Registrations', icon: RiAddCircleFill },
        { href: '/dashboard/admin/users', label: 'Users', icon: RiTeamFill },
        { href: '/dashboard/admin/queries', label: 'User Queries', icon: RiMessage3Fill },
        { href: '/dashboard/admin/analytics', label: 'Analytics', icon: RiBarChartGroupedFill },
    ];

    const links = viewMode === 'ADMIN' ? adminLinks : userLinks;

    return (
        <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-black/60 backdrop-blur-xl hidden md:flex flex-col h-full sticky top-0 min-h-screen">
            <div className="p-6 border-b border-white/10 mb-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded bg-neon-green/20 border border-neon-green/50 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,255,102,0.4)] transition-all">
                        <RiTrophyFill className="text-neon-green text-xl" />
                    </div>
                    <span className="font-orbitron font-bold text-xl text-white tracking-wider glow-text">CALLOUT</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {/* Mode Toggle for Admins */}
                {user?.role.toUpperCase() === 'ADMIN' && (
                    <div className="mb-4">
                        <button
                            onClick={toggleViewMode}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                viewMode === 'ADMIN'
                                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green/30 shadow-[0_0_15px_rgba(0,255,102,0.2)]'
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                            }`}
                        >
                            <RiArrowLeftRightLine className="text-xl" />
                            {viewMode === 'ADMIN' ? 'Switch to User' : 'Switch to Admin'}
                        </button>
                        <div className="h-px bg-white/10 my-4"></div>
                        
                        {/* Mode Indicator */}
                        <div className={`px-4 py-2 rounded-lg text-center text-sm font-semibold mb-2 ${
                            viewMode === 'ADMIN'
                                ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}>
                            {viewMode === 'ADMIN' ? '🛡️ ADMIN MODE' : '👤 USER MODE'}
                        </div>
                    </div>
                )}

                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 group overflow-hidden ${isActive
                                    ? 'text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-neon-green/10 border border-neon-green/30 rounded-lg shadow-[inset_0_0_15px_rgba(0,255,102,0.15)] z-0"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <Icon className={`text-xl relative z-10 ${isActive ? 'text-neon-green drop-shadow-[0_0_8px_rgba(0,255,102,0.8)]' : ''}`} />
                            <span className="relative z-10">{link.label}</span>

                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-neon-green/0 via-neon-green/5 to-neon-green/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 z-0"></div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10 mt-auto">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <RiLogoutBoxFill className="text-xl" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
