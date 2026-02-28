import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middlewares/error.middleware';

// Routes imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import tournamentRoutes from './modules/tournaments/tournament.routes';
import registrationRoutes from './modules/registrations/registration.routes';
import paymentRoutes from './modules/payments/payment.routes';
import queryRoutes from './modules/queries/query.routes';
import adminRoutes from './modules/admin/admin.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve QR images from Backend/public/qr/ at route /qr
const qrAssetsPath = path.join(__dirname, '..', 'public', 'qr');
app.use('/qr', express.static(qrAssetsPath));

// Serve uploaded images from Backend/public/uploads/ at route /uploads (local fallback)
const uploadAssetsPath = path.join(__dirname, '..', 'public', 'uploads');
app.use('/uploads', express.static(uploadAssetsPath));

// Base route
app.get('/api', (req, res) => {
    res.status(200).json({ success: true, message: 'Callout Esports API is running.' });
});

// Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/queries', queryRoutes); // Contains admin queries
app.use('/api/admin/analytics', analyticsRoutes); // Put analytics before admin so it doesn't get grabbed by admin/:id
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
