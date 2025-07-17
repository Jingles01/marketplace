const express = require('express');
const { authenticateJWT } = require('../auth');
const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');

const router = express.Router();

router.get('/ids', authenticateJWT, async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.userId }).select('listing');
        const listingIds = favorites.map(fav => fav.listing.toString());
        res.json(listingIds);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch favorite IDs' });
    }
});

router.get('/', authenticateJWT, async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'listing',
                model: 'Listing',
                populate: {
                    path: 'createdBy',
                    model: 'User',
                    select: 'username _id'
                }
            });
        const favoriteListings = favorites.map(fav => fav.listing).filter(listing => listing != null);

        res.json(favoriteListings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

router.post('/', authenticateJWT, async (req, res) => {
    const { listingId } = req.body;
    const userId = req.user.userId;

    if (!listingId) {
        return res.status(400).json({ error: 'Listing ID is required' });
    }

    try {
        const listingExists = await Listing.findById(listingId);
        if (!listingExists) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        const existingFavorite = await Favorite.findOne({ user: userId, listing: listingId });
        if (existingFavorite) {
            return res.status(200).json({ message: 'Already favorited', favorite: existingFavorite });
        }

        const newFavorite = new Favorite({ user: userId, listing: listingId });
        await newFavorite.save();
        res.status(201).json({ message: 'Listing favorited successfully', favorite: newFavorite });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(200).json({ message: 'Already favorited (concurrent request)' });
        }
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

router.delete('/:listingId', authenticateJWT, async (req, res) => {
    const { listingId } = req.params;
    const userId = req.user.userId;

    try {
        const result = await Favorite.deleteOne({ user: userId, listing: listingId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Favorite not found for this user/listing' });
        }
        res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

module.exports = router;