import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, MapPin, Tag, Trash2, Edit2,
  ShieldCheck, UserCheck, AlertCircle, Plus, Check, X, Loader2,
  Eye, EyeOff
} from 'lucide-react';
import API from '../services/api.js';

export default function MasterData() {
  const [activeTab, setActiveTab] = useState('pegawai'); // 'pegawai' | 'lokasi' | 'kategori'
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Toggle Visibility Password
  const [showPassword, setShowPassword] = useState(false);

  // Lists State
  const [users, setUsers] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);

  // Form State: Pegawai
  const [userForm, setUserForm] = useState({
    nama: '',
    nip: '',
    email: '',
    password: '',
    role: 'pegawai',
    jabatan: '',
  });

  // State Validation Errors khusus Form User
  const [formErrors, setFormErrors] = useState({});

  // Form State: Lokasi
  const [namaLokasi, setNamaLokasi] = useState('');
  const [gedungLantai, setGedungLantai] = useState('');
  const [editingLokasiId, setEditingLokasiId] = useState(null);

  // Form State: Kategori
  const [namaKategori, setNamaKategori] = useState('');
  const [editingKategoriId, setEditingKategoriId] = useState(null);

  // Auto Dismiss Notification setelah 4 detik
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Fetch Semua Data Master
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resUsers, resLokasi, resKategori] = await Promise.all([
        API.get('/users').catch(() => ({ data: { data: [] } })),
        API.get('/master/lokasi').catch(() => ({ data: { data: [] } })),
        API.get('/master/kategori').catch(() => ({ data: { data: [] } }))
      ]);

      setUsers(resUsers.data.data || resUsers.data || []);
      setLokasiList(resLokasi.data.data || resLokasi.data || []);
      setKategoriList(resKategori.data.data || resKategori.data || []);
    } catch (err) {
      setErrorMessage('Gagal memuat beberapa data master.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ------------------------------------------------------------------
  // FUNGSI VALIDASI FORM PEGAWAI
  // ------------------------------------------------------------------
  const validateUserForm = () => {
    const errors = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // 1. Validasi Nama Lengkap
    const trimmedNama = userForm.nama.trim();
    if (!trimmedNama) {
      errors.nama = 'Nama lengkap wajib diisi.';
    } else if (trimmedNama.length < 3) {
      errors.nama = 'Nama terlalu pendek (minimal 3 karakter).';
    } else if (trimmedNama.length > 100) {
      errors.nama = 'Nama terlalu panjang (maksimal 100 karakter).';
    }

    // 2. Validasi NIP / NIK
    const trimmedNip = userForm.nip.trim();
    if (!trimmedNip) {
      errors.nip = 'NIP / NIK wajib diisi.';
    } else if (trimmedNip.length < 8) {
      errors.nip = 'NIP / NIK terlalu pendek (minimal 8 digit).';
    } else if (trimmedNip.length > 18) {
      errors.nip = 'NIP / NIK melebihi batas (maksimal 18 digit).';
    }

    // 3. Validasi Email Resmi
    const trimmedEmail = userForm.email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email resmi wajib diisi.';
    } else if (!emailPattern.test(trimmedEmail)) {
      errors.email = 'Format email tidak valid (contoh: user@samsat.go.id).';
    }

    // 4. Validasi Password
    if (!userForm.password) {
      errors.password = 'Password awal wajib diisi.';
    } else if (userForm.password.length < 6) {
      errors.password = 'Password terlalu pendek (minimal 6 karakter).';
    }

    // 5. Validasi Jabatan
    const trimmedJabatan = userForm.jabatan.trim();
    if (!trimmedJabatan) {
      errors.jabatan = 'Jabatan wajib diisi.';
    } else if (trimmedJabatan.length < 2) {
      errors.jabatan = 'Jabatan minimal 2 karakter.';
    }

    // 6. Validasi Role / Hak Akses
    if (!['pegawai', 'admin'].includes(userForm.role)) {
      errors.role = 'Hak akses tidak valid.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ------------------------------------------------------------------
  // HANDLERS: PEGAWAI
  // ------------------------------------------------------------------
  const handleAddUser = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateUserForm()) return;

    setSubmitLoading(true);
    try {
      const payload = {
        nama: userForm.nama.trim(),
        nip: userForm.nip.trim(),
        email: userForm.email.trim().toLowerCase(),
        password: userForm.password,
        role: userForm.role,
        jabatan: userForm.jabatan.trim(),
      };

      await API.post('/users', payload);
      setSuccessMessage('Berhasil mendaftarkan akun pegawai baru!');
      
      setUserForm({ nama: '', nip: '', email: '', password: '', role: 'pegawai', jabatan: '' });
      setFormErrors({});
      setShowPassword(false);
      fetchAllData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Gagal mendaftarkan user baru.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) return;
    try {
      await API.delete(`/users/${id}`);
      setSuccessMessage('User berhasil dihapus.');
      fetchAllData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Gagal menghapus user.');
    }
  };

  // ------------------------------------------------------------------
  // HANDLERS: LOKASI
  // ------------------------------------------------------------------
  const handleSaveLokasi = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!namaLokasi.trim()) {
      setErrorMessage('Nama lokasi tidak boleh kosong.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingLokasiId) {
        await API.put(`/master/lokasi/${editingLokasiId}`, { 
          nama_lokasi: namaLokasi.trim(), 
          gedung_lantai: gedungLantai.trim() 
        });
        setSuccessMessage('Data lokasi berhasil diperbarui!');
      } else {
        await API.post('/master/lokasi', { 
          nama_lokasi: namaLokasi.trim(), 
          gedung_lantai: gedungLantai.trim() 
        });
        setSuccessMessage('Lokasi baru berhasil ditambahkan!');
      }
      resetLokasiForm();
      fetchAllData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Gagal menyimpan data lokasi.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditLokasi = (item) => {
    setEditingLokasiId(item.id);
    setNamaLokasi(item.nama_lokasi);
    setGedungLantai(item.gedung_lantai || '');
  };

  const resetLokasiForm = () => {
    setEditingLokasiId(null);
    setNamaLokasi('');
    setGedungLantai('');
  };

  const handleDeleteLokasi = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) return;
    try {
      await API.delete(`/master/lokasi/${id}`);
      setSuccessMessage('Lokasi berhasil dihapus.');
      fetchAllData();
    } catch (err) {
      setErrorMessage('Gagal menghapus lokasi.');
    }
  };

  // ------------------------------------------------------------------
  // HANDLERS: KATEGORI
  // ------------------------------------------------------------------
  const handleSaveKategori = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!namaKategori.trim()) {
      setErrorMessage('Nama kategori tidak boleh kosong.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingKategoriId) {
        await API.put(`/master/kategori/${editingKategoriId}`, { 
          nama_kategori: namaKategori.trim() 
        });
        setSuccessMessage('Kategori aset berhasil diperbarui!');
      } else {
        await API.post('/master/kategori', { 
          nama_kategori: namaKategori.trim() 
        });
        setSuccessMessage('Kategori aset berhasil ditambahkan!');
      }
      resetKategoriForm();
      fetchAllData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Gagal menyimpan kategori.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditKategori = (item) => {
    setEditingKategoriId(item.id);
    setNamaKategori(item.nama_kategori);
  };

  const resetKategoriForm = () => {
    setEditingKategoriId(null);
    setNamaKategori('');
  };

  const handleDeleteKategori = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    try {
      await API.delete(`/master/kategori/${id}`);
      setSuccessMessage('Kategori berhasil dihapus.');
      fetchAllData();
    } catch (err) {
      setErrorMessage('Gagal menghapus kategori.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & NAV TAB */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Master Data Reference</h1>
          <p className="text-sm text-slate-400 mt-1">Kelola Pengguna/Pegawai, Lokasi Ruangan, dan Kategori Aset IT</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('pegawai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'pegawai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Pegawai
          </button>
          <button
            onClick={() => { setActiveTab('lokasi'); resetLokasiForm(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'lokasi' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" /> Lokasi Ruangan
          </button>
          <button
            onClick={() => { setActiveTab('kategori'); resetKategoriForm(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'kategori' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" /> Kategori Aset
          </button>
        </div>
      </div>

      {/* ALERT NOTIFIKASI */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-xs font-bold hover:opacity-75">✕</button>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-xs font-bold hover:opacity-75">✕</button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: KELOLA PEGAWAI */}
      {/* ==================================================================== */}
      {activeTab === 'pegawai' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Tambah Pegawai */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-4 border-b border-slate-800 pb-3">
              <UserPlus className="w-5 h-5" />
              <h2>Tambah Pegawai / User</h2>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-sm" noValidate>
              
              {/* 1. Nama Lengkap */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Budi Santoso, S.Kom"
                  maxLength={100}
                  value={userForm.nama}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/[^a-zA-Z\s.,'`-]/g, '');
                    setUserForm({ ...userForm, nama: filtered });
                    if (formErrors.nama) setFormErrors({ ...formErrors, nama: '' });
                  }}
                  className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-white focus:outline-none transition ${
                    formErrors.nama ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                {formErrors.nama && <p className="text-xs text-rose-400 mt-1">{formErrors.nama}</p>}
              </div>

              {/* 2. NIP / NIK */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  NIP / NIK <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="199501122020121001"
                  maxLength={18}
                  value={userForm.nip}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                    setUserForm({ ...userForm, nip: onlyNumbers });
                    if (formErrors.nip) setFormErrors({ ...formErrors, nip: '' });
                  }}
                  className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-white focus:outline-none transition ${
                    formErrors.nip ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {formErrors.nip ? (
                    <p className="text-xs text-rose-400">{formErrors.nip}</p>
                  ) : (
                    <span className="text-[10px] text-slate-500">Angka saja (8-18 digit)</span>
                  )}
                  <span className="text-[10px] text-slate-500 ml-auto">{userForm.nip.length}/18</span>
                </div>
              </div>

              {/* 3. Email Resmi */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Email Resmi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="budi@samsat.go.id"
                  value={userForm.email}
                  onChange={(e) => {
                    const noSpaceEmail = e.target.value.replace(/\s/g, '');
                    setUserForm({ ...userForm, email: noSpaceEmail });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                  className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-white focus:outline-none transition ${
                    formErrors.email ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                {formErrors.email && <p className="text-xs text-rose-400 mt-1">{formErrors.email}</p>}
              </div>

              {/* 4. Password Awal dengan Tombol Mata */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Password Awal <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => {
                      setUserForm({ ...userForm, password: e.target.value });
                      if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                    }}
                    className={`w-full pl-3 pr-10 py-2.5 bg-slate-950 border rounded-xl text-white focus:outline-none transition ${
                      formErrors.password ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                    title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && <p className="text-xs text-rose-400 mt-1">{formErrors.password}</p>}
              </div>

              {/* 5. Jabatan & 6. Hak Akses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Jabatan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Staf Loket"
                    value={userForm.jabatan}
                    onChange={(e) => {
                      setUserForm({ ...userForm, jabatan: e.target.value });
                      if (formErrors.jabatan) setFormErrors({ ...formErrors, jabatan: '' });
                    }}
                    className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-white focus:outline-none transition ${
                      formErrors.jabatan ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                  {formErrors.jabatan && <p className="text-xs text-rose-400 mt-1">{formErrors.jabatan}</p>}
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Hak Akses <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pegawai">Pegawai Biasa</option>
                    <option value="admin">Administrator (IT)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 mt-2 flex items-center justify-center gap-2"
              >
                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Daftarkan Akun'}
              </button>
            </form>
          </div>

          {/* Tabel Daftar Pegawai */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <Users className="w-5 h-5" />
                <h2>Daftar Akun Pegawai ({users.length})</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Pegawai</th>
                    <th className="px-4 py-3">Email / NIP</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-center rounded-r-lg">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Memuat data pegawai...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-500">Belum ada pegawai terdaftar.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3 font-medium text-white">
                          <div>{u.nama}</div>
                          <div className="text-xs text-slate-500">{u.jabatan || 'Staf'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{u.email}</div>
                          <div className="text-xs text-slate-500">{u.nip}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              u.role === 'admin'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {u.role === 'admin' ? (
                              <>
                                <ShieldCheck className="w-3 h-3" />
                                ADMINISTRATOR
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3" />
                                PEGAWAI
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Hapus Pegawai"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: KELOLA LOKASI RUANGAN */}
      {/* ==================================================================== */}
      {activeTab === 'lokasi' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Tambah/Edit Lokasi */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <MapPin className="w-5 h-5" />
                <h2>{editingLokasiId ? 'Edit Lokasi' : 'Tambah Lokasi Ruangan'}</h2>
              </div>
              {editingLokasiId && (
                <button 
                  onClick={resetLokasiForm}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Batal
                </button>
              )}
            </div>

            <form onSubmit={handleSaveLokasi} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nama Lokasi / Ruangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Loket 1 Pembayaran"
                  value={namaLokasi}
                  onChange={(e) => setNamaLokasi(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Gedung / Lantai</label>
                <input
                  type="text"
                  placeholder="Contoh: Gedung A Lt 1"
                  value={gedungLantai}
                  onChange={(e) => setGedungLantai(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 mt-2 flex items-center justify-center gap-1.5"
              >
                {submitLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingLokasiId ? (
                  <>Simpan Perubahan</>
                ) : (
                  <><Plus className="w-4 h-4" /> Tambah Lokasi</>
                )}
              </button>
            </form>
          </div>

          {/* Tabel Daftar Lokasi */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <MapPin className="w-5 h-5" />
                <h2>Daftar Ruangan Terdaftar ({lokasiList.length})</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Nama Lokasi / Ruangan</th>
                    <th className="px-4 py-3">Gedung / Lantai</th>
                    <th className="px-4 py-3 text-center rounded-r-lg">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Memuat data lokasi...
                      </td>
                    </tr>
                  ) : lokasiList.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-slate-500">Belum ada lokasi terdaftar.</td>
                    </tr>
                  ) : (
                    lokasiList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3 font-medium text-white">{item.nama_lokasi}</td>
                        <td className="px-4 py-3 text-slate-400">{item.gedung_lantai || '-'}</td>
                        <td className="px-4 py-3 text-center flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditLokasi(item)}
                            className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                            title="Edit Lokasi"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLokasi(item.id)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Hapus Lokasi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: KELOLA KATEGORI ASET */}
      {/* ==================================================================== */}
      {activeTab === 'kategori' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Tambah/Edit Kategori */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <Tag className="w-5 h-5" />
                <h2>{editingKategoriId ? 'Edit Kategori' : 'Tambah Kategori Perangkat'}</h2>
              </div>
              {editingKategoriId && (
                <button 
                  onClick={resetKategoriForm}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Batal
                </button>
              )}
            </div>

            <form onSubmit={handleSaveKategori} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nama Kategori Aset</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Barcode Scanner / Printer Thermal"
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 mt-2 flex items-center justify-center gap-1.5"
              >
                {submitLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingKategoriId ? (
                  <>Simpan Perubahan</>
                ) : (
                  <><Plus className="w-4 h-4" /> Tambah Kategori</>
                )}
              </button>
            </form>
          </div>

          {/* Tabel Daftar Kategori */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <Tag className="w-5 h-5" />
                <h2>Daftar Kategori IT ({kategoriList.length})</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Nama Kategori</th>
                    <th className="px-4 py-3 text-center rounded-r-lg">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="2" className="text-center py-8 text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Memuat data kategori...
                      </td>
                    </tr>
                  ) : kategoriList.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="text-center py-8 text-slate-500">Belum ada kategori terdaftar.</td>
                    </tr>
                  ) : (
                    kategoriList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3 font-medium text-white">{item.nama_kategori}</td>
                        <td className="px-4 py-3 text-center flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditKategori(item)}
                            className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                            title="Edit Kategori"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteKategori(item.id)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}