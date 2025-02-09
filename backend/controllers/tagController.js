const Tag = require('../models/Tag');
const RecipeTag = require('../models/RecipeTag');
const mongoose = require('mongoose');

//Lấy toàn bộ nhãn thẻ
exports.getAllTag = async (req, res) => {
    const tags = await Tag.find();
    res.json(tags);
};

//Lấy nhãn thẻ cho dropdown
exports.getDropdownTag = async (req, res) => {
  try {
    const search = req.query.search || ''; //Tìm kiếm
    // Lấy danh sách nhãn thẻ
    const tags = await Tag.find({ 
      $or: [
        {name: new RegExp(search, 'i')},
        {info: new RegExp(search, 'i')}
      ]
  }).collation({ locale: 'vi', strength: 1 })
  // Trả về danh sách 
  res.status(200).json({
    tags: tags,
  });
} catch (error) {
  res.status(500).json({ message: error.message });
}
};

//Lấy nhãn thẻ cho món ăn
exports.getRecipeTag = async (req, res) => {
  try {
    const recipeId = req.query.recipeId || ''; //Tìm kiếm
    // Kiểm tra xem recipeId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }
    // Lấy danh sách nhãn thẻ
    const tags = await RecipeTag.aggregate([
      {
        $match: { r_id: new mongoose.Types.ObjectId(recipeId) } // Lọc theo recipeId
      },
      {
        $lookup: {
          from: 'tags', // Tên collection Tag trong MongoDB (phải là dạng số nhiều của tên model)
          localField: 't_id',
          foreignField: '_id',
          as: 'tagDetails' // Gán dữ liệu từ Tag vào đây
        }
      },
      {
        $unwind: '$tagDetails' // Trích xuất dữ liệu từ mảng tagDetails
      },
      {
        $project: {
          _id: 1, // _id của RecipeTag
          r_id: 1,
          t_id: 1,
          name: '$tagDetails.name', // Lấy name từ Tag
          info: '$tagDetails.info'  // Lấy info từ Tag
        }
      }
    ]).collation({ locale: 'vi', strength: 1 })
    // Trả về danh sách 
    res.status(200).json({
      tags: tags,
    });
} catch (error) {
  res.status(500).json({ message: error.message });
}
};

// Thêm RecipeTag
exports.addRecipeTag = async (req, res) => {
  try {
      const { r_id, t_id} = req.body;
      // Log kiểm tra dữ liệu
      console.log("Received data:", { r_id, t_id });
      if (!r_id || !t_id) {
        return res.status(400).json({ message: 'Both r_id and t_id are required.' });
      }
      // Kiểm tra xem nhãn thẻ đã tồn tại hay chưa
      const existingTag = await RecipeTag.findOne({ r_id, t_id });
      if (existingTag) {
          return res.status(400).json({ message: 'Recipe already got the tag' });
      }
      const newRecipeTag = new RecipeTag({r_id,t_id});
      const savedTag = await newRecipeTag.save();
      res.status(201).json(savedTag);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

// Xóa RecipeTag
exports.deleteRecipeTag = async (req, res) => {
  const tagId = req.params.id;
  try {
    // Xóa nhãn thẻ
    const deletedTag = await RecipeTag.findByIdAndDelete(tagId);
    if (!deletedTag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    res.json({ message: 'Recipe Tag is deleted succesfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Lấy nhãn thẻ theo trang
exports.getTag = async (req, res) => {
    try {
    const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại
    const limit = parseInt(req.query.limit) || 7; // Số lượng phần tử mỗi trang
    const skip = (page - 1) * limit; // Bỏ qua những phần tử trước đó
    const search = req.query.search || ''; //Tìm kiếm
    // Đếm tổng số nhãn thẻ
    const totalTag = await Tag.countDocuments({ 
      $or: [
        {name: new RegExp(search, 'i')},
        {info: new RegExp(search, 'i')}
      ]
    }).collation({ locale: 'vi', strength: 1 });
    const totalPages = Math.ceil(totalTag / limit);
    // Lấy danh sách nhãn thẻ với phân trang
    const tags = await Tag.find({ 
      $or: [
        {name: new RegExp(search, 'i')},
        {info: new RegExp(search, 'i')}
      ]
    }).collation({ locale: 'vi', strength: 1 })
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

