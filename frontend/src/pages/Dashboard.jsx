import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Box, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Clock 
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
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-400 font-medium">Memuat statistik dashboard...</p>
      </div>
    );
  }

  // Data Grafik Status Aset (Pie Chart)
  const dataAsetChart = [
    { name: 'Aktif', value: stats?.statusCounts?.aktif || 0, color: '#10B981' },
    { name: 'Dalam Perbaikan', value: stats?.statusCounts?.perbaikan || 0, color: '#F59E0B' },
    { name: 'Afkir', value: stats?.statusCounts?.afkir || 0, color: '#EF4444' },
  ];

  // Data Grafik Tiket Perbaikan (Bar Chart)
  const dataTiketChart = [
    { name: 'Pending', jumlah: stats?.tiketCounts?.pending || 0, fill: '#F59E0B' },
    { name: 'Diproses', jumlah: stats?.tiketCounts?.diproses || 0, fill: '#3B82F6' },
    { name: 'Selesai', jumlah: stats?.tiketCounts?.selesai || 0, fill: '#10B981' },
    { name: 'Ditolak', jumlah: stats?.tiketCounts?.ditolak || 0, fill: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Statistik</h1>
        <p className="text-sm text-slate-500">Ringkasan data aset IT & status perbaikan terkini</p>
      </div>

      {/* 1. KARTU STATISTIK (KPI CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Aset */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Aset IT</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats?.totalAset}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Box className="w-6 h-6" />
          </div>
        </div>

        {/* Aset Dalam Perbaikan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Dalam Perbaikan</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats?.statusCounts?.perbaikan}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Tiket Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Tiket Menunggu Respon</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats?.tiketCounts?.pending}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Biaya Pemeliharaan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Biaya Perbaikan</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-1">
              Rp {stats?.totalBiaya?.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. GRAFIK STATISTIK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Status Aset */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">Distribusi Status Aset</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataAsetChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataAsetChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Status Tiket Perbaikan */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">Status Tiket Perbaikan</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataTiketChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="jumlah" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. AKTIVITAS TIKET TERBARU */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Tiket Pengajuan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">No. Tiket</th>
                <th className="p-4">Aset</th>
                <th className="p-4">Pelapor</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {stats?.tiketTerbaru?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400">
                    Belum ada pengajuan tiket terbaru.
                  </td>
                </tr>
              ) : (
                stats?.tiketTerbaru?.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-medium text-slate-700">{t.nomor_tiket}</td>
                    <td className="p-4 font-medium text-slate-800">
                      {t.aset?.nama_aset}
                      <span className="block text-xs text-slate-400 font-mono">{t.aset?.kode_aset}</span>
                    </td>
                    <td className="p-4 text-slate-600">{t.pelapor?.nama_lengkap || 'Pegawai'}</td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(t.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        t.status === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                        t.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                        'bg-emerald-100 text-emerald-800'
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