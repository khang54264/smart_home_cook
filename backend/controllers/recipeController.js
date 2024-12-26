const Recipe = require('../models/Recipe');
//Các bảng tham chiếu
const FavoriteRecipe = require('../models/FavoriteRecipe');
const ShoppingList = require('../models/ShoppingList');
const PlanRecipe = require('../models/PlanRecipe');
const RecipeTag = require('../models/RecipeTag');
const RecipeStep = require('../models/RecipeStep');
const IngredientList = require('../models/IngredientList');
const Nutrition = require('../models/Nutrition');
const User = require('../models/User');

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

// Lấy công thức nấu ăn có tên 
exports.getByCategory = async (req, res) => {
  try {
    const recipeName = req.query.name; // Tên công thức cần tìm
    let recipes;
    // Tìm các công thức có tên là 

    if(!recipeName || recipeName.trim() === '') {
      recipes = await Recipe.aggregate([{ $sample: { size: 10 } }]);
    } else {
      recipes = await Recipe.find({ name: { $regex: recipeName, $options: 'i' } });
    }
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: `No recipes found with the name "${recipeName}"` });
    }

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//Lấy trang chi tiết công thức nấu ăn
exports.getRecipeDetails = async (req, res) => {
  try {
    const { recipeId } = req.params;

    // Lấy thông tin Recipe
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Lấy Steps
    const steps = await RecipeStep.find({ r_id: recipeId });

    // Lấy Nutrition
    const nutrition = await Nutrition.find({ r_id: recipeId });

    // Lấy Ingredients và thông tin Ingredient
    const ingredientList = await IngredientList.find({ r_id: recipeId }).populate('i_id');

    const ingredients = ingredientList.map(item => ({
      name: item.i_id.name,
      amount: item.amount,
      unit: item.unit,
    }));

    res.status(200).json({
      ...recipe.toObject(),
      steps,
      nutrition,
      ingredients,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving recipe details' });
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

// Lấy danh sách các FavoriteRecipe của user
exports.getUserFavoriteRecipes = async (req, res) => {
  const { userId } = req.params; // Lấy userId từ URL params

  try {
      // Kiểm tra xem người dùng có tồn tại không
      const favoriteRecipes = await FavoriteRecipe.find({ u_id: userId }).populate('r_id', 'name cook_time image_url'); // populate để lấy thông tin Recipe

      // if (!favoriteRecipes || favoriteRecipes.length === 0) {
      //     return res.status(404).json({ message: 'No favorite recipes found for this user' });
      // }

      // Trả về danh sách công thức yêu thích
      res.status(200).json({
          message: 'Favorite recipes found',
          favoriteRecipes: favoriteRecipes
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Thêm Recipe vào FavoriteRecipe
exports.addFavoriteRecipe = async (req, res) => {
  try {
      const { u_id, r_id } = req.body; // Lấy userId và recipeId từ body của request
      // Log kiểm tra dữ liệu
      // console.log("Received data:", { u_id, r_id });
      if (!u_id || !r_id) {
        return res.status(404).json({ message: 'Both userId and recipeId are required.' });
      }
      // Kiểm tra xem công thức đã có trong danh sách yêu thích của người dùng chưa
      const existingFavorite = await FavoriteRecipe.findOne({ u_id, r_id });
      if (existingFavorite) {
          return res.status(400).json({ message: 'Recipe already in favorites' });
      }
      // Thêm công thức vào danh sách yêu thích
      const newFavorite = new FavoriteRecipe({u_id,r_id});
      const savedRecipe = await newFavorite.save();
      res.status(201).json(savedRecipe);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Xóa Recipe khỏi FavoriteRecipe
exports.removeFavoriteRecipe = async (req, res) => {
  const FavorId = req.params._id;
  try {
      // Xóa nhãn thẻ
      const deletedRep = await FavoriteRecipe.findByIdAndDelete(FavorId);
      if (!deletedRep) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      res.status(200).json({ message: 'Recipe removed from favorites'});
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

//Check trạng thái yêu thích
exports.checkFavoriteRecipe = async (req, res) => {
  const { userId, recipeId } = req.params; 

  try {
    // Tìm công thức trong danh sách yêu thích của người dùng
    const favorite = await FavoriteRecipe.findOne({
      userId: userId,
      recipeId: recipeId
    });

    // Nếu có, trả về trạng thái "favorited"
    if (favorite) {
      return res.status(200).json({ isFavorite: true });
    }

    // Nếu không có, trả về trạng thái "not favorited"
    return res.status(200).json({ isFavorite: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


