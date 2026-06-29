const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT u.*, d.nama as divisi_nama FROM users u LEFT JOIN divisi d ON u.divisi_id = d.id WHERE u.email = ?',
      [email]
    );
    if (rows.length === 0) return res.status(401).json({ message: 'Email tidak ditemukan' });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Password salah' });
    const token = jwt.sign(
      { id: user.id, role: user.role, divisi_id: user.divisi_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role, divisi_id: user.divisi_id, divisi_nama: user.divisi_nama }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const register = async (req, res) => {
  const { nama, email, password, divisi_id } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (nama, email, password, divisi_id) VALUES (?, ?, ?, ?)', [nama, email, hash, divisi_id || null]);
    res.status(201).json({ message: 'Akun berhasil dibuat' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email sudah terdaftar' });
    res.status(500).json({ message: err.message });
  }
};

module.exports = { login, register };
