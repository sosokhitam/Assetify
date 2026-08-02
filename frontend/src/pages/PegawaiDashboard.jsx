import React, { useState, useEffect } from 'react';
import { Laptop, Wrench, Clock, CheckCircle, PlusCircle } from 'lucide-react';

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

  // Ambil Data User dari LocalStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/pegawai/dashboard/${user.id}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data pegawai:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPengajuan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/pegawai/pengajuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.id })
      });
      const result = await response.json();
      if (result.success) {
        alert('Pengajuan perbaikan berhasil dikirim!');
        setShowModal(false);
        setFormData({ aset_id: '', deskripsi_kerusakan: '', tingkat_urgensi: 'sedang' });
        fetchDashboardData(); // Refresh data setelah berhasil kirim
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full font-sans">
      
      {/* HEADER HALAMAN UTAMA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Portal Dashboard Pegawai</h1>
        </div>

        {/* Tombol Buat Pengajuan Perbaikan */}
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-600/20">
          <PlusCircle size={16}/> Buat Pengajuan Baru
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-400 text-xs">
          <div className="animate-pulse">Memuat data portal pegawai...</div>
        </div>
      ) : (
        <>
          {/* STATISTIK RINGKASAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700/50 flex items-center gap-4 text-white shadow-sm">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Laptop size={22}/>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Aset Dipegang</p>
                <h3 className="text-2xl font-bold mt-0.5">{data.summary.totalAset}</h3>
              </div>
            </div>

            <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700/50 flex items-center gap-4 text-white shadow-sm">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Clock size={22}/>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Menunggu Diproses</p>
                <h3 className="text-2xl font-bold text-amber-400 mt-0.5">{data.summary.pengajuanPending}</h3>
              </div>
            </div>

            <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700/50 flex items-center gap-4 text-white shadow-sm">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                <Wrench size={22}/>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Sedang Diperbaiki</p>
                <h3 className="text-2xl font-bold text-cyan-400 mt-0.5">{data.summary.pengajuanDiproses}</h3>
              </div>
            </div>

            <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700/50 flex items-center gap-4 text-white shadow-sm">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <CheckCircle size={22}/>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Selesai Diperbaiki</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">{data.summary.pengajuanSelesai}</h3>
              </div>
            </div>
          </div>

          {/* TABEL 1: DAFTAR ASET IT PEGAWAI */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-700/50 font-semibold text-slate-200 text-xs sm:text-sm flex justify-between items-center">
              <span>Daftar Aset IT Milik Anda</span>
              <span className="text-[11px] font-normal text-slate-400">Total: {data.asetList.length} Unit</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-[#0f172a]/70 text-slate-400 uppercase text-[10px] sm:text-[11px] tracking-wider">
                  <tr>
                    <th className="p-4">Kode Aset</th>
                    <th className="p-4">Nama Aset</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Lokasi</th>
                    <th className="p-4">Status Aset</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {data.asetList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-500 text-xs">
                        Belum ada aset terdaftar atas nama Anda.
                      </td>
                    </tr>
                  ) : (
                    data.asetList.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4 font-mono text-blue-400 font-medium">{item.kode_aset}</td>
                        <td className="p-4 font-medium text-white">{item.nama_aset}</td>
                        <td className="p-4">{item.kategori_aset?.nama_kategori || '-'}</td>
                        <td className="p-4">{item.lokasi?.nama_lokasi || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[11px] rounded-full font-medium ${
                            item.status === 'baik' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {item.status || 'Baik'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => { setFormData({ ...formData, aset_id: item.id }); setShowModal(true); }}
                            className="text-[11px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition font-medium">
                            Laporkan Kerusakan
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL 2: RIWAYAT PENGAJUAN PERBAIKAN */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-700/50 font-semibold text-slate-200 text-xs sm:text-sm flex justify-between items-center">
              <span>Riwayat Pengajuan Perbaikan</span>
              <span className="text-[11px] font-normal text-slate-400">Total: {data.pengajuanList.length} Laporan</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-[#0f172a]/70 text-slate-400 uppercase text-[10px] sm:text-[11px] tracking-wider">
                  <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Aset</th>
                    <th className="p-4">Deskripsi Masalah</th>
                    <th className="p-4">Urgensi</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {data.pengajuanList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-500 text-xs">
                        Belum ada riwayat pengajuan perbaikan.
                      </td>
                    </tr>
                  ) : (
                    data.pengajuanList.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4 text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="p-4 font-medium text-white">
                          {item.aset?.nama_aset || 'Aset'} <span className="text-slate-400 text-xs font-mono">({item.aset?.kode_aset})</span>
                        </td>
                        <td className="p-4 max-w-xs truncate text-slate-300">{item.deskripsi_kerusakan}</td>
                        <td className="p-4 uppercase text-[11px] font-semibold">
                          <span className={
                            item.tingkat_urgensi === 'tinggi' ? 'text-red-400' :
                            item.tingkat_urgensi === 'sedang' ? 'text-amber-400' : 'text-slate-400'
                          }>
                            {item.tingkat_urgensi || 'Sedang'}
                          </span>
                        </td>
                        <td className="p-4">
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
          </div>
        </>
      )}

      {/* MODAL FORM PENGAJUAN PERBAIKAN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Form Pengajuan Perbaikan Aset</h3>
            <form onSubmit={handleSubmitPengajuan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Pilih Aset Kerusakan</label>
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
                <label className="block text-xs font-medium text-slate-400 mb-1">Tingkat Urgensi</label>
                <select 
                  value={formData.tingkat_urgensi}
                  onChange={e => setFormData({ ...formData, tingkat_urgensi: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500">
                  <option value="rendah">Rendah (Masih bisa dipakai)</option>
                  <option value="sedang">Sedang (Mengganggu pekerjaan)</option>
                  <option value="tinggi">Tinggi (Aset mati total / Urgent)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Deskripsi Kerusakan</label>
                <textarea 
                  required 
                  rows="3"
                  placeholder="Jelaskan detail kendala/kerusakan pada perangkat..."
                  value={formData.deskripsi_kerusakan}
                  onChange={e => setFormData({ ...formData, deskripsi_kerusakan: e.target.value })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs transition">
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