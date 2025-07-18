const cloudinary = require("cloudinary").v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error", error);
                    reject(new Error('image upload failed'));
                } else{
                    resolve(result);
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

module.exports = {uploadImage}