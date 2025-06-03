const express = require('express');
const router = express.Router();
const { countSiswa, getAllSiswa, getSiswaById, createSiswa, updateSiswa, deleteSiswa } = require('../controllers/SiswaController');

router.get('/count', countSiswa);
router.get('/', getAllSiswa);
router.get('/:id', getSiswaById);
router.post('/', createSiswa);
router.put('/:id', updateSiswa);
router.delete('/:id', deleteSiswa);

module.exports = router;