const bcrypt = require('bcryptjs'); // Atau 'bcrypt'
// Impor Model User / Database Client Anda (contoh: Supabase / Prisma / Sequelize / Mongoose)
// const { supabase } = require('../config/supabase'); 

// 1. Controller Tambah Pegawai / User Baru
const createUser = async (req, res) => {
  try {
    const { nama, nip, email, password, role, jabatan } = req.body;

    // Validasi sederhana
    if (!nama || !nip || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // HASH PASSWORD DENGAN BCRYPT SEBELUM DISIMPAN
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // KODE INSERT KE DATABASE (Sesuaikan dengan ORM / Database Anda)
    // Contoh jika menggunakan Supabase Node Client:
    /*
    const { data, error } = await supabase
      .from('users') // atau 'profiles'
      .insert([
        { 
          nama, 
          nip, 
          email, 
          password: hashedPassword, // Simpan password yang SUDAH di-hash
          role, 
          jabatan 
        }
      ]);

    if (error) throw error;
    */

    return res.status(201).json({
      success: true,
      message: 'Pegawai berhasil didaftarkan',
      // data
    });

  } catch (error) {
    console.error('Error createUser:', error);
    return res.status(500).json({ message: 'Gagal mendaftarkan user' });
  }
};

module.exports = {
  createUser
};