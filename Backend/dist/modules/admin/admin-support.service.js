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
exports.adminSupportService = void 0;
const firebase_admin_1 = require("../../config/firebase.admin");
exports.adminSupportService = {
    getAllTickets() {
        return __awaiter(this, void 0, void 0, function* () {
            // Use client side sorting if needed
            const snapshot = yield firebase_admin_1.db.collection('support_tickets').get();
            const tickets = snapshot.docs.map(doc => (Object.assign({ ticketId: doc.id }, doc.data())));
            // Sort by lastMessageAt descending
            tickets.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
            return tickets;
        });
    },
    getTicket(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketDoc = yield firebase_admin_1.db.collection('support_tickets').doc(ticketId).get();
            if (!ticketDoc.exists)
                return null;
            const ticket = ticketDoc.data();
            const messagesSnapshot = yield firebase_admin_1.db.collection('support_tickets').doc(ticketId).collection('messages').orderBy('createdAt', 'asc').get();
            const messages = messagesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            return {
                ticket: Object.assign({ ticketId: ticketDoc.id }, ticket),
                messages
            };
        });
    },
    replyToTicket(ticketId, adminId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketRef = firebase_admin_1.db.collection('support_tickets').doc(ticketId);
            const ticketDoc = yield ticketRef.get();
            if (!ticketDoc.exists)
                throw { statusCode: 404, message: 'Ticket not found' };
            const now = new Date().toISOString();
            const batch = firebase_admin_1.db.batch();
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
            yield batch.commit();
            return { success: true };
        });
    },
    updateTicketStatus(ticketId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketRef = firebase_admin_1.db.collection('support_tickets').doc(ticketId);
            const ticketDoc = yield ticketRef.get();
            if (!ticketDoc.exists)
                throw { statusCode: 404, message: 'Ticket not found' };
            yield ticketRef.update({
                status,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        });
    },
    deleteTicket(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketRef = firebase_admin_1.db.collection('support_tickets').doc(ticketId);
            const ticketDoc = yield ticketRef.get();
            if (!ticketDoc.exists)
                throw { statusCode: 404, message: 'Ticket not found' };
            // Delete all messages in the subcollection first
            const messagesSnapshot = yield ticketRef.collection('messages').get();
            const batch = firebase_admin_1.db.batch();
            messagesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            // Delete the ticket itself
            batch.delete(ticketRef);
            yield batch.commit();
            return { success: true };
        });
    }
};
