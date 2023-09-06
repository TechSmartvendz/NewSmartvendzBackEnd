const Joi = require('joi');

exports.purchaseStock = Joi.object().keys({
    warehouse: Joi.string().required(),
    supplier: Joi.string().required(),
    product: Joi.string().required(),
    products: [{
        product: Joi.string().required(),
        productQuantity: Joi.string().required(),
        sellingPrice: Joi.string().required(),
        totalPrice: Joi.string().required(),
        gstName: Joi.string().optional(),
    }],
    date: Joi.string().required(),
    invoiceNumber: Joi.string().required(),
});