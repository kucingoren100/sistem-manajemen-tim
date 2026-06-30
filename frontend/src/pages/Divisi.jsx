import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Divisi() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ nama: '', deskripsi: '' });
  const [editId, setEditId] = useState(null);
  const [confirmHapus, setConfirmHapus] = useState(null);

  const load = () => api.get('/divisi').then(r => setData(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editId) await api.put(`/divisi/${editId}`, form);
    else await api.post('/divisi', form);
    setForm({ nama: '', deskripsi: '' });
    setEditId(null);
    load();
  };

  const remove = async () => {
    await api.delete(`/divisi/${confirmHapus}`);
    setConfirmHapus(null);
    load();
  };

  const startEdit = (d) => {
    setForm({ nama: d.nama, deskripsi: d.deskripsi });
    setEditId(d.id);
  };

  return (
    <div className="p-6">
      {/* Modal Konfirmasi Hapus */}
      {confirmHapus && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Hapus Divisi?</h3>
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

      <h2 className="text-2xl font-bold text-gray-800 mb-1">Divisi</h2>
      <p className="text-gray-500 text-sm mb-6">Kelola divisi dalam organisasi</p>

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-5 space-y-3 max-w-2xl">
        <h3 className="font-semibold text-gray-700">{editId ? 'Edit Divisi' : 'Tambah Divisi'}</h3>
        <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}
          placeholder="Nama Divisi" className="w-full border rounded-lg px-3 py-2 text-sm" />
        <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })}
          placeholder="Deskripsi" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <button onClick={save} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
            {editId ? 'Simpan' : 'Tambah'}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm({ nama: '', deskripsi: '' }); }}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
              Batal
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {data.map(d => (
          <div key={d.id} className="bg-white rounded-xl border p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{d.nama}</p>
              <p className="text-xs text-gray-500">{d.deskripsi}</p>
            </div>
            <div>
              <button onClick={() => startEdit(d)} className="text-indigo-600 text-xs mr-3 hover:underline">Edit</button>
              <button onClick={() => setConfirmHapus(d.id)} className="text-red-500 text-xs hover:underline">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}