import { supabase } from '../config/supabase.js';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import ws from 'ws';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_assetify_key';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const createSupabaseAuthClient = () => {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: ws,
    },
  });
};

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

    // 1. Cari NIP di tabel profiles dan ambil juga kolom 'email'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, nip, nama_lengkap, jabatan, role, email')
      .eq('nip', cleanNip)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ success: false, message: 'NIP tidak terdaftar dalam sistem!' });
    }

    if (profile.role !== 'pegawai') {
      return res.status(403).json({ success: false, message: 'Silakan gunakan Portal Login khusus Admin.' });
    }

    // 2. Ambil email asli pegawai dari database profile
    const userEmail = profile.email || `${cleanNip}@assetify.com`;

    // 3. Login Supabase Auth menggunakan email dan password pada instance terpisah
    const authClient = createSupabaseAuthClient();
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (authError || !authData?.user) {
      console.error('LoginPegawai failed auth:', authError, authData);
      return res.status(400).json({ success: false, message: 'Password yang Anda masukkan salah.' });
    }

    // 4. Generate JWT Token
    const token = jwt.sign(
      { id: profile.id, nip: profile.nip, role: 'pegawai' },
      JWT_SECRET,
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
    console.error('Error Login Pegawai:', err.message || err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan atau tidak valid.' });
  }

  return res.status(200).json({ success: true, user: req.user });
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

    // Login Supabase Auth menggunakan instance terpisah agar tidak mengubah state global
    const authClient = createSupabaseAuthClient();
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError || !authData?.user) {
      console.error('LoginAdmin failed auth:', authError, authData);
      return res.status(400).json({ success: false, message: 'Email atau Password Admin salah.' });
    }

    // Ambil detail role dari tabel profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, nip, nama_lengkap, jabatan, role')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('LoginAdmin profile lookup failed:', profileError);
    }

    const role = profile?.role || 'admin';

    if (role !== 'admin' && role !== 'teknisi') {
      return res.status(403).json({ success: false, message: 'Akses ditolak! Akun ini bukan Admin/Teknisi.' });
    }

    const token = jwt.sign(
      { id: authData.user.id, email: authData.user.email, role },
      JWT_SECRET,
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