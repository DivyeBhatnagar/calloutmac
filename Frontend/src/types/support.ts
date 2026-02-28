export interface SupportMessage {
    id: string;
    senderId: string;
    senderRole: 'USER' | 'ADMIN';
    message: string;
    createdAt: string;
}

export interface SupportTicket {
    ticketId: string;
    userId: string;
    username: string;
    email: string;
    subject: string;
    category: 'payment' | 'registration' | 'technical' | 'general';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    createdAt: string;
    updatedAt: string;
    lastMessageAt: string;
}

export interface SupportTicketDetail {
    ticket: SupportTicket;
    messages: SupportMessage[];
}
