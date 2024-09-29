const app = require('./App');
const mongoose = require('mongoose');

const PORT = 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/homecook')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Dish Schema
const dishSchema = new mongoose.Schema({
    name: String,
    kcal_quantity: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    ingredients: [String],
  });
  
  const Dish = mongoose.models.Dish || mongoose.model('Dish', dishSchema);
  
  // POST route to add new dishes
  app.post('/dishes', async (req, res) => {
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
  });

  // PUT route to update dish details by ID
app.put('/dishes/:id', async (req, res) => {
  try {
    const updatedDish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(updatedDish);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route to search dishes by name
app.get('/dishes/search/:name', async (req, res) => {
  try {
    const dishes = await Dish.find({ name: new RegExp(req.params.name, 'i') });
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sample route
app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});