import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

// -------------------------------------------------------------
// 1. LOGIN PEGAWAI (Menggunakan NIP & Password)
// -------------------------------------------------------------
export const loginPegawai = async (req, res) => {
  const { nip, password } = req.body;

  try {
    if (!nip || !password) {
      return res.status(400).json({ success: false, message: 'NIP dan Password wajib diisi!' });
    }

    const cleanNip = nip.trim();

    // Cari NIP di tabel profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, nip, nama_lengkap, jabatan, role')
      .eq('nip', cleanNip)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ success: false, message: 'NIP tidak terdaftar dalam sistem!' });
    }

    if (profile.role !== 'pegawai') {
      return res.status(403).json({ success: false, message: 'Silakan gunakan Portal Login khusus Admin.' });
    }

    const userEmail = `${cleanNip}@assetify.com`;

    // Login Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (authError) {
      return res.status(400).json({ success: false, message: 'Password yang Anda masukkan salah.' });
    }

    const token = jwt.sign(
      { id: profile.id, nip: profile.nip, role: 'pegawai' },
      process.env.JWT_SECRET || 'secret_assetify_key',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: profile.id,
        nip: profile.nip,
        nama_lengkap: profile.nama_lengkap,
        jabatan: profile.jabatan,
        role: 'pegawai',
        email: userEmail,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// -------------------------------------------------------------
// 2. LOGIN ADMIN / TEKNISI (Menggunakan Email & Password)
// -------------------------------------------------------------
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan Password wajib diisi!' });
    }

    // Login Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      return res.status(400).json({ success: false, message: 'Email atau Password Admin salah.' });
    }

    // Ambil detail role dari tabel profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, nip, nama_lengkap, jabatan, role')
      .eq('id', authData.user.id)
      .single();

    const role = profile?.role || 'admin';

    if (role !== 'admin' && role !== 'teknisi') {
      return res.status(403).json({ success: false, message: 'Akses ditolak! Akun ini bukan Admin/Teknisi.' });
    }

    const token = jwt.sign(
      { id: authData.user.id, email: authData.user.email, role },
      process.env.JWT_SECRET || 'secret_assetify_key',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login Admin berhasil',
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nama_lengkap: profile?.nama_lengkap || authData.user.email,
        role,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};