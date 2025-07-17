const axios = require('axios');
const config = require('../config');

const geocodeZipCode = async (input) => {
    try {
        let apiUrl = '';
        let isZipCode = /^\d{5}(-\d{4})?$/.test(input);

        if (isZipCode) {
            apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${input}&key=${config.googleMapsApiKey}`;
        } else if (input.latitude !== undefined && input.longitude !== undefined) {
            apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${input.latitude},${input.longitude}&key=${config.googleMapsApiKey}`;
        }

        const response = await axios.get(apiUrl);

        const result = response.data.results[0];
        const location = {
            zipCode: null,
            coordinates: null,
            city: null,
            state: null,
            formattedAddress: result.formatted_address
        };

        if (isZipCode) {
            location.zipCode = input;
            location.coordinates = [
                result.geometry.location.lng,
                result.geometry.location.lat
            ];
        } else {
            for (const component of result.address_components) {
                if (component.types.includes('postal_code')) {
                    location.zipCode = component.long_name;
                    break;
                }
            }
            location.coordinates = [input.longitude, input.latitude];
        }

        for (const component of result.address_components) {
            if (component.types.includes('locality')) {
                location.city = component.long_name;
            } else if (component.types.includes('administrative_area_level_1')) {
                location.state = component.short_name;
            }
        }

        return location;
    } catch (error) {
        throw new Error('Failed to geocode location');
    }
};

module.exports = { geocodeZipCode };