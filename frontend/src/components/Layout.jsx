import Sidebar from './Sidebar.jsx';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-100 overflow-x-hidden">
      {/* 1. Sidebar Kiri (Topbar di Mobile & Fixed Drawer di Desktop) */}
      <Sidebar />

      {/* 2. Area Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}