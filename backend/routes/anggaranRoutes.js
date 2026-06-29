const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/anggaranController');
const { auth, adminOnly } = require('../middleware/authMiddleware');
router.get('/', auth, getAll);
router.post('/', auth, adminOnly, create);
router.put('/:id', auth, adminOnly, update);
router.delete('/:id', auth, adminOnly, remove);
module.exports = router;
