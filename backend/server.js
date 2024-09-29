const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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

// POST route to login
app.post('/users', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // Tìm kiếm người dùng theo `username` hoặc `email`
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // So sánh mật khẩu với mật khẩu đã mã hóa trong database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Kiểm tra role (chỉ cho phép đăng nhập nếu role = 0)
    if (user.role !== 0) {
      return res.status(403).json({ message: 'You do not have permission to access this' });
    }

    // Tạo token (có thể dùng JWT cho việc này nếu cần)
    const token = 'your-generated-token'; // Thay bằng logic tạo token nếu cần
    user.token = token;
    await user.save();

    res.json({
      message: 'Login successful',
      token,  // Gửi token để lưu trữ phía client (nếu cần)
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: user.token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, default: 'User' },
  email: { type: String, required: true },
  time_created: { type: Date, default: Date.now },  // Ghi lại ngày tạo tài khoản
  role: { type: Number, default: 1 },  // 0 for admin, 1 for user
  token: { type: String, default: null }  // Token để phân quyền (nếu cần trong tương lai)
});

  const User = mongoose.models.User || mongoose.model('User', userSchema);

// POST route to add new users
app.post('/users/create', async (req, res) => {
  try {
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(req.body.password, 10); 
    // Lấy tổng số lượng người dùng hiện có
    const userCount = await User.countDocuments();

    // Tạo tên cho người dùng mới
    const newName = `User${userCount + 1}`;  // Tính toán tên mới

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,  // Lưu mật khẩu đã mã hóa
      name: newName,
      email: req.body.email, 
      role: req.body.role || 1,     // Set role; default là 1 (user)
      token: req.body.token || null 
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE route to delete a user by ID
app.delete('/users/delete/:_id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT route to update user details by ID
app.put('/users/update/:_id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params._id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route to search users by username
app.get('/users/search/:username', async (req, res) => {
  try {
    const users = await User.find({ username: new RegExp(req.params.username, 'i') });
    res.json(users);
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