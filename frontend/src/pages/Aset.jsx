import { useState, useEffect } from 'react';
import API from '../services/api';
import ExportButton from '../components/ExportButton';
import { 
  Laptop, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Filter, 
  X,
  RotateCcw,
  UserCog
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

export default function Aset() {
  const [asetList, setAsetList] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Search
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
    kategori_id: '',
    merk_model: '',
    nomor_seri: '',
    lokasi_id: '',
    user_id: '',
    kondisi: 'Baik',
    status: 'Aktif',
  });

  // Helper string safe getters
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

  // Fetch Data Aset & Lokasi
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
      setLokasiList([]);
    }
  };

  const fetchKategori = async () => {
    try {
      const res = await API.get('/master/kategori');
      setKategoriList(res.data.data || []);
    } catch (err) {
      console.warn('Gagal mengambil daftar kategori:', err.message);
      setKategoriList([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUserList(res.data.data || []);
    } catch (err) {
      console.warn('Gagal mengambil daftar pengguna:', err.message);
      setUserList([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchAset(), fetchLokasi(), fetchKategori(), fetchUsers()]);
    };

    loadData();
  }, []);

  // Reset Filter
  const handleResetFilter = () => {
    setSearch('');
    setFilterKategori('');
    setFilterStatus('');
  };

  // Handle Form Change
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
      kategori_id: kategoriList[0]?.id || '',
      merk_model: '',
      nomor_seri: '',
      lokasi_id: lokasiList[0]?.id || '',
      user_id: '',
      kondisi: 'Baik',
      status: 'Aktif',
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
      kategori_id: item.kategori_id || item.kategori?.id || '',
      merk_model: item.merk_model || '',
      nomor_seri: item.nomor_seri || '',
      lokasi_id: item.lokasi_id || item.lokasi?.id || '',
      user_id: item.user_id || '',
      kondisi: item.kondisi || 'Baik',
      status: item.status || 'Aktif',
    });
    setShowModal(true);
  };

  // Submit Form
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

  // Delete Aset
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

  // Filter Logic
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

  // Export Data Payload
  const printableAsetData = filteredAset.map((item, idx) => ({
    No: idx + 1,
    Kode_Aset: item.kode_aset,
    Nama_Aset: item.nama_aset,
    Kategori: getKategoriName(item.kategori),
    Merk_Model: item.merk_model || '-',
    Nomor_Seri: item.nomor_seri || '-',
    Lokasi: getLokasiName(item.lokasi),
    Pemilik: userList.find((u) => u.id === item.user_id)?.nama_lengkap || 'Belum Ditetapkan',
    Status: item.status,
    Kondisi: item.kondisi,
    Catatan: '-'
  }));

  return (
    <div className="space-y-6 font-sans text-slate-100">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Laptop size={22} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Master Data Aset IT</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-10">
            Kelola dan pantau seluruh daftar inventaris perangkat dan aset IT perusahaan
          </p>
        </div>

        {/* Action Buttons: Export & Tambah */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <ExportButton 
            data={printableAsetData} 
            filename="Laporan_Data_Aset_IT" 
            title="Laporan Inventaris Data Aset IT" 
          />
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Tambah Aset
          </button>
        </div>
      </div>

      {/* SEARCH & DROPDOWN FILTER BAR */}
      <div className="bg-[#1e293b]/80 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Input Pencarian Utama */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-2.5 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Cari kode, nama aset, atau merk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Group Dropdown Filter */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
              <Filter size={14} className="text-indigo-400" />
              <span className="font-medium hidden sm:inline">Filter:</span>
            </div>

            {/* Dropdown Filter Kategori */}
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              <option value="Laptop/PC">Laptop/PC</option>
              <option value="Printer/Scanner">Printer/Scanner</option>
              <option value="Jaringan (Router/Switch)">Jaringan (Router/Switch)</option>
              <option value="Server/Storage">Server/Storage</option>
              <option value="Aksesoris/Lainnya">Aksesoris/Lainnya</option>
            </select>

            {/* Dropdown Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Dalam Perbaikan">Dalam Perbaikan</option>
              <option value="Afkir/Dipensiunkan">Afkir/Dipensiunkan</option>
            </select>

            {/* Tombol Reset Filter */}
            {(search || filterKategori || filterStatus) && (
              <button
                onClick={handleResetFilter}
                className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition cursor-pointer"
                title="Reset Filter"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* TABEL DATA ASET */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Kode Aset</th>
                <th className="p-4">Nama Aset</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Pemilik</th>
                <th className="p-4">Kondisi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data aset...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAset.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Laptop className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                      <span>Tidak ada data aset yang ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAset.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Kode Aset */}
                    <td className="p-4 font-mono font-medium text-indigo-400">
                      {item.kode_aset}
                    </td>

                    {/* Nama & Merk/Model */}
                    <td className="p-4">
                      <div className="font-semibold text-white">{item.nama_aset}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.merk_model || '-'}</div>
                    </td>

                    {/* Kategori */}
                    <td className="p-4 text-slate-300">
                      {getKategoriName(item.kategori)}
                    </td>

                    {/* Lokasi */}
                    <td className="p-4 text-slate-400">
                      {getLokasiName(item.lokasi)}
                    </td>

                    {/* Pemilik */}
                    <td className="p-4 text-slate-400">
                      {item.user_id ? (userList.find((u) => u.id === item.user_id)?.nama_lengkap || 'Pegawai') : 'Belum Ditetapkan'}
                    </td>

                    {/* Kondisi */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        item.kondisi === 'Baik' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        item.kondisi === 'Rusak Ringan' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {item.kondisi}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        item.status === 'Aktif' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        item.status === 'Dalam Perbaikan' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition cursor-pointer"
                          title="Edit Aset"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama_aset)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Hapus Aset"
                        >
                          <Trash2 size={15} />
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-400" />
                {isEdit ? 'Edit Data Aset' : 'Tambah Aset Baru'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Kode Aset */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Kode Aset *</label>
                  <input
                    type="text"
                    name="kode_aset"
                    required
                    placeholder="Contoh: AST-LPT-001"
                    value={formData.kode_aset}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Nama Aset */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Nama Aset *</label>
                  <input
                    type="text"
                    name="nama_aset"
                    required
                    placeholder="Contoh: Macbook Pro M1 14 inch"
                    value={formData.nama_aset}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Kategori *</label>
                  <select
                    name="kategori_id"
                    value={formData.kategori_id}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriList.map((kat) => (
                      <option key={kat.id} value={kat.id}>
                        {kat.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Merk / Model */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Merk / Model</label>
                  <input
                    type="text"
                    name="merk_model"
                    placeholder="Contoh: Apple / A2442"
                    value={formData.merk_model}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Nomor Seri */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Nomor Seri (S/N)</label>
                  <input
                    type="text"
                    name="nomor_seri"
                    placeholder="Contoh: C02G1234Q659"
                    value={formData.nomor_seri}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Lokasi */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Lokasi Penempatan</label>
                  <select
                    name="lokasi_id"
                    value={formData.lokasi_id}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="">-- Pilih Lokasi --</option>
                    {lokasiList.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.nama_lokasi || loc.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pemilik */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Penetapan Pemilik</label>
                  <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="">-- Belum Ditetapkan --</option>
                    {userList.filter((user) => user.role === 'pegawai').map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nama_lengkap || user.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kondisi */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Kondisi</label>
                  <select
                    name="kondisi"
                    value={formData.kondisi}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Status Operasional</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                    <option value="Afkir/Dipensiunkan">Afkir/Dipensiunkan</option>
                  </select>
                </div>

                {/* Informasi Tambahan */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1.5">Informasi Tambahan</label>
                  <div className="rounded-xl border border-slate-700 bg-[#0f172a] px-3.5 py-3 text-[11px] text-slate-400">
                    Data tambahan seperti tahun pembelian dapat disesuaikan di backend sesuai struktur tabel aset yang Anda gunakan.
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-[11px] text-indigo-200 flex items-start gap-2">
                <UserCog size={14} className="mt-0.5 shrink-0" />
                <span>Admin dapat menetapkan pemilik aset di sini, lalu aset tersebut akan tampil otomatis di halaman pengguna yang bersangkutan.</span>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition shadow-lg shadow-indigo-600/25 cursor-pointer"
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