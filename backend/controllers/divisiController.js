const db = require('../config/db');

const getAll = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM divisi ORDER BY nama');
  res.json(rows);
};

const create = async (req, res) => {
  const { nama, deskripsi } = req.body;
  try {
    const [result] = await db.query('INSERT INTO divisi (nama, deskripsi) VALUES (?, ?)', [nama, deskripsi]);
    res.status(201).json({ id: result.insertId, nama, deskripsi });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  const { nama, deskripsi } = req.body;
  await db.query('UPDATE divisi SET nama=?, deskripsi=? WHERE id=?', [nama, deskripsi, req.params.id]);
  res.json({ message: 'Divisi diperbarui' });
};

const remove = async (req, res) => {
  await db.query('DELETE FROM divisi WHERE id=?', [req.params.id]);
  res.json({ message: 'Divisi dihapus' });
};

module.exports = { getAll, create, update, remove };
