import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Autentikasi dengan Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    // Ambil detail role user dari tabel profiles/pegawai
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, nama_lengkap, role')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role || 'pegawai';

    // Buat JWT Token
    const token = jwt.sign(
      { id: data.user.id, email: data.user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        nama_lengkap: profile?.nama_lengkap || data.user.email,
        role
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};