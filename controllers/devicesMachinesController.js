const Mapping = require('../model/devicesMachinesMappingSchema');

// Create a new mapping
exports.createMapping = async (req, res) => {
    try {
        const { machine_id, machine_name, device_id, device_name, comments } = req.body;

        const newMapping = new Mapping({ machine_id, machine_name, device_id, device_name, comments });
        newMapping.createdBy = req.userData._id;
        await newMapping.save();

        res.status(201).json(newMapping);
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key error
            return res.status(400).json({
                error: 'Mapping between the specified Machine and Device already exists.',
            });
        }
        res.status(500).json({ error: err.message });
    }
};

// Get all mappings
exports.getMappings = async (req, res) => {
    try {
        const mappings = await Mapping.find();
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
