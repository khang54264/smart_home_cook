const User = require('../models/User');

  // Đăng nhập
  exports.login = async (req, res) => {
    const { usernameOrEmail = '', password } = req.body; // Lấy từ query parameters
  
      try {
          // Tìm kiếm người dùng theo `username` hoặc `email`
          const trimuser = usernameOrEmail.trim();
          const user = await User.findOne({
            $or: [
              { username: { $regex: new RegExp(`^${trimuser}$`, 'i') } }, // Tìm kiếm không phân biệt chữ hoa và chữ thường
              { email: { $regex: new RegExp(`^${trimuser}$`, 'i') } },
            ],
          });
  
          if (!user) {
              return res.status(404).json({ message: 'User not found ' + user });
          }
  
          // So sánh mật khẩu với mật khẩu trong database
          if (password !== user.password) {
              return res.status(401).json({ message: 'Invalid password' });
          }
  
          // Kiểm tra role (chỉ cho phép đăng nhập nếu role = 'admin')
          if (user.role !== 'admin') {
              return res.status(403).json({ message: 'You do not have permission to access this : role' + user.role });
          }
  
          // Tạo token
          const token = user.token || 'your-generated-token'; // Thay bằng logic tạo token nếu cần
          user.token = token;
          await user.save();
  
          res.json({
              message: 'Login successful',
              token, // Gửi token để lưu trữ phía client (nếu cần)
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
  };

  //Lấy toàn bộ User
  exports.getAllUser = async (req, res) => {
    const users = await User.find();
    res.json(users);
};
  
  //Tạo user mới
  exports.createUser = async (req, res) => {
    try {
      const { username, password, name, email, role, token } = req.body;
  
      // Kiểm tra xem username đã tồn tại hay chưa
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).json({ message: 'Username already exists' });
      }
  
      // Kiểm tra xem email đã tồn tại hay chưa
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
          return res.status(400).json({ message: 'Email already exists' });
      }
   
      // Lấy tổng số lượng người dùng hiện có
      const userCount = await User.countDocuments();
  
      // Tạo tên cho người dùng mới
      if (req.body.name.trim() === '' || req.body.name === null ) {
        name = `User${userCount + 1}`;  // Tính toán tên mới
      } else {
        name = req.body.name;
      }
  
      const newUser = new User({
        username: req.body.username,
        password: req.body.password,  
        name: name,
        email: req.body.email, 
        role: req.body.role || 'user',     // Set role; default là 1 (user)
        token: req.body.token || null 
      });
  
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Xóa User
  exports.deleteUser = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Chỉnh sửa User
  exports.updateUser = async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params._id, req.body, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Tìm kiếm User
  exports.searchUser = async (req, res) => {
    try {
      const users = await User.find({ username: new RegExp(req.params.username, 'i') });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };