"use client";

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function FooterWrapper() {
    const pathname = usePathname();

    // Hide footer on auth pages and dashboard
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isDashboard = pathname?.startsWith('/dashboard');

    if (isAuthPage || isDashboard) {
        return null;
    }

    return <Footer />;
}
