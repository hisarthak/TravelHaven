const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const fuzzy = require("mongoose-fuzzy-searching");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },

    category: {
        type: [String],
        enum: [
            "rooms",
            "mountains",
            "iconic cities",
            "castles",
            "amazing pools",
            "camping",
            "farms",
            "arctic",
            "domes",
            "boats",
            "trending",
            "cabin",
            "national park",
            "beach",
            "treehouses", 
            "new"
        ],
        required: true, // Ensures that category is mandatory
    },
});

// Add fuzzy searching plugin for location, country, and title
listingSchema.plugin(fuzzy, {
    fields: ["title", "location", "country"],
});


listingSchema.post("findOneAndDelete", async (listing) =>{
    if(listing){
        await Review.deleteMany({ _id : {$in: listing.reviews}});
    }
   
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
