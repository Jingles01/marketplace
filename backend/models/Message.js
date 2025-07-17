const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
    },
    read: {
        type: Boolean,
        default: false
    },
    offer: {
        type: {
            type: String,
            enum: ['initial', 'counter', 'accept', 'reject'],
            default: 'initial'
        },
        OGPrice: {
            type: Number,
        },
        offerPrice: {
            type: Number,
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Message', messageSchema);