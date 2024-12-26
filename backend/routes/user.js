const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Đăng nhập
router.post('/login', userController.login);

// Lấy toàn bộ User
router.get('/getall', userController.getAllUser);

// Lấy người dùng phân trang
router.get('/get', userController.getUser);

// Tạo user mới
router.post('/create', userController.createUser);

// Xóa User
router.delete('/delete/:_id', userController.deleteUser);

// Chỉnh sửa User
router.put('/update/:_id', userController.updateUser);

// Hiển thị thông tin người dùng
router.get('/getuserprofile', userController.getUserProfile);

//Thay đổi mật khẩu
router.put('/changepassword', userController.changePassword);

// Tìm kiếm User
router.get('/search', userController.searchUser);

module.exports = router;
