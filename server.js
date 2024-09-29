const app = require('./App');
const mongoose = require('mongoose');

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