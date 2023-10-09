const Joi = require('joi');

exports.addSupplier = Joi.object().keys({
    supplierName: Joi.string().required().trim(),
    supplierEmail: Joi.string().required(),
    supplierPhone: Joi.string().required(),
    supplierAddress: Joi.string().required(),
    contactPerson: Joi.string().required(),
    area: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    pincode: Joi.string().required(),
    warehouse: Joi.string().required(),
});

exports.suppliedById = Joi.object().keys({
    id: Joi.string().required()
});