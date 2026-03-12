import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import apiRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API routes
app.use('/api/health', healthRoutes);
app.use('/api', apiRoutes);

// Serve client static files in development (optional)
const clientPath = path.join(__dirname, '..', '..', 'client');
app.use(express.static(clientPath));
app.get('/', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use(errorHandler);

async function start(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
