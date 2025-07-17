const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { authenticateJWT } = require('../auth');
const User = require('../models/User');
const Listing = require('../models/Listing');

router.post('/', authenticateJWT, async (req, res) => {
    try {
        const { revieweeId, listingId, rating, comment } = req.body;
        const reviewerId = req.user.userId;

        if (!revieweeId || !listingId || rating === undefined) {
            return res.status(400).json({ error: 'Missing required fields: revieweeId, listingId, rating' });
        }
        if (reviewerId === revieweeId) {
            return res.status(403).json({ error: 'Cannot review yourself' });
        }

        const listing = await Listing.findById(listingId).select('createdBy buyerId sold soldExternally');
        if (!listing) {
            return res.status(404).json({ error: 'Listing (transaction) not found' });
        }
        if (!listing.sold) {
            return res.status(400).json({ error: 'Cannot review a listing that has not been marked as sold' });
        }

        const actualSellerId = listing.createdBy.toString();
        const actualBuyerId = listing.buyerId ? listing.buyerId.toString() : null;

        if (reviewerId !== actualSellerId && reviewerId !== actualBuyerId) {
            return res.status(403).json({ error: 'You were not part of this transaction' });
        }

        if (revieweeId !== actualSellerId && revieweeId !== actualBuyerId) {
            return res.status(400).json({ error: 'The reviewed user was not part of this transaction' });
        }

        if (!((reviewerId === actualSellerId && revieweeId === actualBuyerId) ||
            (reviewerId === actualBuyerId && revieweeId === actualSellerId))) {
            return res.status(403).json({ error: 'Reviewer and reviewee do not match transaction participants' });
        }

        if (listing.soldExternally && reviewerId === actualSellerId) {
            return res.status(400).json({ error: 'Cannot review buyer for an externally sold item' });
        }

        let roleReviewed;
        if (revieweeId === actualSellerId) {
            roleReviewed = 'seller';
        } else if (revieweeId === actualBuyerId) {
            roleReviewed = 'buyer';
        } else {
            return res.status(400).json({ error: 'Reviewee was not the buyer or seller in this transaction.' });
        }

        const existingReview = await Review.findOne({
            reviewer: reviewerId,
            reviewee: revieweeId,
            transaction: listingId
        });


        if (existingReview) {
            return res.status(400).json({ error: 'You have already submitted a review for this transaction' });
        }

        const review = new Review({
            reviewer: reviewerId,
            reviewee: revieweeId,
            roleReviewed: roleReviewed,
            rating: rating,
            comment: comment,
            transaction: listingId,
        });

        await review.save();

        await review.populate([
            { path: 'reviewer', select: 'username _id' },
            { path: 'reviewee', select: 'username _id' }
        ]);

        res.status(201).json(review);

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid ID format provided (revieweeId or listingId)" });
        }
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const reviews = await Review.find({ reviewee: userId })
            .populate('reviewer', 'username _id')
            .populate('transaction', 'title _id')
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

        res.json({
            reviews: reviews,
            averageRating: averageRating,
            totalReviews: totalReviews,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

module.exports = router;