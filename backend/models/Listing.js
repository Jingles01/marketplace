const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        required: true
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    location: {
        zipCode: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" ,
        required: true
    },
    sold: {
        type: Boolean,
        default: false
    },
    buyerId:{
        type: Schema.Types.ObjectId,
        ref: 'User' ,
        default: null
    },
    soldExternally: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Listing", listingSchema);