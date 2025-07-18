const express = require("express");
const Listing = require("../models/Listing");
const { authenticateJWT } = require("../auth");
const upload = require("../utils/multer");
const fs = require("fs");
const {uploadImage} = require("../utils/cloudinary");
const {geocodeZipCode} = require("../utils/geocoding");
const Conversation = require("../models/Conversation");
const User = require("../models/User");


const router = express.Router();

router.post("/", authenticateJWT,  upload.single("image"), async (req, res) => {
    const { title, description, price, category, condition, zipCode } = req.body;

    try {

        let uploadedImage = null;
        if (req.file) {
            const result = await uploadImage(req.file.buffer);
            uploadedImage = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const location = zipCode ? await geocodeZipCode(zipCode) : null;

        const newListing = new Listing({
            title,
            description,
            price,
            category,
            condition,
            images: uploadedImage,
            location,
            createdBy: req.user.userId,
        });
        await newListing.save();
        res.status(201).json({ listing: newListing });
    } catch (error) {
        console.error("ERROR CREATING LISTING:", error);
        res.status(400).json({ error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const { zipCode } = req.query;
        let listings;
        let query = Listing.find({ sold: false});
        let sortOption = {createdAt: -1};

        if (zipCode) {
            const userLocation = await geocodeZipCode(zipCode);

            if (userLocation?.coordinates) {
                listings = await Listing.aggregate([
                    {
                        $geoNear: {
                            near: { type: "Point", coordinates: userLocation.coordinates },
                            distanceField: "distance",
                            spherical: true,
                        }
                    },
                    {
                        $sort: { distance: 1 }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdByUser"
                        }
                    },
                    {
                        $unwind: {
                            path: "$createdByUser",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            price: 1,
                            category: 1,
                            condition: 1,
                            images: 1,
                            location: 1,
                            createdAt: 1,
                            sold: 1,
                            distance: 1,
                            createdBy: {
                                _id: "$createdByUser._id",
                                username: "$createdByUser.username"
                            }
                        }
                    }
                ]).exec();
                return res.json(listings);
            }
        }
        listings = await query.populate("createdBy", "username").sort(sortOption);
        return res.json(listings);
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve listings" });
    }
});

router.get("/search", async (req, res) => {
    const { query, zipCode, category, condition, minPrice, maxPrice, sortBy } = req.query;
    try {
        let search = {};
        let sortOptions = {};

        search.sold = false;


        if (query) {
            search.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        if (category && category !== 'All') {
            search.category = category;
        }
        if (condition) {
            search.condition = condition;
        }
        if (minPrice || maxPrice) {
            search.price = {};
            if (minPrice) {
                search.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                search.price.$lte = parseFloat(maxPrice);
            }
        }

        switch (sortBy) {
            case 'price_asc':
                sortOptions = { price: 1 };
                break;
            case 'price_desc':
                sortOptions = { price: -1 };
                break;
            case 'createdAt_desc':
                sortOptions = { createdAt: -1 };
                break;
            case 'distance_asc':
                sortOptions = null;
                break;
            default:
                sortOptions = { createdAt: -1 };
        }

        let listings;

        if (zipCode) {
            const userLocation = await geocodeZipCode(zipCode);
            if (userLocation?.coordinates) {
                const pipeline = [
                    {
                        $geoNear: {
                            near: { type: "Point", coordinates: userLocation.coordinates },
                            distanceField: "distance",
                            spherical: true,
                            query: search
                        }
                    },
                    ...(sortBy === 'distance_asc' || !sortOptions ? [] : [{ $sort: sortOptions }]),
                    { $lookup: { from: "users", localField: "createdBy", foreignField: "_id", as: "createdByUser" } },
                    { $unwind: { path: "$createdByUser", preserveNullAndEmptyArrays: true } },
                    { $project: {
                            title: 1, description: 1, price: 1, category: 1, condition: 1,
                            images: 1, location: 1, createdAt: 1, sold: 1, distance: 1,
                            createdBy: { _id: "$createdByUser._id", username: "$createdByUser.username" }
                        }}
                ];
                listings = await Listing.aggregate(pipeline).exec();

            } else {
                listings = await Listing.find(search)
                    .sort(sortOptions || { createdAt: -1 })
                    .populate("createdBy", "username");
            }
        } else {
            if (sortBy === 'distance_asc') {
                sortOptions = { createdAt: -1 };
            }
            listings = await Listing.find(search)
                .sort(sortOptions)
                .populate("createdBy", "username");
        }

        res.json(listings);
    } catch (err) {
        res.status(500).json({ error: "Unable to fetch listings" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate("createdBy", "username email");

        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put("/:id", authenticateJWT, upload.single("image") ,async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        const updateData = { ...req.body };

        if (req.file) {
            const result = await uploadImage(req.file.buffer);
            updateData.image = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        if (updateData.zipCode) {
            updateData.location = await geocodeZipCode(updateData.zipCode);
            delete updateData.zipCode;
        }


        const updatedListing = await Listing.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        res.json(updatedListing);
    } catch (err) {
        res.status(500).json( "Unable to update listing");
    }
});

router.delete("/:id", authenticateJWT, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        await Listing.findByIdAndDelete(req.params.id);
        res.json({ message: "Listing successfully deleted" });
    } catch (err) {
        res.status(500).json( "Unable to delete listing");
    }
});

router.get('/:id/potential-buyers', authenticateJWT, async (req, res) => {
    try {
        const listingId = req.params.id;
        const userId = req.user.userId;

        const listing = await Listing.findById(listingId).select('createdBy');
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        if (listing.createdBy.toString() !== userId) {
            return res.status(403).json({ error: 'Access denied: You are not the owner of this listing' });
        }

        const conversations = await Conversation.find({ listingId: listingId }).select('participants');
        if (!conversations || conversations.length === 0) {
            return res.json([]);
        }

        const potentialBuyerIds = new Set();
        conversations.forEach(conv => {
            conv.participants.forEach(participantId => {
                if (participantId.toString() !== userId) {
                    potentialBuyerIds.add(participantId.toString());
                }
            });
        });

        const buyers = await User.find({ _id: { $in: Array.from(potentialBuyerIds) } })
            .select('_id username');

        res.json(buyers);

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: "Invalid listing ID format" });
        }
        res.status(500).json({ error: 'Failed to retrieve potential buyers' });
    }
});

router.put('/:id/sold', authenticateJWT, async (req, res) => {
    try {
        const listingId = req.params.id;
        const userId = req.user.userId;
        const { buyerId } = req.body;

        if (!buyerId) {
            return res.status(400).json({ error: 'Buyer information is required' });
        }

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        if (listing.createdBy.toString() !== userId) {
            return res.status(403).json({ error: 'Access denied: You are not the owner of this listing' });
        }

        if (listing.sold) {
            return res.status(400).json({ error: 'Listing is already marked as sold' });
        }

        const updateData = {
            sold: true,
            buyerId: buyerId,
            soldExternally: false
        };

        const updatedListing = await Listing.findByIdAndUpdate(
            listingId,
            updateData,
            { new: true }
        ).populate("createdBy", "username email");

        res.json(updatedListing);

    } catch (error) {
        if (error.name === 'CastError' && error.path === 'buyerId' && buyerId !== 'EXTERNAL') {
            return res.status(400).json({ error: "Invalid buyer ID format provided" });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ error: "Invalid listing ID format" });
        }
        res.status(500).json({ error: 'Failed to mark listing as sold' });
    }
});


module.exports = router;