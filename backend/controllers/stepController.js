const RecipeStep = require('../models/RecipeStep');

//Lấy toàn bộ bước nấu ăn theo id, xếp giá trị tăng dần theo step_number
exports.getStepsById = async (req, res) => {
    try {
        const recipeId = req.query.recipeId; // Lấy id của công thức từ URL
        const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại
        const limit = parseInt(req.query.limit) || 3; // Số lượng phần tử mỗi trang
        const skip = (page - 1) * limit; // Bỏ qua những phần tử trước đó
        
        //Đếm tổng số bước
        const totalStep = await RecipeStep.countDocuments({ 
            r_id: recipeId
        }).collation({ locale: 'vi', strength: 1 });
        const totalPages = Math.ceil(totalStep / limit);

        //Lấy danh sách các bước của công thức với phân trang
        const steps = await RecipeStep.find({ 
            r_id: recipeId
        }).collation({ locale: 'vi', strength: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ step_number: 1 }); // Sắp xếp step_number tăng dần

        // Trả về danh sách các bước
        res.status(200).json({
            steps: steps,
            totalPages,
            currentPage: page, //Gửi về trang hiện tại
        });

    } catch (error) {
        console.error('Error fetching steps:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//Thêm bước nấu ăn theo id
exports.addStep = async (req, res) => {
    const newStep = new RecipeStep({
      r_id: req.body.r_id,
      step_name: req.body.step_name,
      step_number: req.body.step_number,
      description: req.body.description,
      image_url: req.body.image_url
    });
  
    try {
      const savedStep = await newStep.save();
      res.status(201).json(savedStep);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

//Sửa bước nấu ăn theo id
exports.updateStep = async (req, res) => {
    try {
      const updatedStep = await RecipeStep.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedStep) {
        return res.status(404).json({ message: 'Step not found' });
      }
      res.json(updatedStep);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

//Xóa bước nấu ăn theo id
exports.deleteStep = async (req, res) => {
    const stepId = req.params.id;
    try {
      // Xóa công thức
      const deletedStep = await RecipeStep.findByIdAndDelete(stepId);
      if (!deletedStep) {
        return res.status(404).json({ message: 'Step not found' });
      }
  
      res.json({ message: 'Step is deleted succesfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };