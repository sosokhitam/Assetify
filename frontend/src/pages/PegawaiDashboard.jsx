import { useState, useEffect, useMemo, useCallback } from 'react';
import API from '../services/api';
import { Laptop, Wrench, Clock, CheckCircle, PlusCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

const getStoredUser = () => {
  if (typeof window === 'undefined') return {};

  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : {};
  } catch (error) {
    console.warn('Gagal membaca data user dari localStorage:', error);
    return {};
  }
};

const PegawaiDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: { totalAset: 0, pengajuanPending: 0, pengajuanDiproses: 0, pengajuanSelesai: 0 },
    asetList: [],
    pengajuanList: []
  });

  // State Modal Form Pengajuan Perbaikan
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ aset_id: '', deskripsi_kerusakan: '', tingkat_urgensi: 'sedang' });
  const [submitting, setSubmitting] = useState(false);

  // State Paginasi
  const ITEMS_PER_PAGE = 5;
  const [pageAset, setPageAset] = useState(1);
  const [pagePengajuan, setPagePengajuan] = useState(1);

  const user = useMemo(() => getStoredUser(), []);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await API.get(`/pegawai/dashboard/${user.id}`);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data pegawai:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      if (!user?.id) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setLoading(true);
      await fetchDashboardData();
      if (!cancelled) setLoading(false);
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [fetchDashboardData, user?.id]);

  const handleSubmitPengajuan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await API.post('/pegawai/pengajuan', {
        user_id: user.id,
        aset_id: formData.aset_id,
        deskripsi_kerusakan: formData.deskripsi_kerusakan,
        tingkat_urgensi: formData.tingkat_urgensi
      });
      if (response.data?.success) {
        alert('Pengaduan aset berhasil dikirim dan akan segera diproses oleh admin.');
        setShowModal(false);
        setFormData({ aset_id: '', deskripsi_kerusakan: '', tingkat_urgensi: 'sedang' });
        fetchDashboardData();
      } else {
        alert(response.data?.message || 'Gagal mengirim pengaduan.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan koneksi ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper untuk mengecek status aset
  const renderStatusAset = (status) => {
    const isGood = ['baik', 'aktif'].includes(status?.toLowerCase());
    return (
      <span className={`px-2.5 py-1 text-[11px] rounded-full font-medium ${
        isGood 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      }`}>
        {status || 'Aktif'}
      </span>
    );
  };

  // Kalkulasi data ter-paginasi
  const totalPagesAset = Math.ceil(data.asetList.length / ITEMS_PER_PAGE) || 1;
  const paginatedAset = useMemo(() => {
    const start = (pageAset - 1) * ITEMS_PER_PAGE;
    return data.asetList.slice(start, start + ITEMS_PER_PAGE);
  }, [data.asetList, pageAset]);

  const totalPagesPengajuan = Math.ceil(data.pengajuanList.length / ITEMS_PER_PAGE) || 1;
  const paginatedPengajuan = useMemo(() => {
    const start = (pagePengajuan - 1) * ITEMS_PER_PAGE;
    return data.pengajuanList.slice(start, start + ITEMS_PER_PAGE);
  }, [data.pengajuanList, pagePengajuan]);

  return (
    <div className="space-y-5 sm:space-y-6 w-full font-sans px-3 sm:px-6 pt-4 sm:pt-6 pb-8">
      
      {/* HEADER HALAMAN UTAMA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Portal Dashboard Pegawai</h1>
          <p className="text-xs text-slate-400 mt-1">Kelola aset dan ajukan perbaikan dengan mudah</p>
        </div>

        {/* Tombol Buat Pengajuan Perbaikan */}
        <button 
          onClick={() => setShowModal(true)} 
          className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-600/20">
          <PlusCircle size={18}/> Buat Pengajuan Baru
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-400 text-xs sm:text-sm">
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            Memuat data portal pegawai...
          </div>
        </div>
      ) : (
        <>
          {/* STATISTIK RINGKASAN */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#1e293b] p-3.5 sm:p-5 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-white shadow-sm">
              <div className="p-2.5 sm:p-3 bg-blue-500/10 text-blue-400 rounded-xl shrink-0">
                <Laptop className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Total Aset</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-0.5">{data.summary.totalAset}</h3>
              </div>
            </div>

            <div className="bg-[#1e293b] p-3.5 sm:p-5 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-white shadow-sm">
              <div className="p-2.5 sm:p-3 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Menunggu</p>
                <h3 className="text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">{data.summary.pengajuanPending}</h3>
              </div>
            </div>

            <div className="bg-[#1e293b] p-3.5 sm:p-5 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-white shadow-sm">
              <div className="p-2.5 sm:p-3 bg-cyan-500/10 text-cyan-400 rounded-xl shrink-0">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Diperbaiki</p>
                <h3 className="text-xl sm:text-2xl font-bold text-cyan-400 mt-0.5">{data.summary.pengajuanDiproses}</h3>
              </div>
            </div>

            <div className="bg-[#1e293b] p-3.5 sm:p-5 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-white shadow-sm">
              <div className="p-2.5 sm:p-3 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Selesai</p>
                <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">{data.summary.pengajuanSelesai}</h3>
              </div>
            </div>
          </div>

          {/* TABEL 1: DAFTAR ASET IT PEGAWAI */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm">
            <div className="p-3.5 sm:p-4 border-b border-slate-700/50 font-semibold text-slate-200 text-xs sm:text-sm flex justify-between items-center">
              <span>Daftar Aset IT Milik Anda</span>
              <span className="text-[11px] font-normal text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                Total: {data.asetList.length} Unit
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-[#0f172a]/70 text-slate-400 uppercase text-[10px] sm:text-[11px] tracking-wider whitespace-nowrap">
                  <tr>
                    <th className="p-3.5 sm:p-4">Kode Aset</th>
                    <th className="p-3.5 sm:p-4">Nama Aset</th>
                    <th className="p-3.5 sm:p-4">Kategori</th>
                    <th className="p-3.5 sm:p-4">Lokasi</th>
                    <th className="p-3.5 sm:p-4">Status Aset</th>
                    <th className="p-3.5 sm:p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 whitespace-nowrap">
                  {paginatedAset.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-500 text-xs">
                        Belum ada aset terdaftar atas nama Anda.
                      </td>
                    </tr>
                  ) : (
                    paginatedAset.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 sm:p-4 font-mono text-blue-400 font-medium">{item.kode_aset}</td>
                        <td className="p-3.5 sm:p-4 font-semibold text-white">{item.nama_aset}</td>
                        <td className="p-3.5 sm:p-4">{item.kategori_aset?.nama_kategori || item.kategori || '-'}</td>
                        <td className="p-3.5 sm:p-4">{item.lokasi?.nama_lokasi || item.lokasi || '-'}</td>
                        <td className="p-3.5 sm:p-4">
                          {renderStatusAset(item.status)}
                        </td>
                        <td className="p-3.5 sm:p-4 text-center">
                          <button 
                            onClick={() => { setFormData({ ...formData, aset_id: item.id }); setShowModal(true); }}
                            className="text-[11px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 active:scale-95 border border-blue-500/20 px-3 py-1.5 rounded-lg transition font-medium">
                            Laporkan Kerusakan
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginasi Tabel Aset */}
            {data.asetList.length > ITEMS_PER_PAGE && (
              <div className="p-3 sm:p-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400 bg-[#0f172a]/30">
                <span>Halaman {pageAset} dari {totalPagesAset}</span>
                <div className="flex gap-2">
                  <button 
                    disabled={pageAset === 1}
                    onClick={() => setPageAset(p => Math.max(p - 1, 1))}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    disabled={pageAset === totalPagesAset}
                    onClick={() => setPageAset(p => Math.min(p + 1, totalPagesAset))}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TABEL 2: RIWAYAT PENGAJUAN PERBAIKAN */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm">
            <div className="p-3.5 sm:p-4 border-b border-slate-700/50 font-semibold text-slate-200 text-xs sm:text-sm flex justify-between items-center">
              <span>Riwayat Pengajuan Perbaikan</span>
              <span className="text-[11px] font-normal text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                Total: {data.pengajuanList.length} Laporan
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-[#0f172a]/70 text-slate-400 uppercase text-[10px] sm:text-[11px] tracking-wider whitespace-nowrap">
                  <tr>
                    <th className="p-3.5 sm:p-4">Tanggal</th>
                    <th className="p-3.5 sm:p-4">Aset</th>
                    <th className="p-3.5 sm:p-4">Deskripsi Masalah</th>
                    <th className="p-3.5 sm:p-4">Urgensi</th>
                    <th className="p-3.5 sm:p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 whitespace-nowrap">
                  {paginatedPengajuan.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-500 text-xs">
                        Belum ada riwayat pengajuan perbaikan.
                      </td>
                    </tr>
                  ) : (
                    paginatedPengajuan.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 sm:p-4 text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="p-3.5 sm:p-4 font-medium text-white">
                          {item.aset?.nama_aset || 'Aset'} <span className="text-slate-400 text-xs font-mono">({item.aset?.kode_aset})</span>
                        </td>
                        <td className="p-3.5 sm:p-4 max-w-xs truncate text-slate-300">{item.deskripsi_kerusakan}</td>
                        <td className="p-3.5 sm:p-4 uppercase text-[11px] font-semibold">
                          <span className={
                            item.tingkat_urgensi?.toLowerCase() === 'tinggi' ? 'text-red-400' :
                            item.tingkat_urgensi?.toLowerCase() === 'sedang' ? 'text-amber-400' : 'text-slate-400'
                          }>
                            {item.tingkat_urgensi || 'Sedang'}
                          </span>
                        </td>
                        <td className="p-3.5 sm:p-4">
                          <span className={`px-2.5 py-1 text-[11px] rounded-full font-medium ${
                            item.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            item.status === 'diproses' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            item.status === 'selesai' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginasi Tabel Riwayat */}
            {data.pengajuanList.length > ITEMS_PER_PAGE && (
              <div className="p-3 sm:p-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400 bg-[#0f172a]/30">
                <span>Halaman {pagePengajuan} dari {totalPagesPengajuan}</span>
                <div className="flex gap-2">
                  <button 
                    disabled={pagePengajuan === 1}
                    onClick={() => setPagePengajuan(p => Math.max(p - 1, 1))}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    disabled={pagePengajuan === totalPagesPengajuan}
                    onClick={() => setPagePengajuan(p => Math.min(p + 1, totalPagesPengajuan))}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL FORM PENGAJUAN PERBAIKAN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm sm:text-base font-bold text-white">Form Pengajuan Perbaikan Aset</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPengajuan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Pilih Aset Kerusakan</label>
                <select 
                  required 
                  value={formData.aset_id}
                  onChange={e => setFormData({ ...formData, aset_id: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500">
                  <option value="">-- Pilih Aset --</option>
                  {data.asetList.map(a => (
                    <option key={a.id} value={a.id}>{a.nama_aset} ({a.kode_aset})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tingkat Urgensi</label>
                <select 
                  value={formData.tingkat_urgensi}
                  onChange={e => setFormData({ ...formData, tingkat_urgensi: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500">
                  <option value="rendah">Rendah</option>
                  <option value="sedang">Sedang</option>
                  <option value="tinggi">Tinggi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Deskripsi Kerusakan</label>
                <textarea 
                  required 
                  rows="3"
                  placeholder="Jelaskan detail kendala/kerusakan pada perangkat..."
                  value={formData.deskripsi_kerusakan}
                  onChange={e => setFormData({ ...formData, deskripsi_kerusakan: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none"></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-medium transition">
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-50">
                  {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PegawaiDashboard;