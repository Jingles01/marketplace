const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const reviewSchema = new Schema({
    reviewer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roleReviewed: {
        type: String,
        required: true,
        enum: ['seller', 'buyer']
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 150
    },
    transaction: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

reviewSchema.index({ reviewer: 1, reviewee: 1, transaction: 1}, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);