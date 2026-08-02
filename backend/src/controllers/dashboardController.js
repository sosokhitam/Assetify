import { supabase } from '../config/supabase.js';

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Hitung total aset
    const { count: totalAset, error: errAset } = await supabase
      .from('aset')
      .select('*', { count: 'exact', head: true });

    if (errAset) throw errAset;

    // 2. Hitung aset berdasarkan status ('Aktif', 'Dalam Perbaikan', 'Afkir/Dipensiunkan')
    const { data: dataStatusAset, error: errStatus } = await supabase
      .from('aset')
      .select('status');

    if (errStatus) throw errStatus;

    const statusCounts = {
      aktif: dataStatusAset.filter(a => a.status === 'Aktif').length,
      perbaikan: dataStatusAset.filter(a => a.status === 'Dalam Perbaikan').length,
      afkir: dataStatusAset.filter(a => a.status === 'Afkir/Dipensiunkan').length,
    };

    // 3. Hitung tiket berdasarkan status ('Pending', 'Diproses', 'Selesai', 'Ditolak')
    const { data: dataTiket, error: errTiket } = await supabase
      .from('pengajuan_perbaikan')
      .select('status');

    if (errTiket) throw errTiket;

    const tiketCounts = {
      pending: dataTiket.filter(t => t.status === 'Pending').length,
      diproses: dataTiket.filter(t => t.status === 'Diproses').length,
      selesai: dataTiket.filter(t => t.status === 'Selesai').length,
      ditolak: dataTiket.filter(t => t.status === 'Ditolak').length,
    };

    // 4. Hitung total biaya perbaikan dari tabel riwayat_pemeliharaan
    const { data: dataBiaya, error: errBiaya } = await supabase
      .from('riwayat_pemeliharaan')
      .select('biaya');

    if (errBiaya) throw errBiaya;

    const totalBiaya = dataBiaya.reduce((acc, curr) => acc + (Number(curr.biaya) || 0), 0);

    // 5. Ambil 5 Tiket Terbaru untuk Aktivitas Terbaru
    const { data: tiketTerbaru, error: errTerbaru } = await supabase
      .from('pengajuan_perbaikan')
      .select(`
        id,
        nomor_tiket,
        status,
        created_at,
        aset:aset (nama_aset, kode_aset),
        pelapor:profiles (nama_lengkap)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (errTerbaru) throw errTerbaru;

    return res.status(200).json({
      success: true,
      data: {
        totalAset: totalAset || 0,
        statusCounts,
        tiketCounts,
        totalBiaya,
        tiketTerbaru: tiketTerbaru || []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};