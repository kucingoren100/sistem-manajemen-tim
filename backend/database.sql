-- =============================================
-- Sistem Manajemen Anggaran Tim
-- Jalankan file ini di MySQL / phpMyAdmin
-- =============================================

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

-- =============================================
-- DATA AWAL (Seed)
-- =============================================

INSERT INTO divisi (nama, deskripsi) VALUES
('Acara', 'Divisi pengelola acara dan kegiatan'),
('Humas', 'Divisi hubungan masyarakat dan publikasi'),
('Keuangan', 'Divisi pengelola keuangan organisasi'),
('Perlengkapan', 'Divisi pengadaan dan perlengkapan');

-- Password default: "password123" (bcrypt hash)
INSERT INTO users (nama, email, password, role, divisi_id) VALUES
('Admin Utama', 'admin@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL),
('Budi Santoso', 'budi@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'anggota', 1),
('Siti Rahayu', 'siti@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'anggota', 2);

INSERT INTO anggaran (divisi_id, nama, total, periode) VALUES
(1, 'Anggaran Acara Q1 2025', 5000000, '2025-Q1'),
(2, 'Anggaran Humas Q1 2025', 2000000, '2025-Q1'),
(3, 'Anggaran Keuangan Q1 2025', 1500000, '2025-Q1'),
(4, 'Anggaran Perlengkapan Q1 2025', 3000000, '2025-Q1');
