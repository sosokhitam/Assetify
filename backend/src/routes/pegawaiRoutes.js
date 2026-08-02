import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// ==================================================================
// 1. GET DASHBOARD SUMMARY & ASET PEGAWAI
// GET http://localhost:5000/api/pegawai/dashboard/:userId
// ==================================================================
router.get('/dashboard/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // A. Ambil aset yang dipegang oleh pegawai ini
    const { data: aset, error: asetError } = await supabase
      .from('aset')
      .select('*, lokasi(nama_lokasi), kategori_aset(nama_kategori)')
      .eq('user_id', userId);

    if (asetError) throw asetError;

    // B. Ambil pengajuan perbaikan milik pegawai ini
    const { data: pengajuan, error: pengajuanError } = await supabase
      .from('pengajuan_perbaikan')
      .select('*, aset(nama_aset, kode_aset)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (pengajuanError) throw pengajuanError;

    // Hitung ringkasan statistik
    const totalAset = aset ? aset.length : 0;
    const pengajuanPending = pengajuan ? pengajuan.filter(p => p.status === 'pending').length : 0;
    const pengajuanDiproses = pengajuan ? pengajuan.filter(p => p.status === 'diproses').length : 0;
    const pengajuanSelesai = pengajuan ? pengajuan.filter(p => p.status === 'selesai').length : 0;

    res.json({
      success: true,
      data: {
        summary: { totalAset, pengajuanPending, pengajuanDiproses, pengajuanSelesai },
        asetList: aset || [],
        pengajuanList: pengajuan || []
      }
    });

  } catch (error) {
    console.error('Error GET Pegawai Dashboard:', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat dashboard pegawai.' });
  }
});

// ==================================================================
// 2. POST BUAT PENGAJUAN PERBAIKAN BARU
// POST http://localhost:5000/api/pegawai/pengajuan
// ==================================================================
router.post('/pengajuan', async (req, res) => {
  const { user_id, aset_id, deskripsi_kerusakan, tingkat_urgensi } = req.body;

  if (!user_id || !aset_id || !deskripsi_kerusakan) {
    return res.status(400).json({ success: false, message: 'Aset dan deskripsi kerusakan wajib diisi!' });
  }

  try {
    const { data, error } = await supabase
      .from('pengajuan_perbaikan')
      .insert([
        {
          user_id,
          aset_id,
          deskripsi_kerusakan: deskripsi_kerusakan.trim(),
          tingkat_urgensi: tingkat_urgensi || 'sedang',
          status: 'pending' // Default status saat baru dibuat
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Pengajuan perbaikan berhasil dikirim!',
      data: data[0]
    });

  } catch (error) {
    console.error('Error POST Pengajuan:', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal mengirim pengajuan.' });
  }
});

export default router;