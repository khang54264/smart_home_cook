const Tag = require('../models/Tag');
//Các bảng tham chiếu
const RecipeTag = require('../models/RecipeTag');

//Lấy toàn bộ nhãn thẻ
exports.getAllTag = async (req, res) => {
    const tags = await Tag.find();
    res.json(tags);
};

//Lấy nhãn thẻ theo trang
exports.getTag = async (req, res) => {
    try {
    const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại
    const limit = parseInt(req.query.limit) || 7; // Số lượng phần tử mỗi trang
    const skip = (page - 1) * limit; // Bỏ qua những phần tử trước đó
    const search = req.query.search || ''; //Tìm kiếm

    // Đếm tổng số nguyên liệu
    const totalTag = await Tag.countDocuments({ 
      name: new RegExp(search, 'i')
    });
    const totalPages = Math.ceil(totalTag / limit);

    // Lấy danh sách nhãn thẻ với phân trang
    const tags = await Tag.find({ 
      name: new RegExp(search, 'i')
    })
      .skip((page - 1) * limit)
      .limit(limit);

    // Trả về danh sách và tổng số trang
    res.status(200).json({
      tags: tags,
      totalPages,
      currentPage: page, //Gửi về trang hiện tại
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm nhãn thẻ
exports.addTag = async (req, res) => {
    try {
        const { name, info} = req.body;
    
        // Kiểm tra xem nguyên liệu đã tồn tại hay chưa
        const existingTag = await Tag.findOne({ name });
        if (existingTag) {
            return res.status(400).json({ message: 'Tag already exists' });
        }
  
        const newTag = new Tag({
          name: name,
          info: info,
        });
    
        const savedTag = await newTag.save();
        res.status(201).json(savedTag);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
};

// Chỉnh sửa thông tin nhãn thẻ
exports.updateTag = async (req, res) => {
    try {
        const {  name, info } = req.body;
      const updatedTag = await Tag.findByIdAndUpdate(
        req.params._id,
        {  name, info }, // Cập nhật tất cả các trường
        { new: true }
      );
      if (!updatedTag) {
        return res.status(404).json({ message: 'Tag not found' });
      }
      res.json(updatedTag);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

// Xóa công nhãn thẻ và các bản ghi liên quan
exports.deleteTag = async (req, res) => {
  const tagId = req.params.id;
  try {
    // Xóa nhãn thẻ
    const deletedTag = await Tag.findByIdAndDelete(tagId);
    if (!deletedTag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Xóa các bản ghi liên quan
    await Promise.all([
        RecipeTag.deleteMany({ t_id: tagId }),
    ]);

    res.json({ message: 'Tag and related records are deleted succesfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tìm nhãn thẻ theo tên
exports.searchTag = async (req, res) => {
  try {
    const searchName = req.params.term || req.query.term; 
    if (!searchName) {
      const tags = await Tag.find();
      res.json(tags);
    }
    const tags = await Tag.find({ name: new RegExp(searchName, 'i') });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

