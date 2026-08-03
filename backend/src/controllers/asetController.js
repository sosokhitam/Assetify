import { supabase } from '../config/supabase.js';

const buildAsetPayload = (body = {}) => {
  const payload = {};
  const allowedFields = [
    'kode_aset',
    'nama_aset',
    'lokasi_id',
    'merk_model',
    'nomor_seri',
    'kondisi',
    'status',
    'user_id'
  ];

  allowedFields.forEach((field) => {
    if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
      payload[field] = body[field];
    }
  });

  if (body.kategori_id !== undefined && body.kategori_id !== null && body.kategori_id !== '') {
    payload.kategori_id = body.kategori_id;
  }

  if (!payload.status) payload.status = 'Aktif';
  if (!payload.kondisi) payload.kondisi = 'Baik';

  return payload;
};

// Get All Aset (Lengkap dengan data Nama Kategori & Nama Lokasi)
export const getAllAset = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('aset')
      .select(`
        *,
        kategori:kategori_aset (id, nama_kategori),
        lokasi:lokasi (id, nama_lokasi, gedung_lantai)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Aset Baru
export const createAset = async (req, res) => {
  const payload = buildAsetPayload(req.body);

  try {
    const { data, error } = await supabase
      .from('aset')
      .insert([payload])
      .select();

    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Aset berhasil ditambahkan', data: data[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Aset
export const updateAset = async (req, res) => {
  const { id } = req.params;
  const updateData = buildAsetPayload(req.body);

  try {
    const { data, error } = await supabase
      .from('aset')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Data aset berhasil diperbarui', data: data[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Aset
export const deleteAset = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('aset')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Aset berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};