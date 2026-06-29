const db = require('../config/db');

const getAll = async (req, res) => {
  const [rows] = await db.query(`
    SELECT a.*, d.nama as divisi_nama,
      COALESCE((SELECT SUM(p.jumlah) FROM pengajuan p WHERE p.anggaran_id = a.id AND p.status = 'approved'), 0) as terpakai
    FROM anggaran a
    JOIN divisi d ON a.divisi_id = d.id
    ORDER BY a.created_at DESC
  `);
  res.json(rows);
};

const create = async (req, res) => {
  const { divisi_id, nama, total, periode } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO anggaran (divisi_id, nama, total, periode) VALUES (?, ?, ?, ?)',
      [divisi_id, nama, total, periode]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  const { divisi_id, nama, total, periode } = req.body;
  await db.query('UPDATE anggaran SET divisi_id=?, nama=?, total=?, periode=? WHERE id=?',
    [divisi_id, nama, total, periode, req.params.id]);
  res.json({ message: 'Anggaran diperbarui' });
};

const remove = async (req, res) => {
  await db.query('DELETE FROM anggaran WHERE id=?', [req.params.id]);
  res.json({ message: 'Anggaran dihapus' });
};

module.exports = { getAll, create, update, remove };
