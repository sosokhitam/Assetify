import Sidebar from './Sidebar.jsx';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* 1. Sidebar Kiri (Memuat Navigasi + Profil User & NIP + Logout) */}
      <Sidebar />

      {/* 2. Area Konten Utama (Tanpa Navbar Atas) */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}