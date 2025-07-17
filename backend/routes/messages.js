const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Listing = require('../models/Listing');
const { authenticateJWT } = require('../auth');


const router = express.Router();

async function findOrCreateConversation(userId, otherUserId, listingId) {
    let conversation = await Conversation.findOne({
        participants: { $all: [userId, otherUserId] },
        listingId: listingId
    });
    if (!conversation) {
        conversation = new Conversation({
            participants: [userId, otherUserId],
            listingId
        });
        await conversation.save();
    }
    return conversation;
}

async function createMessage({ content, senderId, recipientId, conversationId, offerDetails, listingId }) {
    const newMessage = new Message({
        content,
        sender: senderId,
        recipient: recipientId,
        conversation: conversationId,
        offerDetails,
        listingId
    });


    await newMessage.save();
    return newMessage;
}

router.get('/conversations', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'username')
            .populate('lastMessage')
            .populate({
                path: 'listingId',
                select: 'title price images',
                model: 'Listing'
            })
            .sort({ updatedAt: -1 })
            .lean();

        const formattedConversations = conversations.map(conv => {
            const listingData = (conv.listingId && typeof conv.listingId === 'object' && conv.listingId._id)
                ? conv.listingId: null;
            return{...conv, listing: listingData, listingId: undefined};
        });

        const finalConversations = formattedConversations.map(({ listingId, ...rest }) => rest);

        res.json(finalConversations);
    } catch (err) {
        res.status(500).json({ error: 'Could not retrieve conversations' });
    }
});

router.get('/conversations/:conversationId', authenticateJWT, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.userId;


        const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
        if (!conversation) {
            return res.status(403).json({ error: 'Access denied for this conversation' });
        }


        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'username')
            .sort({ createdAt: 1 });


        await Message.updateMany(
            { conversation: conversationId, recipient: userId, read: false },
            { read: true }
        );


        let listing = null;

        if (conversation.listingId) {
            listing = await Listing.findById(conversation.listingId).select('title images price');
        }


        res.json({ messages, listing });
    } catch (err) {
        res.status(500).json({ error: 'Could not retrieve messages' });
    }
});


router.post('/from-listing', authenticateJWT, async (req, res) => {
    try {
        const { listingId, message, senderId } = req.body;
        const userId = req.user.userId;


        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ error: 'Listing not found' });


        const conversation = await findOrCreateConversation(userId, listing.createdBy, listingId);
        const newMessage = await createMessage({
            content: message,
            senderId: userId,
            recipientId: listing.createdBy,
            conversationId: conversation._id,
            listingId
        });


        conversation.lastMessage = newMessage._id;
        conversation.updatedAt = Date.now();
        await conversation.save();


        await newMessage.populate('sender', 'username');
        res.status(201).json({ message: newMessage, conversation: conversation._id });
    } catch (err) {
        res.status(500).json({ error: 'Could not send message' });
    }
});

router.post('/reply/:conversationId', authenticateJWT, async (req, res) => {
    try {
        const { content } = req.body;
        const { conversationId } = req.params;
        const userId = req.user.userId;


        const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
        if (!conversation) return res.status(403).json({ error: 'Access denied for this conversation' });


        const recipientId = conversation.participants.find(id => id.toString() !== userId);
        const message = await createMessage({
            content,
            senderId: userId,
            recipientId,
            conversationId: conversation._id,
            listingId: conversation.listingId
        });


        conversation.lastMessage = message._id;
        conversation.updatedAt = Date.now();
        await conversation.save();


        await message.populate('sender', 'username');
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Could not send message' });
    }
});

router.post('/offer', authenticateJWT, async (req, res) => {
    try {
        const { listingId, offeredPrice, message } = req.body;
        const userId = req.user.userId;


        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ error: 'Listing not found' });


        if (listing.createdBy.toString() === userId) {
            return res.status(400).json({ error: 'Cannot send an offer on your own listing' });
        }


        const conversation = await findOrCreateConversation(userId, listing.createdBy, listingId);
        const newMessage = await createMessage({
            content: message || `I'd like to offer $${offeredPrice} for this item.`,
            senderId: userId,
            recipientId: listing.createdBy,
            conversationId: conversation._id,
            offerDetails: { type: 'initial', originalPrice: listing.price, offeredPrice },
            listingId
        });


        conversation.lastMessage = newMessage._id;
        conversation.updatedAt = Date.now();
        await conversation.save();


        await newMessage.populate('sender', 'username');
        res.status(201).json({ message: newMessage, conversation: conversation._id });
    } catch (err) {
        res.status(500).json({ error: 'Could not send offer' });
    }
});

router.post('/respond-offer/:messageId', authenticateJWT, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { response, counterPrice, message } = req.body;
        const userId = req.user.userId;


        const originalMessage = await Message.findById(messageId).populate('sender').populate('conversation');
        if (!originalMessage) return res.status(404).json({ error: 'Offer not found' });


        if (originalMessage.recipient.toString() !== userId) {
            return res.status(403).json({ error: 'Access denied for this offer' });
        }


        const responseMessage = await createMessage({
            content: message || (response === 'accepted' ? 'I accept your offer!' : response === 'rejected' ? 'Offer declined.' : `Counter offer: $${counterPrice}`),
            senderId: userId,
            recipientId: originalMessage.sender._id,
            conversationId: originalMessage.conversation._id,
            offerDetails: { type: response, originalPrice: originalMessage.offerDetails.originalPrice, offeredPrice: response === 'counter' ? counterPrice : originalMessage.offerDetails.offeredPrice },
            listingId: originalMessage.listingId
        });


        await originalMessage.conversation.updateOne({ lastMessage: responseMessage._id, updatedAt: Date.now() });


        await responseMessage.populate('sender', 'username');
        res.status(201).json(responseMessage);
    } catch (err) {
        res.status(500).json({ error: 'Could not respond to offer' });
    }
});


module.exports = router;