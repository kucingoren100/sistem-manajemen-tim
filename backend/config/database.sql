-- ============================================
-- DATABASE: sistem_anggaran_tim
-- ============================================

CREATE DATABASE IF NOT EXISTS sistem_anggaran_tim;
USE sistem_anggaran_tim;

-- Tabel divisi
CREATE TABLE divisi (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  nama        VARCHAR(100) NOT NULL,
  deskripsi   TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel users
CREATE TABLE users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  nama        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'anggota') DEFAULT 'anggota',
  divisi_id   INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (divisi_id) REFERENCES divisi(id) ON DELETE SET NULL
);

-- Tabel anggaran
CREATE TABLE anggaran (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  divisi_id   INT NOT NULL,
  nama        VARCHAR(150) NOT NULL,
  total       DECIMAL(15,2) NOT NULL,
  periode     VARCHAR(20) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (divisi_id) REFERENCES divisi(id) ON DELETE CASCADE
);

-- Tabel pengajuan
CREATE TABLE pengajuan (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  user_id       INT NOT NULL,
  anggaran_id   INT NOT NULL,
  judul         VARCHAR(150) NOT NULL,
  deskripsi     TEXT,
  jumlah        DECIMAL(15,2) NOT NULL,
  status        ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  catatan_admin TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (anggaran_id) REFERENCES anggaran(id) ON DELETE CASCADE
);

-- Tabel notifikasi
CREATE TABLE notifikasi (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  pesan       TEXT NOT NULL,
  is_read     TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO divisi (nama, deskripsi) VALUES
('Acara', 'Divisi yang mengurus seluruh kegiatan dan acara organisasi'),
('Humas', 'Divisi hubungan masyarakat dan publikasi'),
('Keuangan', 'Divisi pengelolaan keuangan internal'),
('Perlengkapan', 'Divisi pengadaan alat dan perlengkapan');

-- Password: admin123 (bcrypt hash)
INSERT INTO users (nama, email, password, role, divisi_id) VALUES
('Admin Utama', 'admin@organisasi.com', '$2a$10$QpeYVDODkWDN9rcIdOHEQuUX6VUo9kVPPK1j4cfDDKszb6VlKp6NO', 'admin', NULL),
('Budi Santoso', 'budi@organisasi.com', '$2a$10$QpeYVDODkWDN9rcIdOHEQuUX6VUo9kVPPK1j4cfDDKszb6VlKp6NO', 'anggota', 1),
('Siti Rahayu', 'siti@organisasi.com', '$2a$10$QpeYVDODkWDN9rcIdOHEQuUX6VUo9kVPPK1j4cfDDKszb6VlKp6NO', 'anggota', 2),
('Andi Wijaya', 'andi@organisasi.com', '$2a$10$QpeYVDODkWDN9rcIdOHEQuUX6VUo9kVPPK1j4cfDDKszb6VlKp6NO', 'anggota', 3);

INSERT INTO anggaran (divisi_id, nama, total, periode) VALUES
(1, 'Anggaran Acara Seminar Nasional', 15000000, '2025-01'),
(2, 'Anggaran Publikasi Media Sosial', 5000000, '2025-01'),
(3, 'Anggaran Operasional Bulanan', 8000000, '2025-01'),
(4, 'Anggaran Pembelian Perlengkapan', 10000000, '2025-01');

INSERT INTO pengajuan (user_id, anggaran_id, judul, deskripsi, jumlah, status) VALUES
(2, 1, 'Sewa Gedung Auditorium', 'Sewa gedung untuk seminar nasional 2 hari', 6000000, 'approved'),
(2, 1, 'Konsumsi Peserta', 'Konsumsi untuk 200 peserta seminar', 4000000, 'pending'),
(3, 2, 'Desain Banner dan Poster', 'Pembuatan materi promosi digital dan cetak', 2500000, 'approved'),
(4, 3, 'ATK Bulanan', 'Pembelian alat tulis kantor bulanan', 1200000, 'rejected'),
(4, 4, 'Pembelian Sound System', 'Sound system portable untuk kegiatan lapangan', 5000000, 'pending');
