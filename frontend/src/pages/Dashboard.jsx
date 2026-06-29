import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Dashboard() {
  const { user } = useAuth();
  const [anggaran, setAnggaran] = useState([]);
  const [pengajuan, setPengajuan] = useState([]);

  useEffect(() => {
    api.get('/anggaran').then(r => setAnggaran(r.data));
    const endpoint = user?.role === 'admin' ? '/pengajuan' : '/pengajuan/saya';
    api.get(endpoint).then(r => setPengajuan(r.data));
  }, [user]);

  const totalAnggaran = anggaran.reduce((s, a) => s + Number(a.total), 0);
  const totalTerpakai = anggaran.reduce((s, a) => s + Number(a.terpakai), 0);
  const pending = pengajuan.filter(p => p.status === 'pending').length;
  const approved = pengajuan.filter(p => p.status === 'approved').length;

  const chartData = anggaran.map(a => ({
    name: a.divisi_nama?.split(' ')[0],
    Anggaran: Number(a.total),
    Terpakai: Number(a.terpakai),
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm">Ringkasan anggaran dan aktivitas tim</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Anggaran', value: fmt(totalAnggaran), color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Total Terpakai', value: fmt(totalTerpakai), color: 'bg-orange-50 text-orange-700' },
          { label: 'Menunggu Approval', value: pending, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Disetujui', value: approved, color: 'bg-green-50 text-green-700' },
        ].map(c => (
          <div key={c.label} className={`rounded-xl p-4 ${c.color}`}>
            <p className="text-xs font-medium opacity-70">{c.label}</p>
            <p className="text-xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Anggaran vs Realisasi per Divisi</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barGap={4}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => 'Rp ' + (v/1000000).toFixed(1) + 'jt'} tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => fmt(v)} />
            <Bar dataKey="Anggaran" fill="#6366f1" radius={[4,4,0,0]} />
            <Bar dataKey="Terpakai" fill="#f97316" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-700">Status Anggaran per Divisi</h3>
        </div>
        <div className="divide-y">
          {anggaran.map(a => {
            const pct = Math.min((a.terpakai / a.total) * 100, 100);
            const over = Number(a.terpakai) > Number(a.total);
            return (
              <div key={a.id} className="p-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{a.nama}</span>
                  <span className={over ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                    {fmt(a.terpakai)} / {fmt(a.total)}
                    {over && ' ⚠️ Over Budget'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-orange-400' : 'bg-indigo-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
