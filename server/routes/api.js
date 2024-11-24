const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const webSearchController = require('../controllers/webSearchController');

// AI Search routes
router.post('/search', searchController.search);

// Web Search routes
router.post('/web-search', webSearchController.searchWeb);

module.exports = router;
