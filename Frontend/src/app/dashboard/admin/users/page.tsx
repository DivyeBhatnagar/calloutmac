"use client";

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { RiDeleteBinLine, RiShieldUserLine, RiUserLine } from 'react-icons/ri';
import GlowCard from '@/components/GlowCard';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const stats = useMemo(() => {
        const adminCount = users.filter(u => u.role?.toUpperCase() === 'ADMIN').length;
        const userCount = users.length - adminCount;
        return { total: users.length, admins: adminCount, users: userCount };
    }, [users]);

    const handleRoleChange = async (id: string, currentRole: string) => {
        const newRole = currentRole?.toUpperCase() === 'ADMIN' ? 'USER' : 'ADMIN';
        const action = newRole === 'ADMIN' ? 'promote this user to Admin' : 'downgrade this Admin to User';

        if (!confirm(`Are you sure you want to ${action}?`)) return;

        try {
            await api.patch(`/admin/users/${id}/role`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error("Failed to update user role", error);
            alert("Failed to update user role");
        }
    };

    const handleDelete = async (id: string, role: string) => {
        if (role?.toUpperCase() === 'ADMIN') {
            alert("Cannot delete an Admin account.");
            return;
        }
        if (!confirm('Are you sure you want to PERMANENTLY delete this operative and all associated data?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    if (loading) return <div className="h-32 bg-white/5 animate-pulse rounded-xl"></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider glow-text mb-2">OPERATIVES NETWORK</h1>
                <p className="text-gray-400">Global listing and management of all registered users on the platform.</p>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlowCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm tracking-widest uppercase mb-1">Total Users</p>
                            <h3 className="text-3xl font-orbitron font-bold text-white">{stats.total}</h3>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 text-blue-400 border border-white/10">
                            <RiUserLine className="text-2xl" />
                        </div>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm tracking-widest uppercase mb-1">Total Admins</p>
                            <h3 className="text-3xl font-orbitron font-bold text-neon-green">{stats.admins}</h3>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 text-neon-green border border-white/10">
                            <RiShieldUserLine className="text-2xl" />
                        </div>
                    </div>
                </GlowCard>
                <GlowCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm tracking-widest uppercase mb-1">Standard Users</p>
                            <h3 className="text-3xl font-orbitron font-bold text-purple-400">{stats.users}</h3>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 text-purple-400 border border-white/10">
                            <RiUserLine className="text-2xl" />
                        </div>
                    </div>
                </GlowCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map((user) => (
                    <div key={user.id} className="bg-black/40 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-white/5 border border-white/20 flex items-center justify-center font-orbitron font-bold text-lg text-white">
                                {user.username[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase">{user.username}</h4>
                                <p className="text-xs text-gray-500">{user.email}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${user.role?.toUpperCase() === 'ADMIN' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                        {user.role}
                                    </span>
                                    {user.createdAt && <span className="text-[10px] text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={() => handleRoleChange(user.id, user.role)}
                                title={user.role?.toUpperCase() === 'ADMIN' ? "Downgrade to User" : "Promote to Admin"}
                                className={`p-2 rounded transition-all ${user.role?.toUpperCase() === 'ADMIN' ? 'text-orange-400 hover:bg-orange-500/10' : 'text-neon-green hover:bg-neon-green/10'}`}
                            >
                                <RiShieldUserLine />
                            </button>
                            {user.role?.toUpperCase() !== 'ADMIN' && (
                                <button
                                    onClick={() => handleDelete(user.id, user.role)}
                                    title="Delete User"
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                >
                                    <RiDeleteBinLine />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
