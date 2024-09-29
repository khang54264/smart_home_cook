const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

//Khởi tạo ứng dụng
const app = express();

app.use(cors({
  origin: 'http://localhost:3000', //Kết nối tới frontend ở port 3000
  methods: ['GET','POST','PUT','DELETE','OPTIONS'], //Các phương thức HTTP được phép
  credentials: true,
}));
app.options('*',cors());
app.use(bodyParser.json());

//Routes
const userRoutes = require('./routes/user');
const dishRoutes = require('./routes/dish');

app.use('/users', userRoutes);
app.use('/dishes', dishRoutes);

const PORT = 5000;

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