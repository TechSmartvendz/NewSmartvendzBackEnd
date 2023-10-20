const Joi = require('joi');

exports.refillSheet = Joi.object().keys({
    refiller: Joi.string().optional(),
    warehouse: Joi.string().optional(),
    machineid: Joi.string().optional(),
});