const dotenv = require("dotenv");
dotenv.config();

const config = {
    port: process.env.PORT || 3546,
    nodeEnv: process.env.NODE_ENV || "development",
    dbURL: process.env.MONGO_URI || "mongodb://localhost:27017/marketplace",
    jwtSecret: process.env.JWT_SECRET_KEY,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
    clientURL: process.env.CLIENT_URL || "http://localhost:5173",
    cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
};

module.exports = config;