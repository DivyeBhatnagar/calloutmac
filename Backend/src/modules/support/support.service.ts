import { db } from '../../config/firebase.admin';

interface SupportTicket {
    userId: string;
    username: string;
    email: string;
    subject: string;
    category: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    createdAt: string;
    updatedAt: string;
    lastMessageAt: string;
}

export const supportService = {
    async createTicket(data: { userId: string, username: string, email: string, subject: string, category: string, message: string }) {
        const { userId, username, email, subject, category, message } = data;
        const now = new Date().toISOString();

        // 1. Create support_tickets document
        const ticketRef = db.collection('support_tickets').doc();
        const ticketId = ticketRef.id;

        const ticketData: SupportTicket = {
            userId,
            username,
            email,
            subject,
            category,
            status: 'OPEN',
            createdAt: now,
            updatedAt: now,
            lastMessageAt: now
        };

        const batch = db.batch();
        batch.set(ticketRef, ticketData);

        // 2. Create first message inside subcollection
        const messageRef = ticketRef.collection('messages').doc();
        batch.set(messageRef, {
            senderId: userId,
            senderRole: 'USER',
            message,
            createdAt: now
        });

        await batch.commit();
        return { ticketId, ...ticketData };
    },

    async getUserTickets(userId: string) {
        const snapshot = await db.collection('support_tickets')
            .where('userId', '==', userId)
            // Use client-side sorting if composite index doesn't exist to avoid index errors
            .get();

        const tickets = snapshot.docs.map(doc => ({
            ticketId: doc.id,
            ...doc.data()
        }));

        // Sort by createdAt descending
        tickets.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return tickets;
    },

    async getTicket(ticketId: string, userId: string) {
        const ticketDoc = await db.collection('support_tickets').doc(ticketId).get();
        if (!ticketDoc.exists) return null;

        const ticket = ticketDoc.data() as SupportTicket;
        if (ticket.userId !== userId) return null; // Ensure ownership

        const messagesSnapshot = await db.collection('support_tickets').doc(ticketId).collection('messages').orderBy('createdAt', 'asc').get();
        const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return {
            ticket: { ticketId: ticketDoc.id, ...ticket },
            messages
        };
    },

    async replyToTicket(ticketId: string, userId: string, message: string) {
        const ticketRef = db.collection('support_tickets').doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) throw { statusCode: 404, message: 'Ticket not found' };

        const ticket = ticketDoc.data() as SupportTicket;
        if (ticket.userId !== userId) throw { statusCode: 403, message: 'Unauthorized' };
        if (ticket.status === 'CLOSED') throw { statusCode: 400, message: 'Cannot reply to a closed ticket' };

        const now = new Date().toISOString();
        const newStatus = ticket.status === 'RESOLVED' ? 'IN_PROGRESS' : ticket.status;

        const batch = db.batch();

        // Update ticket
        batch.update(ticketRef, {
            status: newStatus,
            updatedAt: now,
            lastMessageAt: now
        });

        // Add message
        const messageRef = ticketRef.collection('messages').doc();
        batch.set(messageRef, {
            senderId: userId,
            senderRole: 'USER',
            message,
            createdAt: now
        });

        await batch.commit();
        return { success: true };
    }
};
