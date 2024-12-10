const express = require('express');
const router = express.Router();
const stepController = require('../controllers/stepController');

// Lấy toàn bộ bước nấu ăn theo id
router.get('/getstepbyid/:id/steps', stepController.getStepsById);

module.exports = router;
