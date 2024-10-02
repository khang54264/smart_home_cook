const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');

// Lấy toàn bộ công thức nấu ăn
router.get('/get', dishController.getAllDish);

  // Thêm công thức nấu ăn
router.post('/create', dishController.addDish);

//Chỉnh sửa công thức nấu ăn
router.put('/dishes/:id', dishController.updateDish);

//Tìm kiếm công thức nấu ăn
router.get('/search', dishController.searchDish);


module.exports = router;
