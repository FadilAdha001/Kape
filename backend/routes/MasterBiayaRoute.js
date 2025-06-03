const express = require('express');
const router = express.Router();
const { getAllMasterBiaya, getMasterBiayaById, createMasterBiaya, updateMasterBiaya, deleteMasterBiaya } = require('../controllers/MasterBiayaController');

router.get('/', getAllMasterBiaya);
router.get('/:id', getMasterBiayaById);
router.post('/', createMasterBiaya);
router.put('/:id', updateMasterBiaya);
router.delete('/:id', deleteMasterBiaya);

module.exports = router;