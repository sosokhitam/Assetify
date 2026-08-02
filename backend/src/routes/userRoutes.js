import express from 'express';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
// Sesuaikan path import dengan lokasi file supabase.js backend Anda
import { supabase } from '../config/supabase.js'; 

const router = express.Router();

// Lindungi semua route user dengan token di header Authorization
router.use(verifyToken);
router.use(checkRole(['admin']));

// ==================================================================
// 1. GET ALL USERS (PROFILES)
// URL: GET http://localhost:5000/api/users
// ==================================================================
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error GET users:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Gagal mengambil data user dari database.' 
    });
  }
});

// ==================================================================
// 2. POST CREATE USER (DENGAN UPSERT UNTUK CEGAH DUPLIKAT ID)
// URL: POST http://localhost:5000/api/users
// ==================================================================
router.post('/', async (req, res) => {
  const { nama, nip, email, password, role, jabatan } = req.body;

  // Validasi sederhana di backend
  if (!nama || !nip || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nama, NIP, Email, dan Password wajib diisi!' 
    });
  }

  try {
    // A. Buat akun di Supabase Auth (Menggunakan Service Role Key)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true, // Otomatis verifikasi email tanpa perlu klik link
      user_metadata: { 
        nama_lengkap: nama.trim(), 
        role: role || 'pegawai' 
      }
    });

    if (authError) throw authError;

    // B. Simpan data profil termasuk EMAIL ke tabel public.profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        [
          {
            id: authData.user.id,
            nama_lengkap: nama.trim(),
            nip: nip.trim(),
            email: email.trim().toLowerCase(), // <-- MENYIMPAN EMAIL KE PROFILES
            jabatan: jabatan ? jabatan.trim() : '-',
            role: role || 'pegawai',
          }
        ],
        { onConflict: 'id' }
      );

    if (profileError) throw profileError;

    res.status(201).json({
      success: true,
      message: 'User berhasil didaftarkan!',
      data: authData.user
    });

  } catch (error) {
    console.error('Error POST user:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Gagal mendaftarkan user baru' 
    });
  }
});

// ==================================================================
// 3. DELETE USER BY ID
// URL: DELETE http://localhost:5000/api/users/:id
// ==================================================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Hapus dari Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);
    if (authDeleteError) throw authDeleteError;

    // Menghapus data di public.profiles untuk memastikan
    await supabase.from('profiles').delete().eq('id', id);

    res.json({ 
      success: true, 
      message: 'User berhasil dihapus dari sistem.' 
    });
  } catch (error) {
    console.error('Error DELETE user:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Gagal menghapus user.' 
    });
  }
});

export default router;