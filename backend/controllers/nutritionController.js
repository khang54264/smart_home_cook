const Nutrition = require('../models/Nutrition');

//Lấy toàn bộ thông tin dinh dưỡng
exports.getNutritionsById = async (req, res) => {
    try {
        const recipeId = req.query.recipeId; // Lấy id của công thức từ URL
        const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại
        const limit = parseInt(req.query.limit) || 5; // Số lượng phần tử mỗi trang
        const skip = (page - 1) * limit; // Bỏ qua những phần tử trước đó
        
        //Đếm tổng số thông tin
        const totalStep = await Nutrition.countDocuments({ 
            r_id: recipeId
        }).collation({ locale: 'vi', strength: 1 });
        const totalPages = Math.ceil(totalStep / limit);

        //Lấy danh sách các bước của công thức với phân trang
        const nutritions = await Nutrition.find({ 
            r_id: recipeId
        }).collation({ locale: 'vi', strength: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ step_number: 1 }); // Sắp xếp step_number tăng dần

        // Trả về danh sách các bước
        res.status(200).json({
            nutritions: nutritions,
            totalPages,
            currentPage: page, //Gửi về trang hiện tại
        });

    } catch (error) {
        console.error('Error fetching nutritions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//Thêm dinh dưỡng theo id
exports.addNutrition = async (req, res) => {
    const newNutrition = new Nutrition({
      r_id: req.body.r_id,
      name: req.body.name,
      amount: req.body.amount,
      unit: req.body.unit,
    });
  
    try {
      const savedNutrition = await newNutrition.save();
      res.status(201).json(savedNutrition);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

//Sửa dinh dưỡng theo id
exports.updateNutrition = async (req, res) => {
    try {
      const updatedNutrition = await Nutrition.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedNutrition) {
        return res.status(404).json({ message: 'Nutrition not found' });
      }
      res.json(updatedNutrition);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

//Xóa dinh dưỡng theo id
exports.deleteNutrition = async (req, res) => {
    const nutritionId = req.params.id;
    try {
      // Xóa công thức
      const deletedNutrition = await Nutrition.findByIdAndDelete(nutritionId);
      if (!deletedNutrition) {
        return res.status(404).json({ message: 'Nutrition not found' });
      }
  
      res.json({ message: 'Nutrition is deleted succesfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };