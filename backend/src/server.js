import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import asetRoutes from './routes/asetRoutes.js';
import perbaikanRoutes from './routes/perbaikanRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Jalur Rute API
app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/aset', asetRoutes);
app.use('/api/perbaikan', perbaikanRoutes);

// Endpoint Uji Coba (Ping)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server SAMSAT IT Management berjalan dengan baik!'
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server berjalan di: http://localhost:${PORT}`);
  console.log(`=========================================`);
});