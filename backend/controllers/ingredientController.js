const Ingredient = require('../models/Ingredient');
const IngredientList = require('../models/IngredientList');
const mongoose = require('mongoose');

//Lấy toàn bộ nguyên liệu
exports.getAllIngre = async (req, res) => {
  const ingre = await Ingredient.find();
  res.json(ingre);
};

//Lấy nguyên liệu cho dropdown
exports.getDropdownIngredient = async (req, res) => {
  try {
    const search = req.query.search || ''; //Tìm kiếm
    // Lấy danh sách nguyên liệu
    const ingredients = await Ingredient.find({ 
      $or: [
        {name: new RegExp(search, 'i')},
        {type: new RegExp(search, 'i')}
      ]
  }).collation({ locale: 'vi', strength: 1 })
  // Trả về danh sách
  res.status(200).json({
    ingredients: ingredients,
  });
} catch (error) {
  res.status(500).json({ message: error.message });
}
};

//Lấy danh sách nguyên liệu của món ăn
exports.getIngreList = async (req, res) => {
  try {
    const recipeId = req.query.recipeId || ''; //Tìm kiếm
    // Kiểm tra xem recipeId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }
    // Lấy danh sách nguyên liệu
    const ingredients = await IngredientList.aggregate([
      {
        $match: { r_id: new mongoose.Types.ObjectId(recipeId) } // Lọc theo recipeId
      },
      {
        $lookup: {
          from: 'ingredients', // Tên collection Ingredient trong MongoDB (phải là dạng số nhiều của tên model)
          localField: 'i_id',
          foreignField: '_id',
          as: 'ingredientDetails' // Gán dữ liệu từ Ingredient vào đây
        }
      },
      {
        $unwind: '$ingredientDetails' // Trích xuất dữ liệu từ mảng ingredientDetails
      },
      {
        $project: {
          _id: 1, // _id của IngredientList
          r_id: 1,
          i_id: 1,
          name: '$ingredientDetails.name', // Lấy name từ Ingredient
          type: '$ingredientDetails.type', // Lấy type từ Ingredient
          amount: 1,
          unit: 1,
        }
      }
    ]).collation({ locale: 'vi', strength: 1 })
    // Trả về danh sách 
    res.status(200).json({
      ingredients: ingredients,
    });
} catch (error) {
  res.status(500).json({ message: error.message });
}
};

// Thêm IngredientList
exports.addIngreList = async (req, res) => {
  try {
      const { r_id, i_id, amount, unit} = req.body;
      // Log kiểm tra dữ liệu
      console.log("Received data:", { r_id, i_id, amount, unit });
      if (!r_id || !i_id) {
        return res.status(400).json({ message: 'Both r_id and i_id are required.' });
      }
      // Kiểm tra xem nguyên liệu đã tồn tại hay chưa
      const existingIngre = await IngredientList.findOne({ r_id, i_id });
      if (existingIngre) {
          return res.status(400).json({ message: 'Recipe already got the ingredient' });
      }
      const newIngreList = new IngredientList({r_id,i_id, amount, unit});
      const savedIngre = await newIngreList.save();
      res.status(201).json(savedIngre);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

// Xóa IngredientList
exports.deleteIngreList = async (req, res) => {
  const ingredientId = req.params.id;
  try {
    // Xóa nguyên liệu
    const deletedIngreList = await IngredientList.findByIdAndDelete(ingredientId);
    if (!deletedIngreList) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.json({ message: 'Ingredient is deleted succesfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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