import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [showLogout, setShowLogout] = useState(false);

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/divisi', label: 'Divisi' },
    { to: '/anggaran', label: 'Anggaran' },
    { to: '/approval', label: 'Approval Pengajuan' },
  ];
  const memberLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/pengajuan', label: 'Ajukan Pengeluaran' },
    { to: '/riwayat', label: 'Riwayat Pengajuan' },
  ];
  const links = user?.role === 'admin' ? adminLinks : memberLinks;

  return (
    <>
      {/* Modal Konfirmasi Logout */}
      {showLogout && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Keluar dari Aplikasi?</h3>
            <p className="text-gray-500 text-sm mb-6">Sesi Anda akan berakhir dan harus login kembali.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
                Batal
              </button>
              <button onClick={logout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold">
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-indigo-900 text-white flex flex-col">
        <div className="p-6 border-b border-indigo-700">
          <h1 className="text-lg font-bold">Anggaran Tim</h1>
          <p className="text-indigo-300 text-sm mt-1">{user?.nama}</p>
          <span className="text-xs bg-indigo-700 px-2 py-0.5 rounded mt-1 inline-block capitalize">{user?.role}</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`block px-4 py-2.5 rounded-lg text-sm transition ${pathname === l.to ? 'bg-indigo-600 font-semibold' : 'hover:bg-indigo-800'}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-700">
          <button onClick={() => setShowLogout(true)}
            className="w-full text-sm text-indigo-300 hover:text-white py-2">
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}