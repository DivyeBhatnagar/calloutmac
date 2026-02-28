"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportService = void 0;
const firebase_admin_1 = require("../../config/firebase.admin");
exports.supportService = {
    createTicket(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, username, email, subject, category, message } = data;
            const now = new Date().toISOString();
            // 1. Create support_tickets document
            const ticketRef = firebase_admin_1.db.collection('support_tickets').doc();
            const ticketId = ticketRef.id;
            const ticketData = {
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
            const batch = firebase_admin_1.db.batch();
            batch.set(ticketRef, ticketData);
            // 2. Create first message inside subcollection
            const messageRef = ticketRef.collection('messages').doc();
            batch.set(messageRef, {
                senderId: userId,
                senderRole: 'USER',
                message,
                createdAt: now
            });
            yield batch.commit();
            return Object.assign({ ticketId }, ticketData);
        });
    },
    getUserTickets(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield firebase_admin_1.db.collection('support_tickets')
                .where('userId', '==', userId)
                // Use client-side sorting if composite index doesn't exist to avoid index errors
                .get();
            const tickets = snapshot.docs.map(doc => (Object.assign({ ticketId: doc.id }, doc.data())));
            // Sort by createdAt descending
            tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return tickets;
        });
    },
    getTicket(ticketId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketDoc = yield firebase_admin_1.db.collection('support_tickets').doc(ticketId).get();
            if (!ticketDoc.exists)
                return null;
            const ticket = ticketDoc.data();
            if (ticket.userId !== userId)
                return null; // Ensure ownership
            const messagesSnapshot = yield firebase_admin_1.db.collection('support_tickets').doc(ticketId).collection('messages').orderBy('createdAt', 'asc').get();
            const messages = messagesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            return {
                ticket: Object.assign({ ticketId: ticketDoc.id }, ticket),
                messages
            };
        });
    },
    replyToTicket(ticketId, userId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketRef = firebase_admin_1.db.collection('support_tickets').doc(ticketId);
            const ticketDoc = yield ticketRef.get();
            if (!ticketDoc.exists)
                throw { statusCode: 404, message: 'Ticket not found' };
            const ticket = ticketDoc.data();
            if (ticket.userId !== userId)
                throw { statusCode: 403, message: 'Unauthorized' };
            if (ticket.status === 'CLOSED')
                throw { statusCode: 400, message: 'Cannot reply to a closed ticket' };
            const now = new Date().toISOString();
            const newStatus = ticket.status === 'RESOLVED' ? 'IN_PROGRESS' : ticket.status;
            const batch = firebase_admin_1.db.batch();
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
            yield batch.commit();
            return { success: true };
        });
    }
};
