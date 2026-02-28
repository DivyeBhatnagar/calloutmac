"use client";

import AdminRoute from '@/components/AdminRoute';

export default function AdminDashboardRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRoute>
            {children}
        </AdminRoute>
    );
}
