const Joi = require('joi');

exports.userLogin = Joi.object().keys({
    user_id: Joi.string().required(),
    password: Joi.string().required(),
});