const express = require('express');
const router = express.Router();
const { countKaryawan, getAllKaryawan, getKaryawanById, createKaryawan, updateKaryawan, deleteKaryawan } = require('../controllers/KaryawanController');

router.get('/count', countKaryawan);
router.get('/', getAllKaryawan);
router.get('/:id', getKaryawanById);
router.post('/', createKaryawan);
router.put('/:id', updateKaryawan);
router.delete('/:id', deleteKaryawan);

module.exports = router;