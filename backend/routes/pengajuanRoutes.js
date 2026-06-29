const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pengajuanController');
const { auth, adminOnly } = require('../middleware/authMiddleware');

router.get('/', auth, adminOnly, ctrl.getAll);
router.get('/saya', auth, ctrl.getMine);
router.post('/', auth, ctrl.upload.single('file'), ctrl.create);
router.patch('/:id/approve', auth, adminOnly, ctrl.approve);
router.patch('/:id/reject', auth, adminOnly, ctrl.reject);
router.get('/notifikasi', auth, ctrl.getNotifikasi);
router.patch('/notifikasi/read', auth, ctrl.readNotifikasi);

module.exports = router;