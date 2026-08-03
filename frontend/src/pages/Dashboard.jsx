import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Box, 
  Wrench, 
  Clock, 
  DollarSign,
  Activity
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Gagal memuat statistik dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-slate-400 p-4">
        <p className="animate-pulse text-xs sm:text-sm font-medium">Memuat statistik dashboard admin...</p>
      </div>
    );
  }

  // Data Grafik Status Aset (Pie Chart)
  const dataAsetChart = [
    { name: 'Aktif / Baik', value: stats?.statusCounts?.aktif || 0, color: '#10B981' },
    { name: 'Dalam Perbaikan', value: stats?.statusCounts?.perbaikan || 0, color: '#F59E0B' },
    { name: 'Afkir / Rusak', value: stats?.statusCounts?.afkir || 0, color: '#EF4444' },
  ];

  // Data Grafik Tiket Perbaikan (Bar Chart)
  const dataTiketChart = [
    { name: 'Pending', jumlah: stats?.tiketCounts?.pending || 0, fill: '#F59E0B' },
    { name: 'Diproses', jumlah: stats?.tiketCounts?.diproses || 0, fill: '#3B82F6' },
    { name: 'Selesai', jumlah: stats?.tiketCounts?.selesai || 0, fill: '#10B981' },
    { name: 'Ditolak', jumlah: stats?.tiketCounts?.ditolak || 0, fill: '#EF4444' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full font-sans text-slate-100 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      
      {/* 1. HEADER HALAMAN ADMIN */}
      <div className="border-b border-slate-800 pb-4 sm:pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Activity className="text-blue-500 shrink-0" size={20} />
            <span>Dashboard Ringkasan Admin</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Monitoring aset IT, tiket perbaikan, serta alokasi anggaran pemeliharaan.
          </p>
        </div>
      </div>

      {/* 2. KARTU RINGKASAN STATISTIK (KPI CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Aset */}
        <div className="bg-[#1e293b] p-4 sm:p-5 rounded-2xl border border-slate-700/50 flex items-center justify-between text-white shadow-sm hover:border-slate-600 transition">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Aset IT</p>
            <h3 className="text-xl sm:text-2xl font-bold mt-1 text-white">{stats?.totalAset || 0}</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
            <Box className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Dalam Perbaikan */}
        <div className="bg-[#1e293b] p-4 sm:p-5 rounded-2xl border border-slate-700/50 flex items-center justify-between text-white shadow-sm hover:border-slate-600 transition">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Aset Diperbaiki</p>
            <h3 className="text-xl sm:text-2xl font-bold mt-1 text-amber-400">{stats?.statusCounts?.perbaikan || 0}</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
            <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Tiket Pending */}
        <div className="bg-[#1e293b] p-4 sm:p-5 rounded-2xl border border-slate-700/50 flex items-center justify-between text-white shadow-sm hover:border-slate-600 transition">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Menunggu Respon</p>
            <h3 className="text-xl sm:text-2xl font-bold mt-1 text-cyan-400">{stats?.tiketCounts?.pending || 0}</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Total Biaya */}
        <div className="bg-[#1e293b] p-4 sm:p-5 rounded-2xl border border-slate-700/50 flex items-center justify-between text-white shadow-sm hover:border-slate-600 transition">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Biaya Perbaikan</p>
            <h3 className="text-base sm:text-lg font-bold mt-1 text-emerald-400 truncate max-w-[150px] sm:max-w-none" title={`Rp ${stats?.totalBiaya ? stats.totalBiaya.toLocaleString('id-ID') : 0}`}>
              Rp {stats?.totalBiaya ? stats.totalBiaya.toLocaleString('id-ID') : 0}
            </h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

      </div>

      {/* 3. GRAFIK STATISTIK (PIE & BAR CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Pie Chart: Status Aset */}
        <div className="bg-[#1e293b] p-4 sm:p-5 rounded-2xl border border-slate-700/50 shadow-sm flex flex-col justify-between">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-200 mb-3 tracking-wide">
            Distribusi Kondisi & Status Aset
          </h2>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataAsetChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataAsetChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#1e293b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconSize={10}
                  wrapperStyle={{ color: '#94a3b8', fontSize: '11px', paddingTop: '10px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Status Tiket Perbaikan */}
        <div className="bg-[#1e293b] p-4 sm:p-5 rounded-2xl border border-slate-700/50 shadow-sm flex flex-col justify-between">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-200 mb-3 tracking-wide">
            Statistik Progress Tiket Perbaikan
          </h2>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataTiketChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="jumlah" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. TABEL AKTIVITAS TIKET TERBARU */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm">
        
        {/* Table Header Container */}
        <div className="p-4 border-b border-slate-700/50 font-semibold text-slate-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>Pengajuan Tiket Terbaru Masuk</span>
          <span className="text-[10px] sm:text-[11px] font-normal text-slate-400">Terbaru dari Pegawai</span>
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
          <table className="w-full text-left border-collapse min-w-[600px] text-xs">
            <thead className="bg-[#0f172a]/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/50">
              <tr>
                <th className="p-3 sm:p-4">No. Tiket</th>
                <th className="p-3 sm:p-4">Nama Aset</th>
                <th className="p-3 sm:p-4">Pelapor</th>
                <th className="p-3 sm:p-4">Tanggal Masuk</th>
                <th className="p-3 sm:p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-slate-300">
              {stats?.tiketTerbaru?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500 text-xs">
                    Belum ada pengajuan tiket perbaikan terbaru.
                  </td>
                </tr>
              ) : (
                stats?.tiketTerbaru?.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* No Tiket */}
                    <td className="p-3 sm:p-4 font-mono font-medium text-blue-400 whitespace-nowrap">
                      {t.nomor_tiket}
                    </td>

                    {/* Nama Aset */}
                    <td className="p-3 sm:p-4 min-w-[150px]">
                      <div className="font-medium text-white leading-snug">
                        {t.aset?.nama_aset || 'Aset IT'}
                      </div>
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                        {t.aset?.kode_aset || '-'}
                      </span>
                    </td>

                    {/* Pelapor */}
                    <td className="p-3 sm:p-4 text-slate-300 whitespace-nowrap">
                      {t.pelapor?.nama_lengkap || 'Pegawai'}
                    </td>

                    {/* Tanggal */}
                    <td className="p-3 sm:p-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Status */}
                    <td className="p-3 sm:p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium border inline-block ${
                        t.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        t.status === 'Diproses' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        t.status === 'Ditolak' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}