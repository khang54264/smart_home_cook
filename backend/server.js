const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const dishRoutes = require('./routes/dish');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/users', userRoutes);
app.use('/dishes', dishRoutes);

const PORT = 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/homecook')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
  });

  const User = mongoose.models.User || mongoose.model('User', userSchema);

// POST route to add new users
app.post('/users', async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password, // Hash the password in a real-world app
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE route to delete a user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

// Sample route
app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});