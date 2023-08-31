const Joi = require('joi');

exports.getAllMachineSlots = Joi.object().keys({
    machineid: Joi.string().required(),
});