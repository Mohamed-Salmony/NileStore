import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index';
import storageRoutes from './routes/storage';
import categoriesRoutes from './routes/categories';
import productsRoutes from './routes/products';
import cartRoutes from './routes/cart';
import ordersRoutes from './routes/orders';
import usersRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import couponsRoutes from './routes/coupons';
import promotionsRoutes from './routes/promotions';
import wishlistRoutes from './routes/wishlist';
import governoratesRoutes from './routes/governorates';
import paymentMethodsRoutes from './routes/paymentMethods';
import newsletterRoutes from './routes/newsletter';
import contactRoutes from './routes/contact';
import notificationsRoutes from './routes/notifications';
import supportTicketsRoutes from './routes/supportTickets';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = express();

// Security & performance middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression({ level: 6, threshold: 1024 }));
app.use(cors({ origin: true, credentials: true }));

// Rate limiting for production
if (env.nodeEnv === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
}

// Body parsing with limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging (only in dev)
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check (no auth)
app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);
app.use('/api/storage', storageRoutes);
app.use('/api/upload', storageRoutes); // Alias for upload endpoints
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/governorates', governoratesRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/support-tickets', supportTicketsRoutes);

// Log all requests in production
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Not found handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
