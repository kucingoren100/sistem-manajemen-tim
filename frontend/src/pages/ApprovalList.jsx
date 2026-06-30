import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const ITEMS_PER_PAGE = 10;

const PDFPreview = ({ url, onClose }) => {
  if (!url) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-semibold text-gray-800">Preview Dokumen</h3>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg">
              ✕ Tutup
            </button>
          </div>
        </div>
        <div className="flex-1 w-full overflow-hidden rounded-b-2xl">
          <object data={url} type="application/pdf" className="w-full h-full">
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <p className="text-sm">Browser tidak bisa menampilkan PDF secara langsung.</p>
              <a href={url} target="_blank" rel="noreferrer"
                className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
                Buka PDF di Tab Baru
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
};

export default function Riwayat() {
  const [data, setData] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [periode, setPeriode] = useState('semua');
  const [page, setPage] = useState(1);

  useEffect(() => { api.get('/pengajuan/saya').then(r => setData(r.data)); }, []);

  // Filter berdasarkan periode
  const filterByPeriode = (list) => {
    if (periode === 'semua') return list;
    const now = new Date();
    return list.filter(p => {
      const tgl = new Date(p.created_at);
      if (periode === 'bulan_ini') {
        return tgl.getMonth() === now.getMonth() && tgl.getFullYear() === now.getFullYear();
      }
      if (periode === '3_bulan') {
        const batas = new Date();
        batas.setMonth(now.getMonth() - 3);
        return tgl >= batas;
      }
      if (periode === 'tahun_ini') {
        return tgl.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filtered = filterByPeriode(data);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePeriodeChange = (val) => {
    setPeriode(val);
    setPage(1); // reset ke halaman 1 setiap ganti filter
  };

  return (
    <div className="p-6">
      <PDFPreview url={previewUrl} onClose={() => setPreviewUrl(null)} />

      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Riwayat Pengajuan</h2>
          <p className="text-gray-500 text-sm">Pantau status pengajuan pengeluaran Anda</p>
        </div>
        <select value={periode} onChange={e => handlePeriodeChange(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="semua">Semua Periode</option>
          <option value="bulan_ini">Bulan Ini</option>
          <option value="3_bulan">3 Bulan Terakhir</option>
          <option value="tahun_ini">Tahun Ini</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-4">Judul</th>
              <th className="text-left p-4">Anggaran</th>
              <th className="text-left p-4">Jumlah</th>
              <th className="text-left p-4">File</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginated.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data pada periode ini</td></tr>
            )}
            {paginated.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{p.judul}</td>
                <td className="p-4 text-gray-500">{p.nama_anggaran}</td>
                <td className="p-4">{fmt(p.jumlah)}</td>
                <td className="p-4">
                  {p.file_path
                    ? <button onClick={() => setPreviewUrl(p.file_path)}
                        className="text-indigo-600 hover:underline text-xs bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-full transition">
                        📄 Preview PDF
                      </button>
                    : '-'}
                </td>
                <td className="p-4"><StatusBadge status={p.status} /></td>
                <td className="p-4 text-gray-500 text-xs">{p.catatan_admin || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500">
              Halaman {page} dari {totalPages} ({filtered.length} total data)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="text-xs px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-100">
                ← Sebelumnya
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="text-xs px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-100">
                Selanjutnya →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}