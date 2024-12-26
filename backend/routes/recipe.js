const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');


// Lấy toàn bộ công thức nấu ăn
router.get('/getall', recipeController.getAllRecipe);

// Lấy công thức nấu ăn phân trang
router.get('/get', recipeController.getRecipe);

//Lấy trang chi tiết công thức nấu ăn
router.get('/details/:recipeId', recipeController.getRecipeDetails);

//Lấy các công thức nấu ăn theo category
router.get('/getcategory', recipeController.getByCategory);

// Thêm công thức nấu ăn
router.post('/create', recipeController.addRecipe);

//Chỉnh sửa công thức nấu ăn
router.put('/update/:id', recipeController.updateRecipe);

//Xóa công thức nấu ăn và các bản ghi liên quan
router.delete('/delete/:id', recipeController.deleteRecipe);

//Tìm kiếm công thức nấu ăn
router.get('/search/:name', recipeController.searchRecipe);

// Lấy danh sách các FavoriteRecipe của user
router.get('/favorites/:userId', recipeController.getUserFavoriteRecipes);

// Thêm Recipe vào FavoriteRecipe
router.post('/favorites/add', recipeController.addFavoriteRecipe);

// Xóa Recipe khỏi FavoriteRecipe
router.delete('/favorites/remove/:_id', recipeController.removeFavoriteRecipe);

//Kiểm tra yêu thích
router.post('/favorites/check', recipeController.checkFavoriteRecipe);


module.exports = router;
