import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

const canAccessUserData = (req, userId) => {
  const currentUser = req.user;
  return currentUser?.id === userId || currentUser?.role === 'admin' || currentUser?.role === 'teknisi';
};

router.get('/aset/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;

  if (!canAccessUserData(req, userId)) {
    return res.status(403).json({ success: false, message: 'Akses ke data aset pengguna ini ditolak.' });
  }

  try {
    let query = supabase
      .from('aset')
      .select('*, lokasi(nama_lokasi), kategori_aset(nama_kategori)')
      .order('created_at', { ascending: false });

    let aset = [];
    let asetError = null;

    const { data, error } = await query;
    aset = data || [];
    asetError = error;

    if (asetError) throw asetError;

    const filteredByOwner = (aset || []).filter((item) => {
      const ownerId = item?.user_id || item?.pemilik_id || item?.assigned_user_id || item?.pegawai_id;
      return !ownerId || ownerId === userId;
    });

    return res.json({ success: true, data: filteredByOwner });
  } catch (error) {
    console.error('Error GET Aset Pegawai:', error);
    return res.status(500).json({ success: false, message: error.message || 'Gagal memuat aset pengguna.' });
  }
});

// ==================================================================
// 1. GET DASHBOARD SUMMARY & ASET PEGAWAI
// GET http://localhost:5000/api/pegawai/dashboard/:userId
// ==================================================================
router.get('/dashboard/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;

  if (!canAccessUserData(req, userId)) {
    return res.status(403).json({ success: false, message: 'Akses ke dashboard pengguna ini ditolak.' });
  }

  try {
    const { data: asetData, error: asetError } = await supabase
      .from('aset')
      .select('*, lokasi(nama_lokasi), kategori_aset(nama_kategori)')
      .order('created_at', { ascending: false });

    if (asetError) throw asetError;

    const aset = (asetData || []).filter((item) => {
      const ownerId = item?.user_id || item?.pemilik_id || item?.assigned_user_id || item?.pegawai_id;
      return !ownerId || ownerId === userId;
    });

    const { data: pengajuan, error: pengajuanError } = await supabase
      .from('pengajuan_perbaikan')
      .select('*, aset(nama_aset, kode_aset)')
      .eq('pelapor_id', userId)
      .order('created_at', { ascending: false });

    if (pengajuanError) throw pengajuanError;

    const normalizeStatus = (status = '') => String(status || '').trim().toLowerCase();
    const totalAset = aset ? aset.length : 0;
    const pengajuanPending = pengajuan ? pengajuan.filter((p) => normalizeStatus(p.status) === 'pending').length : 0;
    const pengajuanDiproses = pengajuan ? pengajuan.filter((p) => normalizeStatus(p.status) === 'diproses').length : 0;
    const pengajuanSelesai = pengajuan ? pengajuan.filter((p) => normalizeStatus(p.status) === 'selesai').length : 0;

    return res.json({
      success: true,
      data: {
        summary: { totalAset, pengajuanPending, pengajuanDiproses, pengajuanSelesai },
        asetList: aset || [],
        pengajuanList: pengajuan || []
      }
    });

  } catch (error) {
    console.error('Error GET Pegawai Dashboard:', error);
    return res.status(500).json({ success: false, message: error.message || 'Gagal memuat dashboard pegawai.' });
  }
});

// ==================================================================
// 2. POST BUAT PENGAJUAN PERBAIKAN BARU
// POST http://localhost:5000/api/pegawai/pengajuan
// ==================================================================
router.post('/pengajuan', verifyToken, async (req, res) => {
  const { aset_id, deskripsi_kerusakan, tingkat_urgensi } = req.body;
  const pelapor_id = req.user.id;

  if (!aset_id || !deskripsi_kerusakan) {
    return res.status(400).json({ success: false, message: 'Aset dan deskripsi kerusakan wajib diisi!' });
  }

  try {
    const nomor_tiket = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data, error } = await supabase
      .from('pengajuan_perbaikan')
      .insert([
        {
          nomor_tiket,
          aset_id,
          pelapor_id,
          deskripsi_kerusakan: deskripsi_kerusakan.trim(),
          tingkat_urgensi: tingkat_urgensi || 'Sedang',
          status: 'Pending'
        }
      ])
      .select();

    if (error) throw error;

    await supabase
      .from('aset')
      .update({ status: 'Dalam Perbaikan', kondisi: 'Rusak Ringan' })
      .eq('id', aset_id);

    return res.status(201).json({
      success: true,
      message: 'Pengajuan perbaikan berhasil dikirim!',
      data: data[0]
    });

  } catch (error) {
    console.error('Error POST Pengajuan:', error);
    return res.status(500).json({ success: false, message: error.message || 'Gagal mengirim pengajuan.' });
  }
});

export default router;