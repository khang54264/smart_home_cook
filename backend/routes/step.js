const express = require('express');
const router = express.Router();
const stepController = require('../controllers/stepController');

// Lấy toàn bộ bước nấu ăn theo id
router.get('/getstepbyid', stepController.getStepsById);

// Thêm bước nấu ăn
router.post('/add', stepController.addStep);

//Chỉnh sửa bước nấu ăn
router.put('/update/:id', stepController.updateStep);

//Xóa bước nấu ăn
router.delete('/delete/:id', stepController.deleteStep);

module.exports = router;
