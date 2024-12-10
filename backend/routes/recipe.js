const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');


// Lấy toàn bộ công thức nấu ăn
router.get('/getall', recipeController.getAllRecipe);

// Lấy công thức nấu ăn phân trang
router.get('/get', recipeController.getRecipe);

// Thêm công thức nấu ăn
router.post('/create', recipeController.addRecipe);

//Chỉnh sửa công thức nấu ăn
router.put('/update/:id', recipeController.updateRecipe);

//Xóa công thức nấu ăn và các bản ghi liên quan
router.delete('/delete/:id', recipeController.deleteRecipe);

//Tìm kiếm công thức nấu ăn
router.get('/search/:name', recipeController.searchRecipe);


module.exports = router;
