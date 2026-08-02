import React, { useState, useEffect } from 'react';
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
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  PlusCircle
} from 'lucide-react';

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

  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    if (user?.id) {
      fetchDataAsetPegawai();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDataAsetPegawai = async () => {
    try {
      setLoading(true);
      // Mengambil data aset khusus pegawai yang login
      const res = await API.get(`/pegawai/aset/${user.id}`);
      setAsetList(res.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil data aset pegawai:', err);
    } finally {
      setLoading(false);
    }
  };

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
        alert('Pengajuan perbaikan aset berhasil dikirim!');
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
    const matchSearch = 
      item.nama_aset.toLowerCase().includes(search.toLowerCase()) ||
      item.kode_aset.toLowerCase().includes(search.toLowerCase());
    
    const matchKategori = selectedKategori 
      ? item.kategori_aset?.nama_kategori === selectedKategori 
      : true;

    return matchSearch && matchKategori;
  });

  // Ambil list unik kategori untuk opsi filter
  const kategoriOptions = [...new Set(asetList.map(a => a.kategori_aset?.nama_kategori).filter(Boolean))];

  return (
    <div className="space-y-6 w-full font-sans text-slate-100">
      
      {/* 1. HEADER HALAMAN */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Laptop className="text-blue-500" size={24} /> Data Aset IT Saya
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Daftar perangkat lunak dan keras IT yang diserahterimakan kepada Anda.
          </p>
        </div>

        <div className="text-xs bg-[#1e293b] border border-slate-700 px-3 py-2 rounded-xl text-slate-300">
          Total Aset Pegang: <span className="font-bold text-blue-400">{asetList.length} Unit</span>
        </div>
      </div>

      {/* 2. FILTER & PENCARIAN */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau kode aset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1e293b] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Dropdown Filter Kategori */}
        <div className="relative w-full sm:w-56">
          <Filter className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="w-full bg-[#1e293b] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 appearance-none transition"
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
        <div className="flex justify-center items-center h-64 text-slate-400 text-xs">
          <p className="animate-pulse">Memuat data aset IT milik Anda...</p>
        </div>
      ) : filteredAset.length === 0 ? (
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-12 text-center text-slate-400">
          <Laptop size={48} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">Tidak ada aset ditemukan</p>
          <p className="text-xs text-slate-500 mt-1">
            {search || selectedKategori ? 'Coba ubah kata kunci pencarian/filter Anda.' : 'Belum ada aset IT yang terdaftar atas nama Anda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAset.map((item) => (
            <div 
              key={item.id} 
              className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-5 flex flex-col justify-between hover:border-slate-600 transition shadow-sm group"
            >
              <div>
                {/* Header Card */}
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                    {item.kode_aset}
                  </span>
                  
                  {/* Badge Status */}
                  <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${
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
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition mb-2">
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
                      <span>Diserahkan: {new Date(item.tanggal_penyerahan).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 border-t border-slate-700/50 flex gap-2">
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
                  <Wrench size={14} /> Laporkan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. MODAL DETAIL ASET */}
      {selectedAset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-700 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  {selectedAset.kode_aset}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedAset.nama_aset}</h3>
              </div>
              <button 
                onClick={() => setSelectedAset(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
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

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  const item = selectedAset;
                  setSelectedAset(null);
                  handleOpenPerbaikanModal(item);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
              >
                <Wrench size={14} /> Laporkan Perbaikan
              </button>
              <button
                onClick={() => setSelectedAset(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL FORM PENGAJUAN PERBAIKAN */}
      {showModalPerbaikan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-700 pb-3">
              Laporkan Kerusakan Aset
            </h3>

            <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 text-xs">
              <p className="text-slate-400">Aset Dipilih:</p>
              <p className="font-bold text-blue-400 mt-0.5">{targetAset?.nama_aset} ({targetAset?.kode_aset})</p>
            </div>

            <form onSubmit={handleSubmitPerbaikan} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Tingkat Urgensi Kerusakan</label>
                <select
                  value={formData.tingkat_urgensi}
                  onChange={(e) => setFormData({ ...formData, tingkat_urgensi: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
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
                  placeholder="Ceritakan detail kendala yang dialami pada perangkat..."
                  value={formData.deskripsi_kerusakan}
                  onChange={(e) => setFormData({ ...formData, deskripsi_kerusakan: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalPerbaikan(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}