import { useState, useEffect, useMemo, useCallback } from 'react';
import API from '../services/api';
import { 
  Laptop, 
  Search, 
  Filter, 
  Info, 
  Wrench, 
  Calendar, 
  MapPin, 
  Tag,
  X
} from 'lucide-react';

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

export default function PegawaiAset() {
  const [asetList, setAsetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  
  // State Modal Detail Aset
  const [selectedAset, setSelectedAset] = useState(null);

  // State Modal Pengajuan Perbaikan
  const [showModalPerbaikan, setShowModalPerbaikan] = useState(false);
  const [targetAset, setTargetAset] = useState(null);
  const [formData, setFormData] = useState({
    deskripsi_kerusakan: '',
    tingkat_urgensi: 'sedang'
  });
  const [submitting, setSubmitting] = useState(false);

  const user = useMemo(() => getStoredUser(), []);

  const fetchDataAsetPegawai = useCallback(async () => {
    try {
      const res = await API.get(`/pegawai/aset/${user.id}`);
      setAsetList(res.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil data aset pegawai:', err);
    }
  }, [user.id]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!user?.id) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setLoading(true);
      await fetchDataAsetPegawai();
      if (!cancelled) setLoading(false);
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user?.id, fetchDataAsetPegawai]);

  const handleOpenPerbaikanModal = (aset) => {
    setTargetAset(aset);
    setShowModalPerbaikan(true);
  };

  const handleSubmitPerbaikan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        user_id: user.id,
        aset_id: targetAset.id,
        deskripsi_kerusakan: formData.deskripsi_kerusakan,
        tingkat_urgensi: formData.tingkat_urgensi
      };

      const res = await API.post('/pegawai/pengajuan', payload);
      if (res.data.success) {
        alert('Pengaduan aset berhasil dikirim dan akan segera diproses oleh admin.');
        setShowModalPerbaikan(false);
        setFormData({ deskripsi_kerusakan: '', tingkat_urgensi: 'sedang' });
        fetchDataAsetPegawai(); // Refresh data
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim pengajuan perbaikan.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Aset Berdasarkan Input Pencarian & Kategori
  const filteredAset = asetList.filter((item) => {
    const namaAset = item?.nama_aset || '';
    const kodeAset = item?.kode_aset || '';
    const keyword = search.toLowerCase();

    const matchSearch =
      namaAset.toLowerCase().includes(keyword) ||
      kodeAset.toLowerCase().includes(keyword);

    const matchKategori = selectedKategori
      ? item?.kategori_aset?.nama_kategori === selectedKategori
      : true;

    return matchSearch && matchKategori;
  });

  // Ambil list unik kategori untuk opsi filter
  const kategoriOptions = [...new Set(asetList.map(a => a.kategori_aset?.nama_kategori).filter(Boolean))];

  return (
    <div className="space-y-4 sm:space-y-6 w-full font-sans text-slate-100 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      
      {/* 1. HEADER HALAMAN */}
      <div className="border-b border-slate-800 pb-4 sm:pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Laptop className="text-blue-500 shrink-0" size={22} /> Data Aset IT Saya
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
            Daftar perangkat lunak dan keras IT yang diserahterimakan kepada Anda.
          </p>
        </div>

        <div className="text-[11px] sm:text-xs bg-[#1e293b] border border-slate-700/80 px-3 py-2 rounded-xl text-slate-300 w-full sm:w-auto text-center shrink-0">
          Total Aset Pegang: <span className="font-bold text-blue-400">{asetList.length} Unit</span>
        </div>
      </div>

      {/* 2. FILTER & PENCARIAN */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        {/* Input Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau kode aset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1e293b] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
          />
        </div>

        {/* Dropdown Filter Kategori */}
        <div className="relative w-full sm:w-56">
          <Filter className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" size={16} />
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="w-full bg-[#1e293b] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 appearance-none transition cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {kategoriOptions.map((kat, idx) => (
              <option key={idx} value={kat}>{kat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. GRID CARD ASET */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[250px] text-slate-400 text-xs">
          <p className="animate-pulse">Memuat data aset IT milik Anda...</p>
        </div>
      ) : filteredAset.length === 0 ? (
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-8 sm:p-12 text-center text-slate-400">
          <Laptop size={40} className="mx-auto mb-3 text-slate-600 sm:w-12 sm:h-12" />
          <p className="text-xs sm:text-sm font-semibold text-slate-300">Tidak ada aset ditemukan</p>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || selectedKategori ? 'Coba ubah kata kunci pencarian/filter Anda.' : 'Belum ada aset IT yang terdaftar atas nama Anda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {filteredAset.map((item) => (
            <div 
              key={item.id} 
              className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-600 transition shadow-sm group"
            >
              <div>
                {/* Header Card */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg shrink-0">
                    {item.kode_aset}
                  </span>
                  
                  {/* Badge Status */}
                  <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border shrink-0 ${
                    item.status === 'baik' || item.status === 'aktif' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : item.status === 'perbaikan'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {item.status ? item.status.toUpperCase() : 'BAIK'}
                  </span>
                </div>

                {/* Nama Aset */}
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition mb-2.5 line-clamp-2">
                  {item.nama_aset}
                </h3>

                {/* Info Detail Singkat */}
                <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-slate-500 shrink-0" />
                    <span className="truncate">{item.kategori_aset?.nama_kategori || 'Tanpa Kategori'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-500 shrink-0" />
                    <span className="truncate">{item.lokasi?.nama_lokasi || 'Lokasi tidak diset'}</span>
                  </div>
                  {item.tanggal_penyerahan && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-500 shrink-0" />
                      <span className="truncate">Diserahkan: {new Date(item.tanggal_penyerahan).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-3 sm:pt-4 border-t border-slate-700/50 flex gap-2">
                <button
                  onClick={() => setSelectedAset(item)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 font-medium"
                >
                  <Info size={14} /> Detail
                </button>
                <button
                  onClick={() => handleOpenPerbaikanModal(item)}
                  className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 font-medium"
                >
                  <Wrench size={14} /> Adukan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. MODAL DETAIL ASET */}
      {selectedAset && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-start border-b border-slate-700 pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  {selectedAset.kode_aset}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">{selectedAset.nama_aset}</h3>
              </div>
              <button 
                onClick={() => setSelectedAset(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
              <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                <p className="text-slate-500">Kategori</p>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedAset.kategori_aset?.nama_kategori || '-'}</p>
              </div>
              <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                <p className="text-slate-500">Lokasi Penempatan</p>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedAset.lokasi?.nama_lokasi || '-'}</p>
              </div>
              <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                <p className="text-slate-500">Merk / Spesifikasi</p>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedAset.spesifikasi || selectedAset.merk || '-'}</p>
              </div>
              <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                <p className="text-slate-500">Status Kondisi</p>
                <p className="font-semibold text-emerald-400 mt-0.5 uppercase">{selectedAset.status || 'Baik'}</p>
              </div>
            </div>

            {selectedAset.catatan && (
              <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 text-xs">
                <p className="text-slate-500">Catatan Khusus</p>
                <p className="text-slate-300 mt-0.5">{selectedAset.catatan}</p>
              </div>
            )}

            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
              <button
                onClick={() => setSelectedAset(null)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-medium transition"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const item = selectedAset;
                  setSelectedAset(null);
                  handleOpenPerbaikanModal(item);
                }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Wrench size={14} /> Ajukan Pengaduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL FORM PENGAJUAN PERBAIKAN */}
      {showModalPerbaikan && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="border-b border-slate-700 pb-3 flex justify-between items-start gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Kirim Pengaduan Aset</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Sampaikan kendala perangkat Anda agar admin dapat menindaklanjuti.</p>
              </div>
              <button 
                onClick={() => setShowModalPerbaikan(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 text-xs">
              <p className="text-slate-400">Aset Dipilih:</p>
              <p className="font-bold text-blue-400 mt-0.5 truncate">{targetAset?.nama_aset} ({targetAset?.kode_aset})</p>
            </div>

            <form onSubmit={handleSubmitPerbaikan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Tingkat Urgensi Kerusakan</label>
                <select
                  value={formData.tingkat_urgensi}
                  onChange={(e) => setFormData({ ...formData, tingkat_urgensi: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-2.5 sm:p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="rendah">Rendah (Masih bisa digunakan sementara)</option>
                  <option value="sedang">Sedang (Mengganggu alur kerja)</option>
                  <option value="tinggi">Tinggi (Aset mati total / Sangat Urgent)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Detail Kendala / Kerusakan</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Ceritakan detail kendala yang dialami pada perangkat dan dampaknya terhadap pekerjaan..."
                  value={formData.deskripsi_kerusakan}
                  onChange={(e) => setFormData({ ...formData, deskripsi_kerusakan: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-2.5 sm:p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
                ></textarea>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalPerbaikan(false)}
                  className="w-full sm:flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Pengaduan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}