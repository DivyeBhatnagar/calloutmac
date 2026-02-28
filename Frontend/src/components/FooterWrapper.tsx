"use client";

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function FooterWrapper() {
    const pathname = usePathname();

    // Hide footer on auth pages
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage) {
        return null;
    }

    return <Footer />;
}
