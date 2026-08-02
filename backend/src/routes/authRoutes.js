import express from 'express';
import { loginPegawai, loginAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginPegawai);       // Endpoint login pegawai via NIP
router.post('/admin/login', loginAdmin);   // Endpoint login admin via Email

export default router;