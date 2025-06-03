const express = require('express');
const router = express.Router();
const {getAllPemasukan, getPemasukanById, createPemasukan, updatePemasukan, deletePemasukan, countPemasukan } = require('../controllers/PemasukanController');
router.get('/total', countPemasukan);
router.get('/', getAllPemasukan);
router.get('/:id', getPemasukanById);
router.post('/', createPemasukan);
router.put('/:id', updatePemasukan);
router.delete('/:id', deletePemasukan);

module.exports = router;
