import { supabase } from '../config/supabase.js';

// Get All Tiket
export const getAllTiket = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pengajuan_perbaikan')
      .select(`
        *,
        aset:aset (id, kode_aset, nama_aset, lokasi:lokasi(nama_lokasi)),
        pelapor:profiles (id, nama_lengkap, jabatan)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Tiket Baru (Oleh Pegawai/Admin/Teknisi)
export const createTiket = async (req, res) => {
  const { aset_id, deskripsi_kerusakan, tingkat_urgensi } = req.body;
  const pelapor_id = req.user.id;

  const nomor_tiket = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    // 1. Buat tiket perbaikan
    const { data, error } = await supabase
      .from('pengajuan_perbaikan')
      .insert([{
        nomor_tiket,
        aset_id,
        pelapor_id,
        deskripsi_kerusakan,
        tingkat_urgensi: tingkat_urgensi || 'Sedang',
        status: 'Pending'
      }])
      .select();

    if (error) throw error;

    // 2. Ubah status aset menjadi 'Dalam Perbaikan' dan kondisi 'Rusak Ringan'
    const { error: asetError } = await supabase
      .from('aset')
      .update({ 
        status: 'Dalam Perbaikan',
        kondisi: 'Rusak Ringan'
      })
      .eq('id', aset_id);

    if (asetError) console.error('Gagal update status aset:', asetError.message);

    return res.status(201).json({ success: true, message: 'Tiket berhasil dibuat', data: data[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Status Tiket & Catat Riwayat / Alasan Penolakan
export const updateStatusTiket = async (req, res) => {
  const { id } = req.params;
  const { status, rincian_tindakan, komponen_diganti, biaya, alasan_penolakan } = req.body;
  const teknisi_id = req.user.id;

  // Validasi: Jika status 'Ditolak', alasan penolakan wajib diisi
  if (status === 'Ditolak' && (!alasan_penolakan || !alasan_penolakan.trim())) {
    return res.status(400).json({ 
      success: false, 
      message: 'Alasan penolakan wajib diisi jika menolak pengajuan.' 
    });
  }

  try {
    // 1. Update status tiket pengajuan dan alasan penolakan
    const { data: tiketData, error: tiketError } = await supabase
      .from('pengajuan_perbaikan')
      .update({ 
        status, 
        alasan_penolakan: status === 'Ditolak' ? alasan_penolakan : null 
      })
      .eq('id', id)
      .select()
      .single();

    if (tiketError) throw tiketError;

    // 2. Jika status berubah jadi 'Diproses' atau 'Selesai' dan ada rincian tindakan, catat di riwayat
    if (rincian_tindakan && status !== 'Ditolak') {
      await supabase
        .from('riwayat_pemeliharaan')
        .insert([{
          pengajuan_id: id,
          aset_id: tiketData.aset_id,
          teknisi_id,
          rincian_tindakan,
          komponen_diganti: komponen_diganti || '-',
          biaya: biaya || 0
        }]);
    }

    // 3. Penyesuaian Status & Kondisi Aset di Master Data Aset
    if (status === 'Selesai' || status === 'Ditolak') {
      // PERBAIKAN DI SINI: Baik 'Selesai' maupun 'Ditolak', status dikembalikan ke 'Aktif' dan kondisi ke 'Baik'
      await supabase
        .from('aset')
        .update({ 
          status: 'Aktif', 
          kondisi: 'Baik' 
        })
        .eq('id', tiketData.aset_id);
    } else if (status === 'Diproses') {
      await supabase
        .from('aset')
        .update({ status: 'Dalam Perbaikan' })
        .eq('id', tiketData.aset_id);
    }

    return res.status(200).json({ success: true, message: 'Status tiket berhasil diperbarui' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Tiket Pengajuan (Oleh Admin)
export const deleteTiket = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('pengajuan_perbaikan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Tiket pengajuan berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};