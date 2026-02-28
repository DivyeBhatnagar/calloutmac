
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn
 * 
 * Standard utility for tailwind class merging.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * resolveImageUrl
 * 
 * Takes a URL or path and returns a full URL.
 * - If it's already a full URL (starts with http), returns it as is.
 * - If it starts with /uploads or /qr, prefixes it with the backend API URL.
 * - Otherwise, returns it as is or handle as needed.
 */
export function resolveImageUrl(url: string | undefined | null): string {
    if (!url) return '';

    // If it's already a full URL (Google Cloud Storage), return it as is
    if (url.startsWith('http')) {
        return url;
    }

    // If it's a local path from our backend fallback
    if (url.startsWith('/uploads') || url.startsWith('/qr') || url.startsWith('/Media')) {
        const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
        return `${backendUrl}${url}`;
    }

    return url;
}
