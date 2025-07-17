const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (fileFromMulter) => {
    try {
        const b64 = Buffer.from(fileFromMulter.buffer).toString("base64");
        let dataURI = "data:" + fileFromMulter.mimetype + ";base64," + b64;

        return await cloudinary.uploader.upload(dataURI, {
            folder: 'marketplace',
            resource_type: 'auto',
            public_id: undefined,
            use_filename: true,
            unique_filename: true,
        });
    } catch (error) {
        throw new Error('Image upload failed');
    }
};

module.exports = {uploadImage}