import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function Perbaikan() {
  const [tiketList, setTiketList] = useState([]);
  const [asetList, setAsetList] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Handler Respon Status Tiket (Diproses / Selesai / Ditolak)
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

  // Handler Hapus Tiket Pengajuan
  const handleDeleteTiket = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tiket pengajuan ini?')) return;
    try {
      await API.delete(`/perbaikan/${id}`);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus tiket pengajuan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengajuan Perbaikan Aset</h1>
          <p className="text-sm text-slate-500">Kelola dan pantau tiket perbaikan perangkat IT</p>
        </div>
        <button
          onClick={() => setShowModalCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm"
        >
          + Buat Tiket Perbaikan
        </button>
      </div>

      {/* Tabel Tiket */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">No. Tiket</th>
                <th className="p-4">Aset IT</th>
                <th className="p-4">Pelapor</th>
                <th className="p-4">Deskripsi Kerusakan</th>
                <th className="p-4">Urgensi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Memuat data tiket...
                  </td>
                </tr>
              ) : tiketList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Belum ada tiket pengajuan perbaikan.
                  </td>
                </tr>
              ) : (
                tiketList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-mono font-medium text-slate-700">{item.nomor_tiket}</td>
                    <td className="p-4 font-medium text-slate-800">
                      {item.aset?.nama_aset}
                      <span className="block text-xs text-slate-400 font-mono">{item.aset?.kode_aset}</span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {item.pelapor?.nama_lengkap || 'Pegawai'}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate" title={item.deskripsi_kerusakan}>
                      {item.deskripsi_kerusakan}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.tingkat_urgensi === 'Tinggi' ? 'bg-red-100 text-red-700' :
                        item.tingkat_urgensi === 'Sedang' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.tingkat_urgensi}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        item.status === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                      {item.status === 'Ditolak' && item.alasan_penolakan && (
                        <p className="text-xs text-red-600 mt-1 italic">
                          Ket: {item.alasan_penolakan}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Tombol Respon untuk Admin & Teknisi (Jika tiket belum Selesai/Ditolak) */}
                        {(user?.role === 'admin' || user?.role === 'teknisi') && item.status !== 'Selesai' && item.status !== 'Ditolak' && (
                          <button
                            onClick={() => {
                              setSelectedTiket(item);
                              setStatusUpdate(item.status === 'Pending' ? 'Diproses' : 'Selesai');
                              setAlasanPenolakan('');
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs font-medium transition"
                          >
                            Respon
                          </button>
                        )}

                        {/* Tombol Hapus Khusus Admin */}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteTiket(item.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium hover:underline px-1"
                          >
                            Hapus
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Buat Tiket Perbaikan</h2>
            <form onSubmit={handleCreateTiket} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Aset IT Rusak *</label>
                <select
                  required
                  value={asetId}
                  onChange={(e) => setAsetId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-1 focus:ring-indigo-500"
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tingkat Urgensi</label>
                <select
                  value={urgensi}
                  onChange={(e) => setUrgensi(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Kerusakan *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Jelaskan kendala/kerusakan perangkat..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalCreate(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Tindak Lanjut Tiket: {selectedTiket.nomor_tiket}</h2>
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Update Status Tiket *</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-semibold text-slate-800"
                >
                  <option value="Diproses">Diproses (Sedang Dikerjakan)</option>
                  <option value="Selesai">Selesai (Perbaikan Tuntas)</option>
                  <option value="Ditolak">Ditolak (Pengajuan Tidak Valid/Dibatalkan)</option>
                </select>
              </div>

              {/* INPUT KONDISIONAL: JIKA STATUS DITOLAK */}
              {statusUpdate === 'Ditolak' ? (
                <div>
                  <label className="block text-xs font-semibold text-red-600 mb-1">Alasan Penolakan *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Contoh: Kerusakan disebabkan kesalahan penggunaan (user error) / Perangkat sudah diganti unit baru"
                    value={alasanPenolakan}
                    onChange={(e) => setAlasanPenolakan(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm bg-red-50 focus:ring-1 focus:ring-red-500"
                  ></textarea>
                </div>
              ) : (
                /* INPUT TINDAKAN PERBAIKAN BILA DIPROSES / SELESAI */
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Rincian Tindakan Perbaikan</label>
                    <textarea
                      rows="2"
                      placeholder="Contoh: Pembersihan roller printer dan instalasi ulang driver"
                      value={rincianTindakan}
                      onChange={(e) => setRincianTindakan(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Komponen Diganti</label>
                      <input
                        type="text"
                        placeholder="Contoh: Roller Kit"
                        value={komponen}
                        onChange={(e) => setKomponen(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Biaya Perbaikan (Rp)</label>
                      <input
                        type="number"
                        value={biaya}
                        onChange={(e) => setBiaya(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTiket(null)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition ${
                    statusUpdate === 'Ditolak' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
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