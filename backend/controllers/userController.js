const User = require('../models/User');
//Các bảng tham chiếu
const SearchHistory = require('../models/SearchHistory');
const UserIngredient = require('../models/UserIngredient');
const ShoppingList = require('../models/ShoppingList');
const FavoriteRecipe = require('../models/FavoriteRecipe');
const MealPlan = require('../models/MealPlan');

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
  
          // // Kiểm tra role (chỉ cho phép đăng nhập nếu role = 'admin')
          // if (user.role !== 'admin') {
          //     return res.status(403).json({ message: 'You do not have permission to access this : role' + user.role });
          // }
  
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

//Lấy người dùng theo trang
exports.getUser = async (req, res) => {
  try {
  const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại
  const limit = parseInt(req.query.limit) || 7; // Số lượng phần tử mỗi trang
  const skip = (page - 1) * limit; // Bỏ qua những phần tử trước đó
  const search = req.query.search || ''; //Tìm kiếm

  // Đếm tổng số người dùng
  const totalUser = await User.countDocuments({ 
    $or: [
      {username: new RegExp(search, 'i')},
      {email: new RegExp(search, 'i')}
    ]
  }).collation({ locale: 'vi', strength: 1 });
  const totalPages = Math.ceil(totalUser / limit);

  // Lấy danh sách người dùng với phân trang
  const users = await User.find({ 
    $or: [
      {username: new RegExp(search, 'i')},
      {email: new RegExp(search, 'i')}
    ]
  }).collation({ locale: 'vi', strength: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Trả về danh sách và tổng số trang
  res.status(200).json({
    users: users,
    totalPages,
    currentPage: page, //Gửi về trang hiện tại
  });
} catch (error) {
  res.status(500).json({ message: error.message });
}
};
  
  //Tạo user mới
  exports.createUser = async (req, res) => {
    try {
      const { username, password, name, email } = req.body;
  
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
      const finalName = (!name || name === '') ? `User${userCount + 1}` : name;
  
      const newUser = new User({
        username: username,
        password: password,  
        name: finalName,
        email: email, 
        role: 'user',     // Set role; default là user
        token: null,
        time_created: Date.now(),
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
      const userId = req.params._id;
      const deleteuser = await User.findByIdAndDelete(userId);
      if (!deleteuser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Chỉnh sửa thông tin User
  exports.updateUser = async (req, res) => {
    try {
      const { username, password, name, email, role } = req.body;
      const updatedUser = await User.findByIdAndUpdate(
        req.params._id,
        { username, password, name, email, role }, // Cập nhật tất cả các trường
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Thay đổi mật khẩu
  exports.changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user._id; // Lấy user ID từ token hoặc session, đảm bảo rằng người dùng đang đăng nhập
  
      // Tìm user trong cơ sở dữ liệu
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Kiểm tra mật khẩu hiện tại
      if (currentPassword !== user.password) {
        return res.status(401).json({ message: 'Wrong password' });
    }
  
      // Cập nhật mật khẩu
      user.password = newPassword;
      await user.save();
  
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Tìm kiếm User
  exports.searchUser = async (req, res) => {
    try {
      const users = await User.find({ 
        username: new RegExp(req.params.username, 'i') 
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };