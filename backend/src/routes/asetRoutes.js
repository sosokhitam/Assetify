import express from 'express';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import { getAllAset, createAset, updateAset, deleteAset } from '../controllers/asetController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllAset);
router.post('/', checkRole(['admin', 'teknisi']), createAset);
router.put('/:id', checkRole(['admin', 'teknisi']), updateAset);
router.delete('/:id', checkRole(['admin']), deleteAset);

export default router;