const express = require('express');
const router = express.Router();
const { getAllPengeluaran, getPengeluaranById, createPengeluaran, updatePengeluaran, deletePengeluaran, countPengeluaran } = require('../controllers/PengeluaranController');
const uploadFile = require('../middleware/UploadMiddleware');
const {verifyUser, adminOnly} = require('../middleware/UserMiddleware');

router.get('/total', countPengeluaran);
router.get('/', getAllPengeluaran);
router.get('/:id', getPengeluaranById);
router.post('/', verifyUser, uploadFile('bukti_pengeluaran'), createPengeluaran);
router.put('/:id', verifyUser, uploadFile('bukti_pengeluaran'), updatePengeluaran);
router.delete('/:id', verifyUser, deletePengeluaran);

module.exports = router;
