import { useState, useEffect } from 'react';
import API from '../services/api.js';

export default function MasterData() {
  const [lokasiList, setLokasiList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Lokasi State
  const [namaLokasi, setNamaLokasi] = useState('');
  const [gedungLantai, setGedungLantai] = useState('');

  // Form Kategori State
  const [namaKategori, setNamaKategori] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resLokasi, resKategori] = await Promise.all([
        API.get('/master/lokasi'),
        API.get('/master/kategori')
      ]);
      setLokasiList(resLokasi.data.data || []);
      setKategoriList(resKategori.data.data || []);
    } catch (err) {
      alert('Gagal mengambil data master');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLokasi = async (e) => {
    e.preventDefault();
    try {
      await API.post('/master/lokasi', { nama_lokasi: namaLokasi, gedung_lantai: gedungLantai });
      setNamaLokasi('');
      setGedungLantai('');
      fetchData();
    } catch (err) {
      alert('Gagal menambah lokasi');
    }
  };

  const handleDeleteLokasi = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) return;
    try {
      await API.delete(`/master/lokasi/${id}`);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus lokasi');
    }
  };

  const handleAddKategori = async (e) => {
    e.preventDefault();
    try {
      await API.post('/master/kategori', { nama_kategori: namaKategori });
      setNamaKategori('');
      fetchData();
    } catch (err) {
      alert('Gagal menambah kategori');
    }
  };

  const handleDeleteKategori = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    try {
      await API.delete(`/master/kategori/${id}`);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus kategori');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Master Data Reference</h1>
        <p className="text-slate-500 text-sm">Kelola daftar lokasi ruangan dan kategori perangkat IT</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LOKASI SECTION */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Kelola Lokasi / Ruangan</h2>
          
          <form onSubmit={handleAddLokasi} className="flex gap-2">
            <input
              type="text"
              placeholder="Nama Lokasi (ex: Loket 1)"
              value={namaLokasi}
              onChange={(e) => setNamaLokasi(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Lantai (ex: Lt 1)"
              value={gedungLantai}
              onChange={(e) => setGedungLantai(e.target.value)}
              className="w-28 px-3 py-2 border rounded-lg text-sm focus:outline-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
              Tambah
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 rounded-l-lg">Lokasi</th>
                  <th className="p-3">Lantai</th>
                  <th className="p-3 rounded-r-lg text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {lokasiList.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3 font-medium text-slate-800">{item.nama_lokasi}</td>
                    <td className="p-3">{item.gedung_lantai || '-'}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDeleteLokasi(item.id)} className="text-red-500 hover:underline">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* KATEGORI SECTION */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Kelola Kategori Aset</h2>

          <form onSubmit={handleAddKategori} className="flex gap-2">
            <input
              type="text"
              placeholder="Nama Kategori (ex: Scanner)"
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-blue-500"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
              Tambah
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 rounded-l-lg">Kategori</th>
                  <th className="p-3 rounded-r-lg text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kategoriList.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3 font-medium text-slate-800">{item.nama_kategori}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDeleteKategori(item.id)} className="text-red-500 hover:underline">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}