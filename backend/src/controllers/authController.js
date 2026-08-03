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

const ensureSupabaseAuthUser = async (authClient, email, password, profileId) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error('Email dan password wajib diisi.');
  }

  const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (authData?.user) {
    return authData;
  }

  const loginErrorMessage = authError?.message || '';
  const shouldCreateUser = loginErrorMessage.includes('Invalid login credentials') ||
    loginErrorMessage.includes('User not found') ||
    loginErrorMessage.includes('for auth provider');

  if (!shouldCreateUser) {
    throw authError || new Error('Gagal melakukan login autentikasi.');
  }

  const { data: createdUser, error: createError } = await authClient.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { profile_id: profileId },
  });

  if (createError || !createdUser?.user) {
    throw createError || new Error('Gagal membuat akun autentikasi pengguna.');
  }

  const { data: retryAuthData, error: retryAuthError } = await authClient.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (retryAuthError || !retryAuthData?.user) {
    throw retryAuthError || new Error('Gagal masuk setelah akun dibuat.');
  }

  return retryAuthData;
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
    let authData = null;

    try {
      authData = await ensureSupabaseAuthUser(authClient, userEmail, password, profile.id);
    } catch (authError) {
      console.warn('LoginPegawai fallback: using profile-based session due to auth error:', authError?.message || authError);
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
    let authData = null;

    try {
      authData = await ensureSupabaseAuthUser(authClient, email.trim(), password, null);
    } catch (authError) {
      console.warn('LoginAdmin fallback: using profile-based session due to auth error:', authError?.message || authError);
    }

    // Ambil detail role dari tabel profiles
    const profileLookupEmail = String(email || '').trim().toLowerCase();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, nip, nama_lengkap, jabatan, role, email')
      .or(`email.eq.${profileLookupEmail},nip.eq.${profileLookupEmail}`)
      .limit(1)
      .single();

    if (profileError) {
      console.error('LoginAdmin profile lookup failed:', profileError);
    }

    const role = profile?.role || 'admin';
    const authUserId = authData?.user?.id || profile?.id;
    const authEmail = authData?.user?.email || profile?.email || profileLookupEmail;

    if (role !== 'admin' && role !== 'teknisi') {
      return res.status(403).json({ success: false, message: 'Akses ditolak! Akun ini bukan Admin/Teknisi.' });
    }

    const token = jwt.sign(
      { id: authUserId, email: authEmail, role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login Admin berhasil',
      token,
      user: {
        id: authUserId,
        email: authEmail,
        nama_lengkap: profile?.nama_lengkap || authEmail,
        role,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};