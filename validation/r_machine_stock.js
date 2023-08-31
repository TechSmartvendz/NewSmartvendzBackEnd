const Joi = require('joi');

exports.refillSheet = Joi.object().keys({
    refiller: Joi.string().required(),
});