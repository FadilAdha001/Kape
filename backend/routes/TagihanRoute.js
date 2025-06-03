const express = require('express');
const router = express.Router();
const { getAllTagihan, getTagihanById, createTagihan, updateTagihan, deleteTagihan } = require('../controllers/TagihanController');

router.get('/', getAllTagihan);
router.get('/:id', getTagihanById);
router.post('/', createTagihan);
router.put('/:id', updateTagihan);
router.delete('/:id', deleteTagihan);

module.exports = router;
