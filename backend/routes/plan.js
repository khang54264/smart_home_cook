const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

// Lấy danh sách Plan
router.get('/getplan/:userId', planController.getUserPlan);

// Tạo Meal Plan
router.post('/createplan', planController.createMealPlan);

// Sửa Meal Plan
router.put('/editplan/:planId', planController.updateMealPlan);

// Xóa Meal Plan
router.delete('/delplan/:planId', planController.deleteMealPlan);

// Thêm Recipe vào Meal Plan
router.post('/addrepplan', planController.addRecipeToMealPlan);

// Xóa Recipe khỏi Meal Plan
router.delete('/delrepplan', planController.removeRecipeFromMealPlan);

module.exports = router;
