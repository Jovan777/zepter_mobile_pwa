import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { allowedOrigins } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import blogRoutes from './modules/blog/blog.routes';
import cartRoutes from './modules/cart/cart.routes';
import categoryRoutes from './modules/categories/category.routes';
import clientRoutes from './modules/clients/client.routes';
import offerRoutes from './modules/offers/offer.routes';
import orderRoutes from './modules/orders/order.routes';
import productRoutes from './modules/products/product.routes';
import regionRoutes from './modules/regions/region.routes';
import userRoutes from './modules/users/user.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import zepterClubRoutes from './modules/zepter-club/zepterClub.routes';

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'zepter-mobile-pwa-api',
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/zepter-club', zepterClubRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
