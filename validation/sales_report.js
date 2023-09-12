const Joi = require('joi');

exports.salesReport = Joi.object().keys({
    start: Joi.string().required(),
    end: Joi.string().required(),
});