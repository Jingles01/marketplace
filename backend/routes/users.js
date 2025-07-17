const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const { authenticateJWT } = require('../auth');
const {geocodeZipCode} = require("../utils/geocoding");

const router = express.Router();

router.get('/list', authenticateJWT, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } })
        .select('username _id')
        .sort('username');

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
        .select('-password -__v');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.put('/profile', authenticateJWT, async (req, res) => {
  try {
    const { username, firstName, lastName, location } = req.body;
    const { zipCode } = location || {};

    if (username && (username.length < 4 || username.length > 20)) {
      return res.status(400).json({ error: 'Username must be between 4 and 20 characters' });
    }

    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user.userId }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
    }

    let locationData = {};
    if (zipCode) {
      try {
        const geocodedLocation = await geocodeZipCode(zipCode);
        locationData = {
          zipCode: geocodedLocation.zipCode,
          city: geocodedLocation.city,
          state: geocodedLocation.state
        };
      } catch (geocodeErr) {
        return res.status(400).json({ error: 'Invalid zip code' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        {
          username,
          firstName,
          lastName,
          location: locationData,
        },
        {
          new: true,
          runValidators: true,
          select: '-password -__v'
        }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userProfile = await User.findById(userId)
        .select('username createdAt location.city location.state');

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const activeListings = await Listing.find({ createdBy: userId, sold: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title price images category condition _id createdAt');

    const reviewsReceived = await Review.find({ reviewee: userId })
        .populate('reviewer', 'username _id')
        .sort({ createdAt: -1 })
        .limit(10);

    const totalReviews = await Review.countDocuments({ reviewee: userId });
    const ratingSum = reviewsReceived.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviewsReceived.length > 0 ? (ratingSum / reviewsReceived.length) : 0;

    res.json({
      user: userProfile,
      listings: activeListings,
      reviews: reviewsReceived,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews
    });

  } catch (err) {
    if (err.name === 'CastError' && err.path === '_id') {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.get('/purchases', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;

    const purchases = await Listing.find({
      buyerId: userId,
      sold: true
    })
        .populate('createdBy', 'username _id')
        .select('title price images createdAt createdBy sold soldExternally')
        .sort({ createdAt: -1 });

    res.json(purchases);

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve purchase history' });
  }
});

router.get('/sold-items', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;

    const soldItems = await Listing.find({
      createdBy: userId,
      sold: true
    })
        .populate('buyerId', 'username _id')
        .select('title price images createdAt buyerId sold soldExternally')
        .sort({ createdAt: -1 });

    res.json(soldItems);

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve sold items history' });
  }
});

module.exports = router;