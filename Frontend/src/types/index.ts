export interface Tournament {
    id: string;
    name: string;
    description: string;
    posterUrl: string;
    posterThumbnailUrl?: string;
    logoUrl?: string; // keeping for backward compat

    status: 'DRAFT' | 'ACTIVE' | 'CLOSED';

    maxSlots: number;
    paymentAmount: number;
    currentRegistrations: number;

    supportedGames: Game[];
    allowedColleges: College[];
    collegesRestricted: boolean;
    registrationDeadline?: any;

    createdAt: any;
    updatedAt: any;
}

export interface College {
    id: string;
    name: string;
    logoUrl?: string;
}

export interface Game {
    id: string;
    name: string;
    logoUrl?: string;
}

export interface Registration {
    id: string;
    tournament?: string;
    tournamentId: string;
    college?: string;
    game?: string;
    username?: string;
    email?: string;
    userId: string;
    phoneNumber?: string;
    teamName: string;
    iglName: string;
    iglContact: string;
    playerIds: string[];
    playerNames: string[];
    playerCount?: number;
    registeredAt?: any;    // legacy field (kept for compat)
    createdAt?: any;       // new field written by completeWithPayment
    submittedAt?: any;
    status?: string;
    paymentStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
    paymentVerified: boolean;
    // Embedded payment proof (replaces separate payments collection)
    payment?: {
        transactionId: string;
        upiId?: string;
        bankName?: string;
        paymentDate?: string;
        paymentTime?: string;
        amount?: number;
        submittedAt?: any;
    };
    verifiedAt?: string;
    verifiedBy?: string;
    qrIndex?: number;
}

export interface Query {
    id: string;
    userId: string;
    username: string;
    email: string;
    subject: string;
    message: string;
    category: 'payment' | 'registration' | 'technical' | 'general';
    status: 'pending' | 'in-progress' | 'resolved';
    adminResponse?: string;
    createdAt: any;
    updatedAt: any;
}

export interface User {
    id: string;
    username: string;
    email: string;
    phoneNumber?: string;
    role: 'USER' | 'ADMIN';
    createdAt: any;
    lastLogin?: any;
}

export interface DashboardStats {
    totalTournamentsParticipated: number;
    activeRegistrations: number;
    pendingVerifications: number;
    completedTournaments: number;
}

export interface AdminStats {
    activeTournaments: number;
    totalRegistrations: number;
    platformUsers: number;
    supportQueries: number;
    revenueThisMonth: number;
    pendingVerifications: number;
    activeUsersToday: number;
}
