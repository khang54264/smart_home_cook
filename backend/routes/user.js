const express = require('express');
const router = express.Router();
const userController = requite('../controllers/userController');

// Đăng nhập
router.post('/login', userController.login);

// Lấy toàn bộ User
router.get('/getall', userController.getAllUser);

// Tạo user mới
router.post('/create', userController.createUser);

// Xóa User
router.delete('/delete/:_id', userController.deleteUser);

// Chỉnh sửa User
router.put('/update/:_id', userController.updateUser);

// Tìm kiếm User
route.get('/search', userController.searchUser);

module.exports = router;
