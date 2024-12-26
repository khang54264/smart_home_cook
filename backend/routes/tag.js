const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');


// Lấy nhãn thẻ phân trang
router.get('/getall', tagController.getAllTag);

// Lấy nhãn thẻ cho dropdown
router.get('/getdropdown', tagController.getDropdownTag);

// Lấy nhãn thẻ cho danh sách RecipeTag
router.get('/getrecipetag', tagController.getRecipeTag);

// Thêm nhãn thẻ cho danh sách RecipeTag
router.post('/addreptag', tagController.addRecipeTag);

// Xóa nhãn thẻ cho danh sách RecipeTag
router.delete('/delreptag/:_id', tagController.deleteRecipeTag);

// Lấy nguyên liệu phân trang
router.get('/get', tagController.getTag);

// Thêm nhãn thẻ nấu ăn
router.post('/add', tagController.addTag);

//Chỉnh sửa nhãn thẻ nấu ăn
router.put('/update/:_id', tagController.updateTag);

//Xóa nhãn thẻ và các bản ghi liên quan
router.delete('/delete/:_id', tagController.deleteTag);

//Tìm kiếm nhãn thẻ
router.get('/search/:name', tagController.searchTag);


module.exports = router;
