import { useState, useEffect } from 'react';
import API from '../services/api.js';

export default function Aset() {
  const [asetList, setAsetList] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    kode_aset: '',
    nama_aset: '',
    kategori_id: '',
    lokasi_id: '',
    merk_model: '',
    nomor_seri: '',
    kondisi: 'Baik',
    status: 'Aktif'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAset, resLokasi, resKategori] = await Promise.all([
        API.get('/aset'),
        API.get('/master/lokasi'),
        API.get('/master/kategori')
      ]);
      setAsetList(resAset.data.data || []);
      setLokasiList(resLokasi.data.data || []);
      setKategoriList(resKategori.data.data || []);
    } catch (err) {
      alert('Gagal mengambil data aset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    // Auto generate kode aset acak sederhana: AST-SAMSAT-XXXX
    const autoCode = `AST-SAM-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      kode_aset: autoCode,
      nama_aset: '',
      kategori_id: kategoriList[0]?.id || '',
      lokasi_id: lokasiList[0]?.id || '',
      merk_model: '',
      nomor_seri: '',
      kondisi: 'Baik',
      status: 'Aktif'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/aset', formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Gagal menambahkan data aset baru');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aset ini?')) return;
    try {
      await API.delete(`/aset/${id}`);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus aset');
    }
  };

  // Logic Filtering Data
  const filteredAset = asetList.filter((item) => {
    const matchSearch = item.nama_aset.toLowerCase().includes(search.toLowerCase()) || 
                        item.kode_aset.toLowerCase().includes(search.toLowerCase());
    const matchKategori = filterKategori ? item.kategori_id === filterKategori : true;
    const matchLokasi = filterLokasi ? item.lokasi_id === filterLokasi : true;
    return matchSearch && matchKategori && matchLokasi;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Aset IT SAMSAT</h1>
          <p className="text-slate-500 text-sm">Kelola inventaris seluruh perangkat jaringan dan PC</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          + Tambah Aset Baru
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Cari nama atau kode aset..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-blue-500"
        />
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm text-slate-700"
        >
          <option value="">-- Semua Kategori --</option>
          {kategoriList.map((k) => (
            <option key={k.id} value={k.id}>{k.nama_kategori}</option>
          ))}
        </select>
        <select
          value={filterLokasi}
          onChange={(e) => setFilterLokasi(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm text-slate-700"
        >
          <option value="">-- Semua Lokasi --</option>
          {lokasiList.map((l) => (
            <option key={l.id} value={l.id}>{l.nama_lokasi}</option>
          ))}
        </select>
      </div>

      {/* TABEL ASET */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-700 border-b">
              <tr>
                <th className="p-4">Kode Aset</th>
                <th className="p-4">Nama Perangkat</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Merk / Seri</th>
                <th className="p-4">Kondisi</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-4 text-center">Memuat data...</td></tr>
              ) : filteredAset.length === 0 ? (
                <tr><td colSpan="7" className="p-4 text-center">Data aset tidak ditemukan.</td></tr>
              ) : (
                filteredAset.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-mono font-semibold text-blue-600">{item.kode_aset}</td>
                    <td className="p-4 font-medium text-slate-800">{item.nama_aset}</td>
                    <td className="p-4">{item.kategori?.nama_kategori || '-'}</td>
                    <td className="p-4">{item.lokasi?.nama_lokasi || '-'}</td>
                    <td className="p-4 text-slate-500">{item.merk_model || '-'} / {item.nomor_seri || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.kondisi === 'Baik' ? 'bg-green-100 text-green-700' :
                        item.kondisi === 'Rusak Ringan' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.kondisi}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH ASET */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Tambah Aset IT Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Kode Aset (Auto)</label>
                <input
                  type="text"
                  value={formData.kode_aset}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-slate-100 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Nama Perangkat / Aset *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PC Kasir Loket 1"
                  value={formData.nama_aset}
                  onChange={(e) => setFormData({...formData, nama_aset: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Kategori</label>
                  <select
                    value={formData.kategori_id}
                    onChange={(e) => setFormData({...formData, kategori_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {kategoriList.map((k) => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Lokasi Penempatan</label>
                  <select
                    value={formData.lokasi_id}
                    onChange={(e) => setFormData({...formData, lokasi_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {lokasiList.map((l) => <option key={l.id} value={l.id}>{l.nama_lokasi}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Merk / Model</label>
                  <input
                    type="text"
                    placeholder="Epson L3110 / Dell Optiplex"
                    value={formData.merk_model}
                    onChange={(e) => setFormData({...formData, merk_model: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Nomor Seri (Serial No)</label>
                  <input
                    type="text"
                    placeholder="SN-99882211"
                    value={formData.nomor_seri}
                    onChange={(e) => setFormData({...formData, nomor_seri: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                >
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}