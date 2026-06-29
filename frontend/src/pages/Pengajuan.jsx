import { useState, useEffect } from 'react';
import api from '../api/axios';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Pengajuan() {
  const [anggaran, setAnggaran] = useState([]);
  const [form, setForm] = useState({ anggaran_id: '', judul: '', jumlah: '' });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/anggaran').then(r => setAnggaran(r.data)); }, []);

  const selected = anggaran.find(a => a.id == form.anggaran_id);
  const sisa = selected ? Number(selected.total) - Number(selected.terpakai) : 0;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f && f.type !== 'application/pdf') {
      setMsg({ type: 'error', text: 'Hanya file PDF yang diizinkan!' });
      e.target.value = '';
      return;
    }
    setFile(f);
    setMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg({ type: 'error', text: 'File PDF wajib diupload!' });
    setLoading(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append('anggaran_id', form.anggaran_id);
      fd.append('judul', form.judul);
      fd.append('jumlah', form.jumlah);
      fd.append('file', file);
      await api.post('/pengajuan', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg({ type: 'success', text: 'Pengajuan berhasil dikirim! Menunggu persetujuan admin.' });
      setForm({ anggaran_id: '', judul: '', jumlah: '' });
      setFile(null);
      document.getElementById('fileInput').value = '';
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal mengirim' });
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Ajukan Pengeluaran</h2>
      <p className="text-gray-500 text-sm mb-6">Isi form dan upload dokumen PDF pendukung</p>

      {msg && (
        <div className={`p-4 rounded-lg mb-5 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Anggaran</label>
          <select value={form.anggaran_id} onChange={e => setForm({ ...form, anggaran_id: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
            <option value="">-- Pilih anggaran --</option>
            {anggaran.map(a => <option key={a.id} value={a.id}>{a.divisi_nama} — {a.nama}</option>)}
          </select>
          {selected && (
            <p className="text-xs mt-1 text-gray-500">
              Sisa: <span className={`font-semibold ${sisa < 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(sisa)}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul Pengajuan</label>
          <input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Contoh: Sewa Gedung Acara" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
          <input type="number" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0" min="1" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Dokumen PDF</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition">
            <input id="fileInput" type="file" accept=".pdf,application/pdf"
              onChange={handleFile} className="hidden" />
            <label htmlFor="fileInput" className="cursor-pointer">
              {file ? (
                <div className="text-indigo-700 font-medium text-sm">📄 {file.name}</div>
              ) : (
                <div>
                  <p className="text-gray-400 text-sm">Klik untuk pilih file PDF</p>
                  <p className="text-gray-300 text-xs mt-1">Maksimal 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
          {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </div>
    </div>
  );
}