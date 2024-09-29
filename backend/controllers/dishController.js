const Dish = require('../models/Dish');

//Lấy toàn bộ công thức nấu ăn

exports.getAllDish = async (req, res) => {
    const dishes = await Dish.find();
    res.json(dishes);
};

  // Thêm công thức nấu ăn
  exports.addDish = async (req, res) => {
    const newDish = new Dish({
      name: req.body.name,
      kcal_quantity: req.body.kcal_quantity,
      protein: req.body.protein,
      fat: req.body.fat,
      carbs: req.body.carbs,
      ingredients: req.body.ingredients,
    });
  
    try {
      const savedDish = await newDish.save();
      res.status(201).json(savedDish);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  // Chỉnh sửa công thức nâu ăn
exports.updateDish = async (req, res) => {
  try {
    const updatedDish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(updatedDish);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET route to search dishes by name
exports.seachDish = async (req, res) => {
  try {
    const dishes = await Dish.find({ name: new RegExp(req.params.name, 'i') });
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
