import { db } from '../../config/firebase.admin';

export const adminSupportService = {
    async getAllTickets() {
        // Use client side sorting if needed
        const snapshot = await db.collection('support_tickets').get();
        const tickets = snapshot.docs.map(doc => ({
            ticketId: doc.id,
            ...doc.data()
        }));

        // Sort by lastMessageAt descending
        tickets.sort((a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        return tickets;
    },

    async getTicket(ticketId: string) {
        const ticketDoc = await db.collection('support_tickets').doc(ticketId).get();
        if (!ticketDoc.exists) return null;

        const ticket = ticketDoc.data();

        const messagesSnapshot = await db.collection('support_tickets').doc(ticketId).collection('messages').orderBy('createdAt', 'asc').get();
        const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return {
            ticket: { ticketId: ticketDoc.id, ...ticket },
            messages
        };
    },

    async replyToTicket(ticketId: string, adminId: string, message: string) {
        const ticketRef = db.collection('support_tickets').doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) throw { statusCode: 404, message: 'Ticket not found' };

        const now = new Date().toISOString();
        const batch = db.batch();

        // Update ticket
        batch.update(ticketRef, {
            status: 'IN_PROGRESS',
            updatedAt: now,
            lastMessageAt: now
        });

        // Add message
        const messageRef = ticketRef.collection('messages').doc();
        batch.set(messageRef, {
            senderId: adminId,
            senderRole: 'ADMIN',
            message,
            createdAt: now
        });

        await batch.commit();
        return { success: true };
    },

    async updateTicketStatus(ticketId: string, status: 'RESOLVED' | 'CLOSED') {
        const ticketRef = db.collection('support_tickets').doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) throw { statusCode: 404, message: 'Ticket not found' };

        await ticketRef.update({
            status,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    },

    async deleteTicket(ticketId: string) {
        const ticketRef = db.collection('support_tickets').doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) throw { statusCode: 404, message: 'Ticket not found' };

        // Delete all messages in the subcollection first
        const messagesSnapshot = await ticketRef.collection('messages').get();
        const batch = db.batch();

        messagesSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Delete the ticket itself
        batch.delete(ticketRef);

        await batch.commit();
        return { success: true };
    }
};
