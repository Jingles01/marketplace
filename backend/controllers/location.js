const { geocodeZipCode } = require('../utils/geocoding');

const getZipCodeFromCoordinates = async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    try {
        const locationData = await geocodeZipCode({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
        res.json({ zipCode: locationData.zipCode, formattedAddress: locationData.formattedAddress });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve zip code from coordinates.' });
    }
};

module.exports = {getZipCodeFromCoordinates};