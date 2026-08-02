import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ExportButton from '../components/ExportButton';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Filter, 
  X 
} from 'lucide-react';

export default function Aset() {
  const [asetList, setAsetList] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // State Modal Form (Tambah / Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    kode_aset: '',
    nama_aset: '',
    kategori: 'Laptop/PC',
    merk_model: '',
    nomor_seri: '',
    lokasi_id: '',
    kondisi: 'Baik',
    status: 'Aktif',
    tahun_pembelian: new Date().getFullYear(),
  });

  // Helper untuk mengekstrak string Kategori & Lokasi dengan aman
  const getKategoriName = (kategori) => {
    if (!kategori) return '-';
    if (typeof kategori === 'object') {
      return kategori.nama_kategori || kategori.nama || '-';
    }
    return String(kategori);
  };

  const getLokasiName = (lokasi) => {
    if (!lokasi) return '-';
    if (typeof lokasi === 'object') {
      return lokasi.nama_lokasi || lokasi.nama || '-';
    }
    return String(lokasi);
  };

  // 1. Deklarasi Fungsi Fetch Dulu (Mencegah ESLint / Hoisting Error)
  const fetchAset = async () => {
    try {
      setLoading(true);
      const res = await API.get('/aset');
      setAsetList(res.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil data aset:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLokasi = async () => {
    try {
      const res = await API.get('/lokasi');
      setLokasiList(res.data.data || []);
    } catch (err) {
      console.warn('Endpoint /api/lokasi belum tersedia di backend:', err.message);
      setLokasiList([]); // Set array kosong agar tidak error
    }
  };

  // 2. Pemanggilan useEffect di Bawah Deklarasi Fungsi
  useEffect(() => {
    fetchAset();
    fetchLokasi();
  }, []);

  // Handle Input Change Form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open Modal Tambah
  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedId(null);
    setFormData({
      kode_aset: '',
      nama_aset: '',
      kategori: 'Laptop/PC',
      merk_model: '',
      nomor_seri: '',
      lokasi_id: lokasiList[0]?.id || '',
      kondisi: 'Baik',
      status: 'Aktif',
      tahun_pembelian: new Date().getFullYear(),
    });
    setShowModal(true);
  };

  // Open Modal Edit
  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setSelectedId(item.id);
    setFormData({
      kode_aset: item.kode_aset || '',
      nama_aset: item.nama_aset || '',
      kategori: getKategoriName(item.kategori) !== '-' ? getKategoriName(item.kategori) : 'Laptop/PC',
      merk_model: item.merk_model || '',
      nomor_seri: item.nomor_seri || '',
      lokasi_id: item.lokasi_id || item.lokasi?.id || '',
      kondisi: item.kondisi || 'Baik',
      status: item.status || 'Aktif',
      tahun_pembelian: item.tahun_pembelian || new Date().getFullYear(),
    });
    setShowModal(true);
  };

  // Submit Form (Tambah / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await API.put(`/aset/${selectedId}`, formData);
        alert('Data aset berhasil diperbarui!');
      } else {
        await API.post('/aset', formData);
        alert('Aset baru berhasil ditambahkan!');
      }
      setShowModal(false);
      fetchAset();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data aset.');
    }
  };

  // Handle Delete
  const handleDelete = async (id, nama) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus aset "${nama}"?`)) {
      try {
        await API.delete(`/aset/${id}`);
        alert('Aset berhasil dihapus.');
        fetchAset();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus aset.');
      }
    }
  };

  // Filter Data Aset
  const filteredAset = asetList.filter((item) => {
    const katName = getKategoriName(item.kategori);
    
    const matchesSearch =
      item.nama_aset?.toLowerCase().includes(search.toLowerCase()) ||
      item.kode_aset?.toLowerCase().includes(search.toLowerCase()) ||
      (item.merk_model && item.merk_model.toLowerCase().includes(search.toLowerCase()));

    const matchesKategori = filterKategori ? katName === filterKategori : true;
    const matchesStatus = filterStatus ? item.status === filterStatus : true;

    return matchesSearch && matchesKategori && matchesStatus;
  });

  // Format Data Khusus untuk Export Excel & PDF
  const printableAsetData = filteredAset.map((item, idx) => ({
    No: idx + 1,
    Kode_Aset: item.kode_aset,
    Nama_Aset: item.nama_aset,
    Kategori: getKategoriName(item.kategori),
    Merk_Model: item.merk_model || '-',
    Nomor_Seri: item.nomor_seri || '-',
    Lokasi: getLokasiName(item.lokasi),
    Status: item.status,
    Kondisi: item.kondisi,
    Tahun_Beli: item.tahun_pembelian || '-'
  }));

  return (
    <div className="space-y-6">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Data Aset IT</h1>
          <p className="text-sm text-slate-500">Kelola daftar inventaris perangkat dan aset IT perusahaan</p>
        </div>

        {/* Action Buttons: Export & Tambah */}
        <div className="flex items-center gap-3">
          <ExportButton 
            data={printableAsetData} 
            filename="Laporan_Data_Aset_IT" 
            title="Laporan Inventaris Data Aset IT" 
          />
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Aset
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode, nama aset, atau merk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
            <Filter className="w-4 h-4" />
            Filter:
          </div>

          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Kategori</option>
            <option value="Laptop/PC">Laptop/PC</option>
            <option value="Printer/Scanner">Printer/Scanner</option>
            <option value="Jaringan (Router/Switch)">Jaringan (Router/Switch)</option>
            <option value="Server/Storage">Server/Storage</option>
            <option value="Aksesoris/Lainnya">Aksesoris/Lainnya</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Dalam Perbaikan">Dalam Perbaikan</option>
            <option value="Afkir/Dipensiunkan">Afkir/Dipensiunkan</option>
          </select>
        </div>
      </div>

      {/* TABEL DATA ASET */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Kode Aset</th>
                <th className="p-4">Nama Aset</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Kondisi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                    Memuat data aset...
                  </td>
                </tr>
              ) : filteredAset.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada data aset yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredAset.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-mono font-semibold text-indigo-600">{item.kode_aset}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{item.nama_aset}</div>
                      <div className="text-xs text-slate-400">{item.merk_model || '-'}</div>
                    </td>
                    <td className="p-4 text-slate-600">{getKategoriName(item.kategori)}</td>
                    <td className="p-4 text-slate-600">{getLokasiName(item.lokasi)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.kondisi === 'Baik' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.kondisi === 'Rusak Ringan' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.kondisi}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Aktif' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        item.status === 'Dalam Perbaikan' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Aset"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama_aset)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Aset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT ASET */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {isEdit ? 'Edit Data Aset' : 'Tambah Aset Baru'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kode Aset */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Aset *</label>
                  <input
                    type="text"
                    name="kode_aset"
                    required
                    placeholder="Contoh: AST-LPT-001"
                    value={formData.kode_aset}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Nama Aset */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Aset *</label>
                  <input
                    type="text"
                    name="nama_aset"
                    required
                    placeholder="Contoh: Macbook Pro M1 14 inch"
                    value={formData.nama_aset}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori *</label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Laptop/PC">Laptop/PC</option>
                    <option value="Printer/Scanner">Printer/Scanner</option>
                    <option value="Jaringan (Router/Switch)">Jaringan (Router/Switch)</option>
                    <option value="Server/Storage">Server/Storage</option>
                    <option value="Aksesoris/Lainnya">Aksesoris/Lainnya</option>
                  </select>
                </div>

                {/* Merk / Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Merk / Model</label>
                  <input
                    type="text"
                    name="merk_model"
                    placeholder="Contoh: Apple / A2442"
                    value={formData.merk_model}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Nomor Seri */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Seri (S/N)</label>
                  <input
                    type="text"
                    name="nomor_seri"
                    placeholder="Contoh: C02G1234Q659"
                    value={formData.nomor_seri}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Lokasi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi Penempatan</label>
                  <select
                    name="lokasi_id"
                    value={formData.lokasi_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Lokasi --</option>
                    {lokasiList.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.nama_lokasi || loc.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kondisi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kondisi</label>
                  <select
                    name="kondisi"
                    value={formData.kondisi}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status Operasional</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                    <option value="Afkir/Dipensiunkan">Afkir/Dipensiunkan</option>
                  </select>
                </div>

                {/* Tahun Pembelian */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun Pembelian</label>
                  <input
                    type="number"
                    name="tahun_pembelian"
                    value={formData.tahun_pembelian}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
                >
                  {isEdit ? 'Simpan Perubahan' : 'Tambah Aset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}