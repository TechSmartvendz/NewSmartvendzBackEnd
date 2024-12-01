const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const devicesMachinesMappingSchema = new mongoose.Schema(
    {
        // Machine
        machine_id: { type: String, required: true },
        machine_name: { type: String, required: true },

        // Device
        device_id: { type: String, required: true },
        device_name: { type: String, required: true },
        comments: { type: String, default: '' },
        createdBy: {type: Schema.Types.ObjectId, required: true },
        updatedBy: {type: Schema.Types.ObjectId }
    },
    { timestamps: { createdAt: true, updatedAt: true } }
);

// Add a unique compound index for machine_id and device_id
devicesMachinesMappingSchema.index({ machine_id: 1, device_id: 1 }, { unique: true });

module.exports = mongoose.model('Mapping', devicesMachinesMappingSchema);