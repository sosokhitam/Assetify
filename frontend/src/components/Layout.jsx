import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}