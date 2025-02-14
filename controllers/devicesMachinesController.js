const Mapping = require('../model/devicesMachinesMappingSchema');

// Create a new mapping
// exports.createMapping = async (req, res) => {
//     try {
//         const { machine_id, machine_name, device_id, device_name, comments } = req.body;

//         const newMapping = new Mapping({ machine_id, machine_name, device_id, device_name, comments });
//         newMapping.createdBy = req.userData._id;
//         await newMapping.save();

//         res.status(201).json(newMapping);
//     } catch (err) {
//         if (err.code === 11000) {
//             // Duplicate key error
//             return res.status(400).json({
//                 error: 'Mapping between the specified Machine and Device already exists.',
//             });
//         }
//         res.status(500).json({ error: err.message });
//     }
// };


exports.createMapping = async (req, res) => {
    try {
        const mappings = Array.isArray(req.body) ? req.body : [req.body];

        const newMappings = mappings.map(mapping => {
            const { machine_id, machine_name, device_id, device_name, comments } = mapping;
            const newMapping = new Mapping({ machine_id, machine_name, device_id, device_name, comments });
            newMapping.createdBy = req.userData._id;
            return newMapping;
        });

        const savedMappings = await Mapping.insertMany(newMappings, { ordered: false });
        res.status(201).json(savedMappings);
    } catch (err) {
        if (err.code === 11000) {
            // Handle duplicate key error for multiple records
            return res.status(400).json({
                error: 'Some mappings could not be created due to duplicate keys.',
                details: err.writeErrors || err.message,
            });
        }
        res.status(500).json({ error: err.message });
    }
};


// Get all mappings
exports.getMappings = async (req, res) => {
    try {
        const { fields } = req.query; // e.g., fields=machine_id,vendor_id
        const projection = fields ? fields.split(',').join(' ') : '';
        const mappings = await Mapping.find({}, projection);
        res.status(200).json(mappings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a specific mapping
exports.getMappingById = async (req, res) => {
    try {
        const { id } = req.params;
        const mapping = await Mapping.findById(id);
        if (!mapping) return res.status(404).json({ error: 'Mapping not found' });
        res.status(200).json(mapping);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a mapping
exports.updateMapping = async (req, res) => {
    try {
        const { id } = req.params;
        const { machine_id, machine_name, device_id, device_name, comments } = req.body;
        
        const updatedMapping = await Mapping.findByIdAndUpdate(
            id,
            { machine_id, machine_name, device_id, device_name, comments, updatedBy:req.userData._id},
            { new: true }
        );
        if (!updatedMapping) return res.status(404).json({ error: 'Mapping not found' });
        res.status(200).json(updatedMapping);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Update multiple mappings
exports.updateMappings = async (req, res) => {
    try {
        const updates = req.body; // Expecting an array of updates [{ id, ...fields }]
        
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided or invalid format' });
        }

        const updatedMappings = await Promise.all(
            updates.map(async (update) => {
                const { id, ...fields } = update; // Destructure `id` and other fields to update
                return await Mapping.findByIdAndUpdate(
                    id,
                    { ...fields, updatedBy: req.userData._id },
                    { new: true }
                );
            })
        );

        // Filter out failed updates (if any document wasn't found)
        const notFound = updatedMappings.filter((mapping) => !mapping);
        if (notFound.length > 0) {
            return res.status(404).json({ 
                error: 'Some mappings were not found',
                notFound: notFound.map((_, index) => updates[index].id)
            });
        }

        res.status(200).json(updatedMappings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a mapping
exports.deleteMapping = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMapping = await Mapping.findByIdAndDelete(id);
        if (!deletedMapping) return res.status(404).json({ error: 'Mapping not found' });
        res.status(200).json({ message: 'Mapping deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



exports.manageMappings = async (req, res) => {
    try {
        const { inserted, updated, deleted } = req.body;

        const results = {
            inserted: [],
            updated: [],
            deleted: [],
        };

        // Insert new mappings
        if (inserted && Array.isArray(inserted)) {
            const newMappings = inserted.map((item) => {
                const { machine_id, machine_name, device_id, device_name, comments } = item;
                const newMapping = new Mapping({ machine_id, machine_name, device_id, device_name, comments });
                newMapping.createdBy = req.userData._id;
                return newMapping;
            });

            results.inserted = await Mapping.insertMany(newMappings, { ordered: false });
        }

        // Update existing mappings
        if (updated && Array.isArray(updated)) {
            results.updated = await Promise.all(
                updated.map(async (update) => {
                    const { id, ...fields } = update;
                    return await Mapping.findByIdAndUpdate(
                        id,
                        { ...fields, updatedBy: req.userData._id },
                        { new: true }
                    );
                })
            );
        }

        // Delete mappings
        if (deleted && Array.isArray(deleted)) {
            results.deleted = await Promise.all(
                deleted.map(async (item) => {
                    const { id } = item;
                    return await Mapping.findByIdAndDelete(id);
                })
            );
        }

        // Return the results
        res.status(200).json({
            message: 'Mappings processed successfully',
            results,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

