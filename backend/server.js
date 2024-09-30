const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

//Khởi tạo ứng dụng
const app = express();

const PORT = 5000;

const allowedOrigins = ['http://localhost:3000', 'http://localhost:8081'];

app.use(cors({
  origin: allowedOrigins, //Kết nối tới frontend 
  methods: ['GET','POST','PUT','DELETE','OPTIONS'], //Các phương thức HTTP được phép
  credentials: true,
}));
app.options('*',cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Routes
const userRoutes = require('./routes/user');
const dishRoutes = require('./routes/dish');
const ingredientRoutes = require('./routes/ingredient');

app.use('/users', userRoutes);
app.use('/dishes', dishRoutes);
app.use('/ingredients', ingredientRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/homecook')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample route
app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});