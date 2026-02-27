"use client";

import AdminRoute from '@/components/AdminRoute';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminDashboardRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRoute>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </AdminRoute>
    );
}
