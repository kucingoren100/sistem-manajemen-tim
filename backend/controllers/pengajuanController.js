const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Config upload PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Hanya file PDF yang diizinkan'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
module.exports.upload = upload;

const db = require('../config/db');

const getAll = async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.*, u.nama as nama_pengaju, a.nama as nama_anggaran, a.total as total_anggaran, d.nama as divisi_nama
    FROM pengajuan p
    JOIN users u ON p.user_id = u.id
    JOIN anggaran a ON p.anggaran_id = a.id
    JOIN divisi d ON a.divisi_id = d.id
    ORDER BY p.created_at DESC
  `);
  res.json(rows);
};

const getMine = async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.*, a.nama as nama_anggaran, d.nama as divisi_nama
    FROM pengajuan p
    JOIN anggaran a ON p.anggaran_id = a.id
    JOIN divisi d ON a.divisi_id = d.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `, [req.user.id]);
  res.json(rows);
};

const create = async (req, res) => {
  const { anggaran_id, judul, jumlah } = req.body;
  const file_path = req.file ? req.file.filename : null;

  if (!file_path) return res.status(400).json({ message: 'File PDF wajib diupload' });

  try {
    const [[anggaran]] = await db.query('SELECT total FROM anggaran WHERE id=?', [anggaran_id]);
    const [[{ terpakai }]] = await db.query(
      "SELECT COALESCE(SUM(jumlah),0) as terpakai FROM pengajuan WHERE anggaran_id=? AND status='approved'",
      [anggaran_id]
    );
    const sisa = anggaran.total - terpakai;
    if (jumlah > sisa) {
      return res.status(400).json({ message: `Jumlah melebihi sisa anggaran (Rp ${Number(sisa).toLocaleString('id-ID')})` });
    }
    const [result] = await db.query(
      'INSERT INTO pengajuan (user_id, anggaran_id, judul, file_path, jumlah) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, anggaran_id, judul, file_path, jumlah]
    );
    const [admins] = await db.query("SELECT id FROM users WHERE role='admin'");
    for (const admin of admins) {
      await db.query('INSERT INTO notifikasi (user_id, pesan) VALUES (?, ?)',
        [admin.id, `Pengajuan baru: "${judul}" senilai Rp ${Number(jumlah).toLocaleString('id-ID')}`]);
    }
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approve = async (req, res) => {
  const { id } = req.params;
  const [[p]] = await db.query('SELECT * FROM pengajuan WHERE id=?', [id]);
  if (!p) return res.status(404).json({ message: 'Tidak ditemukan' });
  await db.query("UPDATE pengajuan SET status='approved', catatan_admin=NULL WHERE id=?", [id]);
  await db.query('INSERT INTO notifikasi (user_id, pesan) VALUES (?, ?)',
    [p.user_id, `Pengajuan "${p.judul}" Anda telah DISETUJUI ✅`]);
  res.json({ message: 'Pengajuan disetujui' });
};

const reject = async (req, res) => {
  const { id } = req.params;
  const { catatan_admin } = req.body;
  const [[p]] = await db.query('SELECT * FROM pengajuan WHERE id=?', [id]);
  if (!p) return res.status(404).json({ message: 'Tidak ditemukan' });
  await db.query("UPDATE pengajuan SET status='rejected', catatan_admin=? WHERE id=?", [catatan_admin, id]);
  await db.query('INSERT INTO notifikasi (user_id, pesan) VALUES (?, ?)',
    [p.user_id, `Pengajuan "${p.judul}" Anda DITOLAK ❌. Catatan: ${catatan_admin}`]);
  res.json({ message: 'Pengajuan ditolak' });
};

const getNotifikasi = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM notifikasi WHERE user_id=? ORDER BY created_at DESC LIMIT 20', [req.user.id]);
  res.json(rows);
};

const readNotifikasi = async (req, res) => {
  await db.query('UPDATE notifikasi SET is_read=1 WHERE user_id=?', [req.user.id]);
  res.json({ message: 'Semua notifikasi ditandai dibaca' });
};

module.exports = { getAll, getMine, create, approve, reject, getNotifikasi, readNotifikasi, upload };
