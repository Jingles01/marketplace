const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location');

router.get('/zip-from-coords', locationController.getZipCodeFromCoordinates);

module.exports = router;