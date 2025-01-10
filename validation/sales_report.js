const Joi = require('joi');

exports.salesReport = Joi.object().keys({
    start: Joi.string().required(),
    end: Joi.string().required(),
    machineNameFilter: Joi.string().optional(),
    refillerNameFilter: Joi.string().optional(),
    productIdFilter: Joi.string().optional(),
});