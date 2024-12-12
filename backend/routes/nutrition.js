const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');

// Lấy toàn bộ bước nấu ăn theo id
router.get('/getnubyid', nutritionController.getNutritionsById);

// Thêm bước nấu ăn
router.post('/add', nutritionController.addNutrition);

//Chỉnh sửa bước nấu ăn
router.put('/update/:id', nutritionController.updateNutrition);

//Xóa bước nấu ăn
router.delete('/delete/:id', nutritionController.deleteNutrition);

module.exports = router;
