const MealPlan = require('../models/MealPlan'); // Import model MealPlan
const PlanRecipe = require('../models/PlanRecipe'); // Import model PlanRecipe

// Lấy danh sách các mealplan của user
exports.getUserPlan = async (req, res) => {
  const { userId } = req.params; // Lấy userId từ URL params

  try {
      // Kiểm tra xem người dùng có tồn tại không
      const plans = await MealPlan.find({ u_id: userId });

      // if (!plans || plans.length === 0) {
      //     return res.status(404).json({ message: 'No plans found for this user' });
      // }

      // Trả về danh sách plans
      res.status(200).json({plans});
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Tạo Meal Plan
exports.createMealPlan = async (req, res) => {
    const { u_id, name } = req.body;
    console.log(u_id, name);
    try {
      const mealPlan = new MealPlan({
        u_id,
        name,
      });
  
      const newMealPlan = await mealPlan.save();
      return res.status(201).json({ mealPlan: newMealPlan });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to create meal plan' });
    }
  };

  // Sửa Meal Plan
exports.updateMealPlan = async (req, res) => {
    const { mealPlanId } = req.params;
    const { name, time } = req.body;
  
    try {
      const updatedMealPlan = await MealPlan.findByIdAndUpdate(
        mealPlanId,
        { name, time },
        { new: true }
      );
  
      if (!updatedMealPlan) {
        return res.status(404).json({ message: 'Meal Plan not found' });
      }
  
      return res.status(200).json({ mealPlan: updatedMealPlan });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to update meal plan' });
    }
  };

  // Xóa Meal Plan
exports.deleteMealPlan = async (req, res) => {
    const { mealPlanId } = req.params;

  try {
    // Xóa các công thức trong Meal Plan (xóa từ PlanRecipe)
    await PlanRecipe.deleteMany({ _id: mealPlanId });

    // Xóa Meal Plan
    const deletedMealPlan = await MealPlan.findByIdAndDelete(mealPlanId);

    if (!deletedMealPlan) {
      return res.status(404).json({ message: 'Meal Plan not found' });
    }

    return res.status(200).json({ message: 'Meal Plan and related recipes deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete meal plan and related recipes' });
  }
};

// Thêm Recipe vào Meal Plan
exports.addRecipeToMealPlan = async (req, res) => {
  const { mealPlanId, recipeId } = req.body;

  try {
    const newPlanRecipe = new PlanRecipe({
      _id: mealPlanId,
      r_id: recipeId,
    });

    await newPlanRecipe.save();
    return res.status(201).json({ message: 'Recipe added to meal plan' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to add recipe to meal plan' });
  }
};

// Xóa Recipe khỏi Meal Plan
exports.removeRecipeFromMealPlan = async (req, res) => {
    const { mealPlanId, recipeId } = req.params;
  
    try {
      const deletedRecipe = await PlanRecipe.findOneAndDelete({
        _id: mealPlanId,
        r_id: recipeId,
      });
  
      if (!deletedRecipe) {
        return res.status(404).json({ message: 'Recipe not found in meal plan' });
      }
  
      return res.status(200).json({ message: 'Recipe removed from meal plan' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to remove recipe from meal plan' });
    }
  };
  