const express = require('express');
const router = express.Router();
const dishController = requite('../controllers/dishController');

// Lấy toàn bộ công thức nấu ăn
router.get('/', dishController.getAllDish);

  // Thêm công thức nấu ăn
router.post('/create', dishController.addDish);

//Chỉnh sửa công thức nấu ăn
router.put('/dishes/:id', dishController.updateDish);

//Tìm kiếm công thức nấu ăn
router.get('/search', dishController.searchDish);

module.exports = router;
