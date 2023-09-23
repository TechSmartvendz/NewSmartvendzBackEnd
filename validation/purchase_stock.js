const Joi = require('joi');

const productSchema = Joi.object({
    product: Joi.string().required(),
    productQuantity: Joi.number().integer().min(0).required(),
    sellingPrice: Joi.number().min(0).required(),
    totalPrice: Joi.number().min(0).required(),
  });

exports.purchaseStockValidate = Joi.object().keys({
    warehouse: Joi.string().required(),
    supplier: Joi.string().required(),
    products: Joi.array().items(productSchema).min(1).required(),
    date: Joi.date().iso().required(),
    invoiceNumber: Joi.string().required(),
});

exports.getpurchasestockbyid = Joi.object().keys({
    id: Joi.string().required(),
})