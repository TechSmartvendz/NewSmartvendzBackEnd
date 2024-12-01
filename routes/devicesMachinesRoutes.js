const express = require('express');
const {
    createMapping,
    getMappings,
    getMappingById,
    updateMapping,
    deleteMapping,
} = require('../controllers/devicesMachinesController');

const auth = require("../middleware/authentication");
const router = express.Router();

// Routes for CRUD operations
router.post('/', auth, createMapping);            // Create a new mapping
router.get('/', auth, getMappings);               // Get all mappings
router.get('/:id', auth, getMappingById);         // Get a specific mapping
router.put('/:id', auth, updateMapping);          // Update a mapping
router.delete('/:id', auth, deleteMapping);       // Delete a mapping

module.exports = router;
