const Recipe = require('../models/Recipe');
//Các bảng tham chiếu
const FavoriteRecipe = require('../models/FavoriteRecipe');
const ShoppingList = require('../models/ShoppingList');
const PlanRecipe = require('../models/PlanRecipe');
const RecipeTag = require('../models/RecipeTag');
const RecipeStep = require('../models/RecipeStep');
const IngredientList = require('../models/IngredientList');
const Nutrition = require('../models/Nutrition');

//Lấy toàn bộ công thức nấu ăn
exports.getAllRecipe = async (req, res) => {
    const recipes = await Recipe.find();
    res.json(recipes);
};

//Lấy công thức nấu ăn theo trang
exports.getRecipe = async (req, res) => {
  try {
  const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại
  const limit = parseInt(req.query.limit) || 7; // Số lượng phần tử mỗi trang
  const skip = (page - 1) * limit; // Bỏ qua những phần tử trước đó
  const search = req.query.search || ''; //Tìm kiếm

  // Đếm tổng số công thức nấu ăn
  const totalRecipe = await Recipe.countDocuments({ 
    $or: [
      {name: new RegExp(search, 'i')},
    ]
  }).collation({ locale: 'vi', strength: 1 });
  const totalPages = Math.ceil(totalRecipe / limit);

  // Lấy danh sách công thức nấu ăn với phân trang
  const recipes = await Recipe.find({ 
    $or: [
      {name: new RegExp(search, 'i')},
    ]
  }).collation({ locale: 'vi', strength: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Trả về danh sách và tổng số trang
  res.status(200).json({
    recipes: recipes,
    totalPages,
    currentPage: page, //Gửi về trang hiện tại
  });
} catch (error) {
  res.status(500).json({ message: error.message });
}
};

// Thêm công thức nấu ăn
exports.addRecipe = async (req, res) => {
    const newRecipe = new Recipe({
      name: req.body.name,
      cook_time: req.body.cook_time,
      image_url: req.body.image_url,
    });
  
    try {
      const savedDish = await newRecipe.save();
      res.status(201).json(savedDish);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

// Chỉnh sửa công thức nấu ăn
exports.updateRecipe = async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa công thức nấu ăn và các bản ghi liên quan
exports.deleteRecipe = async (req, res) => {
  const recipeId = req.params.id;
  try {
    // Xóa công thức
    const deletedRecipe = await Recipe.findByIdAndDelete(recipeId);
    if (!deletedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Xóa các bản ghi liên quan
    await Promise.all([
      FavoriteRecipe.deleteMany({ r_id: recipeId }),
      ShoppingList.deleteMany({ r_id: recipeId }),
      PlanRecipe.deleteMany({ r_id: recipeId }),
      RecipeTag.deleteMany({ r_id: recipeId }),
      RecipeStep.deleteMany({ r_id: recipeId }),
      IngredientList.deleteMany({ r_id: recipeId }),
      Nutrition.deleteMany({ r_id: recipeId }),
    ]);

    res.json({ message: 'Recipe and related records are deleted succesfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tìm công thức nấu ăn theo tên
exports.searchRecipe = async (req, res) => {
  try {
    const searchName = req.params.term || req.query.term; 
    if (!searchName) {
      const recipes = await Recipe.find();
      res.json(recipes);
    }
    const recipes = await Recipe.find({ name: new RegExp(searchName, 'i') });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

