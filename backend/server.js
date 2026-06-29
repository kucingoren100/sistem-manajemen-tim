const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/divisi', require('./routes/divisiRoutes'));
app.use('/api/anggaran', require('./routes/anggaranRoutes'));
app.use('/api/pengajuan', require('./routes/pengajuanRoutes'));

app.get('/', (req, res) => res.json({ message: 'Sistem Anggaran Tim API berjalan' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));