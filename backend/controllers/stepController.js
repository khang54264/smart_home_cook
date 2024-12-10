const RecipeStep = require('../models/RecipeStep');

//Lấy toàn bộ bước nấu ăn theo id, xếp giá trị tăng dần theo step_number
exports.getStepsById = async (req, res) => {
    try {
        const recipeId = req.params.id; // Lấy id của công thức từ URL
        const steps = await RecipeStep.find({ _id: recipeId }) // Tìm các bước nấu ăn thuộc recipeId
            .sort({ step_number: 1 }); // Sắp xếp step_number tăng dần
        res.json(steps); // Trả về danh sách các bước
    } catch (error) {
        console.error('Error fetching recipe steps:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//Thêm bước nấu ăn theo id

//Sửa bước nấu ăn theo id

//Xóa bước nấu ăn theo id