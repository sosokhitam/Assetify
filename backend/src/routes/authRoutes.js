import express from 'express';
import { loginPegawai, loginAdmin, getCurrentUser } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', loginPegawai);       // Endpoint login pegawai via NIP
router.post('/admin/login', loginAdmin);   // Endpoint login admin via Email
router.get('/me', verifyToken, getCurrentUser); // Endpoint untuk memvalidasi token dan refresh data user

export default router;