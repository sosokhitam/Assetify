import { supabase } from '../config/supabase.js';

// Get All Kategori
export const getAllKategori = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('kategori_aset')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Kategori
export const createKategori = async (req, res) => {
  const { nama_kategori, deskripsi } = req.body;
  try {
    const { data, error } = await supabase
      .from('kategori_aset')
      .insert([{ nama_kategori, deskripsi }])
      .select();

    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data: data[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Kategori
export const deleteKategori = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('kategori_aset')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};