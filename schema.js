const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
        category: Joi.array()
        .items(Joi.string().valid(
            'rooms',
            'mountains',
            'iconic cities',
            'castles',
            'amazing pools',
            'camping',
            'farms',
            'arctic',
            'domes',
            'boats',
            'trending',
            'new',
            'cabin',
            'national park',
            'beach',
            'treehouses'

        ))
        .required(),
    }).required(),
    categorySelected: Joi.string().allow("", null), // Add this line for categorySelected   
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
       rating: Joi.number().required().min(1).max(5),
       comment: Joi.string().required(),
    }).required()
})