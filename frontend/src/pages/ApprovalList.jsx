import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const Modal = ({ show, title, message, onConfirm, onCancel, confirmColor = 'bg-green-600', showCancel = true }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          {showCancel && (
            <button onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
              Batal
            </button>
          )}
          <button onClick={onConfirm}
            className={`flex-1 ${confirmColor} hover:opacity-90 text-white py-2 rounded-lg text-sm font-semibold`}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

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
          <object
            data={url}
            type="application/pdf"
            className="w-full h-full">
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

export default function ApprovalList() {
  const [data, setData] = useState([]);
  const [catatan, setCatatan] = useState({});
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState({ show: false, type: '', id: null, judul: '' });
  const [infoModal, setInfoModal] = useState({ show: false, title: '', message: '' });
  const [previewUrl, setPreviewUrl] = useState(null);

  const load = () => api.get('/pengajuan').then(r => setData(r.data));
  useEffect(() => { load(); }, []);

  const showInfo = (title, message) => setInfoModal({ show: true, title, message });

  const handleApprove = (p) => {
    setModal({ show: true, type: 'approve', id: p.id, judul: p.judul });
  };

  const handleReject = (p) => {
    if (!catatan[p.id] || catatan[p.id].trim() === '') {
      showInfo('Catatan Wajib Diisi', 'Harap isi alasan penolakan sebelum menolak pengajuan ini.');
      return;
    }
    setModal({ show: true, type: 'reject', id: p.id, judul: p.judul });
  };

  const confirmAction = async () => {
    if (modal.type === 'approve') {
      await api.patch(`/pengajuan/${modal.id}/approve`);
    } else {
      await api.patch(`/pengajuan/${modal.id}/reject`, { catatan_admin: catatan[modal.id] });
    }
    setModal({ show: false, type: '', id: null, judul: '' });
    load();
  };

  const filtered = filter === 'all' ? data : data.filter(p => p.status === filter);

  return (
    <div className="p-6">
      <Modal
        show={modal.show}
        title={modal.type === 'approve' ? 'Setujui Pengajuan?' : 'Tolak Pengajuan?'}
        message={modal.type === 'approve'
          ? `Anda akan menyetujui pengajuan "${modal.judul}". Tindakan ini tidak dapat dibatalkan.`
          : `Anda akan menolak pengajuan "${modal.judul}". Anggota akan mendapat notifikasi penolakan.`}
        onConfirm={confirmAction}
        onCancel={() => setModal({ show: false, type: '', id: null, judul: '' })}
        confirmColor={modal.type === 'approve' ? 'bg-green-600' : 'bg-red-600'}
        showCancel={true}
      />

      <Modal
        show={infoModal.show}
        title={infoModal.title}
        message={infoModal.message}
        onConfirm={() => setInfoModal({ show: false, title: '', message: '' })}
        confirmColor="bg-indigo-600"
        showCancel={false}
      />

      <PDFPreview url={previewUrl} onClose={() => setPreviewUrl(null)} />

      <h2 className="text-2xl font-bold text-gray-800 mb-1">Approval Pengajuan</h2>
      <p className="text-gray-500 text-sm mb-6">Tinjau dan proses pengajuan dari anggota tim</p>

      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'all' ? 'Semua' : f === 'pending' ? 'Menunggu' : f === 'approved' ? 'Disetujui' : 'Ditolak'}
            {f !== 'all' && <span className="ml-1">({data.filter(p => p.status === f).length})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-400">Tidak ada pengajuan</div>
        )}
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">{p.judul}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-xs text-gray-500 mb-2">{p.nama_pengaju} · {p.divisi_nama} · {p.nama_anggaran}</p>
                <p className="font-bold text-indigo-700 mb-2">{fmt(p.jumlah)}</p>
                {p.file_path && (
                  <button
                    onClick={() => setPreviewUrl(p.file_path)}
                    className="inline-block text-xs text-indigo-600 hover:underline bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition">
                    📄 Preview Dokumen PDF
                  </button>
                )}
                {p.catatan_admin && (
                  <p className="text-xs text-red-500 mt-2">Catatan: {p.catatan_admin}</p>
                )}
              </div>
              {p.status === 'pending' && (
                <div className="flex flex-col gap-2 min-w-48">
                  <button onClick={() => handleApprove(p)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg">
                    ✓ Setujui
                  </button>
                  <input
                    value={catatan[p.id] || ''}
                    onChange={e => setCatatan({ ...catatan, [p.id]: e.target.value })}
                    className="border rounded-lg px-2 py-1.5 text-xs"
                    placeholder="Alasan penolakan..." />
                  <button onClick={() => handleReject(p)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                    ✕ Tolak
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}