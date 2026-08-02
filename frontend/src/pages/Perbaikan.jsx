import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  X,
  RotateCcw
} from 'lucide-react';

export default function Perbaikan() {
  const [tiketList, setTiketList] = useState([]);
  const [asetList, setAsetList] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Pencarian & Filter Dropdown
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [urgensiFilter, setUrgensiFilter] = useState('Semua');

  // State Modal Buat Tiket
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [asetId, setAsetId] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [urgensi, setUrgensi] = useState('Sedang');

  // State Modal Respon Tiket
  const [selectedTiket, setSelectedTiket] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('Diproses');
  const [rincianTindakan, setRincianTindakan] = useState('');
  const [komponen, setKomponen] = useState('');
  const [biaya, setBiaya] = useState(0);
  const [alasanPenolakan, setAlasanPenolakan] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTiket, resAset] = await Promise.all([
        API.get('/perbaikan'),
        API.get('/aset')
      ]);
      setTiketList(resTiket.data.data || []);
      setAsetList(resAset.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset Semua Filter
  const handleResetFilter = () => {
    setSearchTerm('');
    setStatusFilter('Semua');
    setUrgensiFilter('Semua');
  };

  // Handler Buat Tiket Baru
  const handleCreateTiket = async (e) => {
    e.preventDefault();
    if (!asetId) {
      alert('Pilih aset yang mengalami kerusakan!');
      return;
    }

    try {
      await API.post('/perbaikan', {
        aset_id: asetId,
        deskripsi_kerusakan: deskripsi,
        tingkat_urgensi: urgensi
      });

      setShowModalCreate(false);
      setAsetId('');
      setDeskripsi('');
      setUrgensi('Sedang');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat tiket perbaikan');
    }
  };

  // Handler Respon Status Tiket
  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (statusUpdate === 'Ditolak' && !alasanPenolakan.trim()) {
      alert('Mohon isi alasan penolakan pengajuan!');
      return;
    }

    try {
      await API.patch(`/perbaikan/${selectedTiket.id}/status`, {
        status: statusUpdate,
        rincian_tindakan: rincianTindakan,
        komponen_diganti: komponen,
        biaya: Number(biaya),
        alasan_penolakan: alasanPenolakan
      });

      setSelectedTiket(null);
      setRincianTindakan('');
      setKomponen('');
      setBiaya(0);
      setAlasanPenolakan('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui status tiket');
    }
  };

  // Handler Hapus Tiket
  const handleDeleteTiket = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tiket pengajuan ini?')) return;
    try {
      await API.delete(`/perbaikan/${id}`);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus tiket pengajuan');
    }
  };

  // Filtering Tiket berdasarkan Teks, Dropdown Status, & Dropdown Urgensi
  const filteredTiket = tiketList.filter((item) => {
    const matchesSearch = 
      item.nomor_tiket?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.aset?.nama_aset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pelapor?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi_kerusakan?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Semua' || item.status === statusFilter;
    const matchesUrgensi = urgensiFilter === 'Semua' || item.tingkat_urgensi === urgensiFilter;

    return matchesSearch && matchesStatus && matchesUrgensi;
  });

  return (
    <div className="space-y-6 font-sans text-slate-100">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Wrench size={22} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Pengajuan Perbaikan Aset</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-10">
            Kelola dan pantau seluruh tiket pemeliharaan & perbaikan perangkat IT SAMSAT
          </p>
        </div>

        <button
          onClick={() => setShowModalCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> Buat Tiket Perbaikan
        </button>
      </div>

      {/* SEARCH & DROPDOWN FILTER BAR */}
      <div className="bg-[#1e293b]/80 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Input Pencarian Utama */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-2.5 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Cari no. tiket, aset, pelapor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Group Dropdown Filter */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
              <Filter size={14} className="text-indigo-400" />
              <span className="font-medium hidden sm:inline">Filter:</span>
            </div>

            {/* Dropdown Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Pending">Status: Pending</option>
              <option value="Diproses">Status: Diproses</option>
              <option value="Selesai">Status: Selesai</option>
              <option value="Ditolak">Status: Ditolak</option>
            </select>

            {/* Dropdown Filter Urgensi */}
            <select
              value={urgensiFilter}
              onChange={(e) => setUrgensiFilter(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="Semua">Semua Urgensi</option>
              <option value="Tinggi">Urgensi: Tinggi</option>
              <option value="Sedang">Urgensi: Sedang</option>
              <option value="Rendah">Urgensi: Rendah</option>
            </select>

            {/* Tombol Reset Filter */}
            {(searchTerm || statusFilter !== 'Semua' || urgensiFilter !== 'Semua') && (
              <button
                onClick={handleResetFilter}
                className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition cursor-pointer"
                title="Reset Semua Filter"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* TABEL TIKET */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">No. Tiket</th>
                <th className="p-4">Aset IT</th>
                <th className="p-4">Pelapor</th>
                <th className="p-4">Deskripsi Kerusakan</th>
                <th className="p-4">Urgensi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data tiket perbaikan...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTiket.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wrench className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                      <span>Belum ada tiket pengajuan perbaikan yang cocok dengan filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTiket.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Nomor Tiket */}
                    <td className="p-4 font-mono font-medium text-indigo-400">
                      {item.nomor_tiket}
                    </td>

                    {/* Detail Aset */}
                    <td className="p-4">
                      <div className="font-semibold text-white">
                        {item.aset?.nama_aset || 'Aset Tidak Ditemukan'}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.aset?.kode_aset || '-'}
                      </span>
                    </td>

                    {/* Pelapor */}
                    <td className="p-4 text-slate-300">
                      {item.pelapor?.nama_lengkap || item.pelapor?.nama || 'Pegawai'}
                    </td>

                    {/* Deskripsi Kerusakan */}
                    <td className="p-4 text-slate-400 max-w-xs truncate" title={item.deskripsi_kerusakan}>
                      {item.deskripsi_kerusakan}
                    </td>

                    {/* Urgensi */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        item.tingkat_urgensi === 'Tinggi' 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        item.tingkat_urgensi === 'Sedang' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {item.tingkat_urgensi}
                      </span>
                    </td>

                    {/* Status Tiket */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        item.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        item.status === 'Diproses' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        item.status === 'Ditolak' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {item.status === 'Pending' && <Clock size={12} />}
                        {item.status === 'Diproses' && <Wrench size={12} />}
                        {item.status === 'Selesai' && <CheckCircle2 size={12} />}
                        {item.status === 'Ditolak' && <XCircle size={12} />}
                        {item.status}
                      </span>

                      {item.status === 'Ditolak' && item.alasan_penolakan && (
                        <p className="text-[11px] text-rose-400 mt-1 italic">
                          Ket: {item.alasan_penolakan}
                        </p>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Tombol Respon Admin & Teknisi */}
                        {(user?.role === 'admin' || user?.role === 'teknisi') && item.status !== 'Selesai' && item.status !== 'Ditolak' && (
                          <button
                            onClick={() => {
                              setSelectedTiket(item);
                              setStatusUpdate(item.status === 'Pending' ? 'Diproses' : 'Selesai');
                              setAlasanPenolakan('');
                            }}
                            className="flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer"
                          >
                            <Edit3 size={13} /> Respon
                          </button>
                        )}

                        {/* Tombol Hapus Khusus Admin */}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteTiket(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer rounded-lg hover:bg-rose-500/10"
                            title="Hapus Tiket"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: BUAT TIKET PERBAIKAN */}
      {showModalCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-400" /> Buat Tiket Perbaikan
              </h2>
              <button 
                onClick={() => setShowModalCreate(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTiket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Pilih Aset IT Rusak *</label>
                <select
                  required
                  value={asetId}
                  onChange={(e) => setAsetId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="">-- Pilih Perangkat Aset --</option>
                  {asetList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nama_aset} ({a.kode_aset})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Tingkat Urgensi</label>
                <select
                  value={urgensi}
                  onChange={(e) => setUrgensi(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Deskripsi Kerusakan *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Jelaskan kendala/kerusakan perangkat..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModalCreate(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition shadow-lg shadow-indigo-600/25 cursor-pointer"
                >
                  Kirim Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESPON TEKNISI / ADMIN */}
      {selectedTiket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Tindak Lanjut Tiket</h2>
                <span className="text-xs font-mono text-indigo-400">{selectedTiket.nomor_tiket}</span>
              </div>
              <button 
                onClick={() => setSelectedTiket(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Update Status Tiket *</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition font-semibold"
                >
                  <option value="Diproses">Diproses (Sedang Dikerjakan)</option>
                  <option value="Selesai">Selesai (Perbaikan Tuntas)</option>
                  <option value="Ditolak">Ditolak (Pengajuan Tidak Valid)</option>
                </select>
              </div>

              {statusUpdate === 'Ditolak' ? (
                <div>
                  <label className="block text-rose-400 font-medium mb-1.5">Alasan Penolakan *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Alasan penolakan pengajuan..."
                    value={alasanPenolakan}
                    onChange={(e) => setAlasanPenolakan(e.target.value)}
                    className="w-full bg-[#0f172a] border border-rose-500/40 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-rose-500 transition"
                  ></textarea>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">Rincian Tindakan Perbaikan</label>
                    <textarea
                      rows="2"
                      placeholder="Contoh: Pembersihan roller printer..."
                      value={rincianTindakan}
                      onChange={(e) => setRincianTindakan(e.target.value)}
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">Komponen Diganti</label>
                      <input
                        type="text"
                        placeholder="Contoh: Roller Kit"
                        value={komponen}
                        onChange={(e) => setKomponen(e.target.value)}
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">Biaya Perbaikan (Rp)</label>
                      <input
                        type="number"
                        value={biaya}
                        onChange={(e) => setBiaya(e.target.value)}
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTiket(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-xl font-semibold transition cursor-pointer ${
                    statusUpdate === 'Ditolak' 
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25' 
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25'
                  }`}
                >
                  {statusUpdate === 'Ditolak' ? 'Tolak Pengajuan' : 'Simpan Respons'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}