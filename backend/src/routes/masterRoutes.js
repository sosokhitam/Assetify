import express from 'express';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import { getAllLokasi, createLokasi, deleteLokasi } from '../controllers/lokasiController.js';
import { getAllKategori, createKategori, deleteKategori } from '../controllers/kategoriController.js';

const router = express.Router();

// Proteksi Semua Route Master Data dengan Token
router.use(verifyToken);

// --- Rute Lokasi ---
router.get('/lokasi', getAllLokasi);
router.post('/lokasi', checkRole(['admin']), createLokasi);
router.delete('/lokasi/:id', checkRole(['admin']), deleteLokasi);

// --- Rute Kategori ---
router.get('/kategori', getAllKategori);
router.post('/kategori', checkRole(['admin']), createKategori);
router.delete('/kategori/:id', checkRole(['admin']), deleteKategori);

export default router;