const Joi = require('joi');
    // SCHEMA DEFINED
module.export.campspotSchema = Joi.object({
    campspot: Joi.object().required()({
        title: Joi.string().required(),
        price: Joi.number().required.min(0),
        image: Joi.string().required(),
        location: Joi.string.required(),
        description: Joi.string().required()
    }).required()
}) 
