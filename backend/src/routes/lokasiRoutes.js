import express from 'express';
import { getLokasi, createLokasi, deleteLokasi } from '../controllers/lokasiController.js';

const router = express.Router();

router.get('/', getLokasi);
router.post('/', createLokasi);
router.delete('/:id', deleteLokasi);

export default router;