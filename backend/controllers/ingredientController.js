const Ingredient = require('../models/Ingredient');

//Lấy toàn bộ nguyên liệu
exports.getAllIngre = async (req, res) => {
  const ingre = await Ingredient.find();
  res.json(ingre);
};

//Lấy nguyên liệu theo trang
exports.getIngre = async (req, res) => {
    try {
    const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại
    const limit = parseInt(req.query.limit) || 7; // Số lượng phần tử mỗi trang
    const skip = (page - 1) * limit; // Bỏ qua những phần tử trước đó
    const search = req.query.search || ''; //Tìm kiếm

      // Đếm tổng số nguyên liệu
      const totalIngredients = await Ingredient.countDocuments({ 
        name: new RegExp(search, 'i') 
      }).collation({ locale: 'vi', strength: 1 });
      const totalPages = Math.ceil(totalIngredients / limit);

      // Lấy danh sách nguyên liệu với phân trang
      const ingredients = await Ingredient.find({ 
        name: new RegExp(search, 'i') 
      }).collation({ locale: 'vi', strength: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // Trả về danh sách và tổng số trang
      res.status(200).json({
        ingredients,
        totalPages,
        currentPage: page, //Gửi về trang hiện tại
      });
      
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
  
//Thêm nguyên liệu mới
exports.addIngre = async (req, res) => {
    try {
      const {  name, carb, xo, fat, protein, kcal } = req.body;
  
      // Kiểm tra xem nguyên liệu đã tồn tại hay chưa
      const existingIngre = await Ingredient.findOne({ name });
      if (existingIngre) {
          return res.status(400).json({ message: 'Ingredient already exists' });
      }

      const newIngre = new Ingredient({
        name: name,
        carb: carb,
        xo: xo,
        fat: fat,
        protein: protein,
        kcal: kcal,
      });
  
      const savedIngre = await newIngre.save();
      res.status(201).json(savedIngre);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
// Xóa nguyên liệu
exports.deleteIngre = async (req, res) => {
    try {
      const ingreID = req.params._id;
      const deleteIngre = await Ingredient.findByIdAndDelete(ingreID);
      if (!deleteIngre) {
        return res.status(404).json({ message: 'Ingredient not found' });
      }
      res.json({ message: 'Ingredient deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
// Chỉnh sửa nguyên liệu
exports.updateIngre = async (req, res) => {
    try {
        const {  name, carb, xo, fat, protein, kcal } = req.body;
      const updatedIngre = await Ingredient.findByIdAndUpdate(
        req.params._id,
        {  name, carb, xo, fat, protein, kcal }, // Cập nhật tất cả các trường
        { new: true }
      );
      if (!updatedIngre) {
        return res.status(404).json({ message: 'Ingredient not found' });
      }
      res.json(updatedIngre);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
// Tìm kiếm nguyên liệu
exports.searchIngre = async (req, res) => {
    try {
      const ingres = await Ingredient.find({ 
        name: new RegExp(req.params.name, 'i') 
      });
      res.json(ingres);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };