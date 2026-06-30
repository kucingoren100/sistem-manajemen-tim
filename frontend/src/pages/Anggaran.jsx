import { useEffect, useState } from 'react';
import api from '../api/axios';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const InfoModal = ({ show, title, message, onConfirm }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <button onClick={onConfirm}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold">
          OK
        </button>
      </div>
    </div>
  );
};

export default function Anggaran() {
  const [data, setData] = useState([]);
  const [divisi, setDivisi] = useState([]);
  const [form, setForm] = useState({ divisi_id: '', nama: '', total: '', periode: '' });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmHapus, setConfirmHapus] = useState(null);
  const [infoModal, setInfoModal] = useState({ show: false, title: '', message: '' });

  const load = () => api.get('/anggaran').then(r => setData(r.data));
  useEffect(() => {
    load();
    api.get('/divisi').then(r => setDivisi(r.data));
  }, []);

  const showInfo = (title, message) => setInfoModal({ show: true, title, message });

  const save = async () => {
    if (!form.divisi_id) {
      showInfo('Divisi Belum Dipilih', 'Harap pilih divisi sebelum menyimpan anggaran.');
      return;
    }
    if (!form.nama || form.nama.trim() === '') {
      showInfo('Nama Anggaran Wajib Diisi', 'Harap isi nama anggaran sebelum menyimpan.');
      return;
    }
    if (!form.total || Number(form.total) <= 0) {
      showInfo('Total Anggaran Tidak Valid', 'Harap isi jumlah total anggaran dengan angka lebih dari 0.');
      return;
    }
    if (!form.periode || form.periode.trim() === '') {
      showInfo('Periode Wajib Diisi', 'Harap isi periode anggaran, contoh: 2025-01.');
      return;
    }

    if (editId) await api.put(`/anggaran/${editId}`, form);
    else await api.post('/anggaran', form);
    setForm({ divisi_id: '', nama: '', total: '', periode: '' });
    setShowForm(false);
    setEditId(null);
    load();
  };

  const remove = async () => {
    await api.delete(`/anggaran/${confirmHapus}`);
    setConfirmHapus(null);
    load();
  };

  const startEdit = (a) => {
    setForm({ divisi_id: a.divisi_id, nama: a.nama, total: a.total, periode: a.periode });
    setEditId(a.id);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <InfoModal
        show={infoModal.show}
        title={infoModal.title}
        message={infoModal.message}
        onConfirm={() => setInfoModal({ show: false, title: '', message: '' })}
      />

      {confirmHapus && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Hapus Anggaran?</h3>
            <p className="text-gray-500 text-sm mb-6">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmHapus(null)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
                Batal
              </button>
              <button onClick={remove}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Anggaran</h2>
          <p className="text-gray-500 text-sm">Kelola plafon anggaran per divisi</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ divisi_id: '', nama: '', total: '', periode: '' }); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg">
          + Tambah Anggaran
        </button>
      </div>

      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-5 grid grid-cols-2 gap-3">
          <select value={form.divisi_id} onChange={e => setForm({ ...form, divisi_id: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm col-span-2">
            <option value="">-- Pilih Divisi *</option>
            {divisi.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
          </select>
          <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}
            placeholder="Nama Anggaran *" className="border rounded-lg px-3 py-2 text-sm col-span-2" />
          <input type="number" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })}
            placeholder="Total (Rp) *" className="border rounded-lg px-3 py-2 text-sm" />
          <input value={form.periode} onChange={e => setForm({ ...form, periode: e.target.value })}
            placeholder="Periode (2025-01) *" className="border rounded-lg px-3 py-2 text-sm" />
          <div className="col-span-2 flex gap-2">
            <button onClick={save}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold">
              {editId ? 'Simpan Perubahan' : 'Tambah'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm({ divisi_id: '', nama: '', total: '', periode: '' }); }}
              className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm">
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-4">Nama Anggaran</th>
              <th className="text-left p-4">Divisi</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Terpakai</th>
              <th className="text-left p-4">Sisa</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada data anggaran</td></tr>
            )}
            {data.map(a => {
              const sisa = Number(a.total) - Number(a.terpakai);
              return (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{a.nama}</td>
                  <td className="p-4 text-gray-500">{a.divisi_nama}</td>
                  <td className="p-4">{fmt(a.total)}</td>
                  <td className="p-4">{fmt(a.terpakai)}</td>
                  <td className={`p-4 font-semibold ${sisa < 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(sisa)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => startEdit(a)} className="text-indigo-600 hover:underline mr-3 text-xs">Edit</button>
                    <button onClick={() => setConfirmHapus(a.id)} className="text-red-500 hover:underline text-xs">Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}