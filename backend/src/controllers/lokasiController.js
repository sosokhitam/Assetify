import { supabase } from '../config/supabase.js';

// Get All Lokasi
export const getLokasi = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lokasi')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Ekspor juga sebagai getAllLokasi agar kompatibel dengan masterRoutes.js
export const getAllLokasi = getLokasi;

// Create Lokasi
export const createLokasi = async (req, res) => {
  const { nama_lokasi, gedung_lantai, keterangan } = req.body;
  try {
    const { data, error } = await supabase
      .from('lokasi')
      .insert([{ nama_lokasi, gedung_lantai, keterangan }])
      .select();

    if (error) throw error;
    return res.status(201).json({ 
      success: true, 
      message: 'Lokasi berhasil ditambahkan', 
      data: data[0] 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Lokasi
export const deleteLokasi = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('lokasi')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Lokasi berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};