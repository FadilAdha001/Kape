const express = require('express');
const router = express.Router();
const { getAllKelas, getKelasById, createKelas, updateKelas, deleteKelas } = require('../controllers/KelasController');

router.get('/', getAllKelas);
router.get('/:id', getKelasById);
router.post('/', createKelas);
router.put('/:id', updateKelas);
router.delete('/:id', deleteKelas);

module.exports = router;
