"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { RiDeleteBinLine } from 'react-icons/ri';

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

    const handleDelete = async (id: string, role: string) => {
        if (role === 'ADMIN') {
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
                <p className="text-gray-400">Global listing of all registered users on the platform.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map((user) => (
                    <div key={user.id} className="bg-black/40 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-white/5 border border-white/20 flex items-center justify-center font-orbitron font-bold text-lg text-white">
                                {user.username[0].toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase">{user.username}</h4>
                                <p className="text-xs text-gray-500">{user.email}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                        {user.role}
                                    </span>
                                    <span className="text-[10px] text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        {user.role !== 'ADMIN' && (
                            <button
                                onClick={() => handleDelete(user.id, user.role)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                            >
                                <RiDeleteBinLine />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
