import express from 'express';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import { getAllTiket, createTiket, updateStatusTiket, deleteTiket } from '../controllers/perbaikanController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllTiket);
router.post('/', createTiket); // Semua user terautentikasi bisa buat tiket
router.patch('/:id/status', checkRole(['admin', 'teknisi']), updateStatusTiket);
router.delete('/:id', checkRole(['admin']), deleteTiket); // Hanya admin yang bisa hapus tiket

export default router;