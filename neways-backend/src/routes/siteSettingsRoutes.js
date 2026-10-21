const express = require('express');
const router = express.Router();
const siteSettingsController = require('../controllers/siteSettingsController');

router.get('/', siteSettingsController.getPublicSettings);

module.exports = router;
