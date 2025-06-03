const express = require('express');
const router = express.Router();
const { getAllOrangTua, getOrangTuaById, createOrangTua, updateOrangTua, deleteOrangTua } = require('../controllers/OrangTuaController');

router.get('/', getAllOrangTua);
router.get('/:id', getOrangTuaById);
router.post('/', createOrangTua);
router.put('/:id', updateOrangTua);
router.delete('/:id', deleteOrangTua);

module.exports = router;
