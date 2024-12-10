import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import axios from 'axios';
import { Image } from 'react-native-web';
import { launchImageLibrary } from 'react-native-image-picker';
import firebaseConfig from '../../backend/firebaseConfig';
import { MentionsInput, Mention } from 'react-mentions';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Toast from 'react-native-toast-message';

const RecipeManagement = () => {
  const defImage = 'https://firebasestorage.googleapis.com/v0/b/home-cook-54264.appspot.com/o/images%2FNoImage.jpg?alt=media&token=9ba8361b-879d-4ce6-97eb-35f1e1948ecd';
  //Recipe
  const [recipes, setRecipes] = useState([]);
  const [name, setName] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [recipeImageUrl, setRecipeImageUrl] = useState(defImage);
  //Step
  const [stepNumber, setStepNumber] = useState('');
  const [stepName, setStepName] = useState('');
  const [stepDescription, setStepDescription] = useState('');
  const [stepImageUrl, setStepImageUrl] = useState(defImage);
  //Nutrition
  const [nutritions, setNutritions] = useState('');
  //Ingredient
  const [availableIngredients, setAvailableIngredients] = useState([]); // Dữ liệu nguyên liệu từ kho
  const [selectedIngredients, setSelectedIngredients] = useState([]); // Nguyên liệu đã chọn
  const [ingredientInput, setIngredientInput] = useState(''); // Giá trị trong TextInput
  const [ingredients, setIngredients] = useState([]);
  const [ingredientAmount, setIngredientAmount] = useState('');
  //Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDishes, setFilteredDishes] = useState([]);
  //Modal
  const [modalVisible, setModalVisible] = useState(false); //Modal thêm, sửa thông tin Recipe
  const [confirmModal, setConfirmModal] = useState(false); //Modal dùng để xác nhận xóa Recipe
  const [stepModalVisible, setStepModalVisible] = useState(false); //Modal thông tin bước nấu ăn
  const [isEditing, setIsEditing] = useState(false); //Trạng thái modal thông tin Recipe
  const [editRecipeId, setEditRecipeId] = useState(null);
  const [deleteRecipeId, setDeleteRecipeId] = useState(null);

  useEffect(() => {
    fetchRecipes();
    fetchIngredient();
  }, []);

  const fetchIngredient = () => {
    axios.get(`http://localhost:5000/ingredients/getall`)
      .then((response) => {
        setIngredients(response.data.ingredients); 
      })
      .catch((error) => console.error(error));
  };

  const fetchRecipes = () => {
    axios.get('http://localhost:5000/recipes/getall')
      .then(response => {
        setRecipes(response.data);
        setFilteredDishes(response.data);
      })
      .catch(error => console.error(error));
  };

  const handleSearch = () => {
    const filtered = recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDishes(filtered);
  };

  const addRecipe = () => {
    const newDish = {
      name: name,
      cook_time: cookTime,
      image_url: recipeImageUrl,
    };
    axios.post('http://localhost:5000/recipes/create', newDish)
      .then(response => {
        fetchRecipes();
        closeRecipeForm();
      })
      .catch(error => console.error(error));
  };

  const editRecipe = (dish) => {
    setName(dish.name);
    setCookTime(dish.cook_time);
    setRecipeImageUrl(dish.image_url);
    setIsEditing(true);
    setEditRecipeId(dish._id);
    setModalVisible(true);
  };

  const updateRecipe = () => {
    const updatedDish = {
      name: name,
      cook_time: cookTime,
      image_url: recipeImageUrl,
    };

    axios.put(`http://localhost:5000/recipes/update/${editRecipeId}`, updatedDish)
      .then(response => {
        fetchRecipes();
        closeRecipeForm();
      })
      .catch(error => console.error(error));
  };

  const deleteRecipe = (dishId) => {
    setConfirmModal(true);
    setDeleteRecipeId(dishId);
  };

  const handleDelete = () => {
    // Thực hiện yêu cầu xóa
    axios.delete(`http://localhost:5000/recipes/delete/${deleteRecipeId}`)
    .then(response => {
      fetchRecipes();
      setConfirmModal(false);
      setDeleteRecipeId(null);
    })
    .catch(error => console.error(error));
  }

  const closeRecipeForm = () => {
    setModalVisible(false);
    setName('');
    setCookTime('');
    setRecipeImageUrl(defImage);
    setStepImageUrl(defImage);
    setIsEditing(false);
    setEditRecipeId(null);
  };

  const selectImageFromDevice = async () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*'; // Chỉ chấp nhận hình ảnh
  
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
  
          reader.onloadend = () => {
            resolve({
              uri: reader.result, // URI của file dưới dạng base64
              name: file.name, // Tên file
              type: file.type, // Loại file
            });
          };
  
          reader.onerror = (error) => {
            reject("Error reading file: " + error);
          };
  
          reader.readAsDataURL(file); // Đọc file dưới dạng Data URL (base64)
        } else {
          reject('No file selected');
        }
      };
  
      input.click(); // Mở hộp thoại chọn file
    });
  };

  const handleRecipeImageUpload = async () => {
    try {
      const file = await selectImageFromDevice(); // Chọn ảnh từ máy
      const storage = getStorage();
      const storageRef = ref(storage, `images/${file.name}`);
      
      // Chuyển đổi từ base64 (data URL) sang Blob để upload
      const response = await fetch(file.uri);
      const bytes = await response.blob();
  
      uploadBytes(storageRef, bytes).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setRecipeImageUrl(url); 
          console.log("Image upload successful", recipeImageUrl);
        });
      });
    } catch (error) {
      console.error("Image upload failed: ", error);
    }
  };

  const addStep = () => {
    setStepNumner('');
    setStepName('');
    setStepDescription('');
    setRecipeImageUrl('');  
  };

  const submitSteps = () => {
    const newSteps = {
      _id: editRecipeId,
      steps
    };
  
    axios.post('http://localhost:5000/steps', newSteps)
      .then(response => {
        closeRecipeForm();
      })
      .catch(error => console.error(error));
  };

  const getDate = (datetime) => {
    // Tạo đối tượng Date từ chuỗi
    const dateObj = new Date(datetime);

    // Lấy các thành phần ngày, tháng, năm
    const day = String(dateObj.getDate()).padStart(2, '0'); // Đảm bảo 2 chữ số
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = dateObj.getFullYear();

    // Ghép lại theo định dạng dd/mm/yyyy
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dish Management</Text>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, styles.searchInput]} 
          placeholder="Search by Name"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {/* Nút tìm kiếm */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>
        {/* Nút thêm */}
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.searchText}>Add Recipe</Text>
        </TouchableOpacity> 
      </View>
      {/* Danh sách công thức nấu ăn */}
      <FlatList
        data={recipes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.cookTime}>{item.cook_time}</Text>
            <Image source={{ uri: item.image_url }} style={styles.recipeImage} resizeMode='contain'></Image>
            <Text style={styles.timeAdded}>{getDate(item.time_added)}</Text>
            <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => editRecipe(item)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteRecipe(item._id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            </View>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.nameheaderCell}>Name</Text>
            <Text style={styles.cooktimeheaderCell}>Cook Time</Text>
            <Text style={styles.recipeimageheaderCell}>Image</Text>
            <Text style={styles.timeheaderCell}>Time Added</Text>
            <Text style={styles.actionheaderCell}>Actions</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.paginationContainer}>
            <TouchableOpacity style={styles.paginationButton}  >
              <Text style={styles.paginationText}>Previous</Text>
            </TouchableOpacity>
      
            <Text style={styles.paginationText}>Page  of </Text>
  
            <TouchableOpacity style={styles.paginationButton} >
              <Text style={styles.paginationText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Form thêm/chỉnh sửa món ăn */}
      <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Tiêu đề */}
            <Text style={styles.title}>{isEditing ? 'Edit Recipe' : 'Add New Recipe'}</Text>
            <View style={styles.contentColumns}>
              <View style={styles.leftColumn}>
                {/* Hình ảnh công thức nấu ăn */}
                <Image source={{ uri: recipeImageUrl }} style={styles.modalImage} resizeMode='contain'></Image>
                <Button title={isEditing ? 'Edit Image' : 'Add Image'} onPress={handleRecipeImageUpload} />
              </View>
              <View style={styles.rightColumn}>
                {/* Thông tin công thức nấu ăn */}
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Recipe Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    marginRight='10'
                    placeholder="Recipe Name"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Cook Time (Minutes)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Cook Time (Minutes)"
                    value={cookTime}
                    onChangeText={setCookTime}
                  />
                </View>
              </View>
            </View>
          
          {/* Các nút quản lý: Quản lý bước nấu ăn, Quản lý nguyên liệu, Quản lý dinh dưỡng*/}
          {isEditing && (
            <Button
              style={styles.modalButton}
              title="Manage Steps"
              color="green"
              onPress={() => setStepModalVisible(true)}
            />
          )}
          {/* Nút submit thông tin */}
          <Button style={styles.modalButton} title={isEditing ? 'Update Dish' : 'Submit'} onPress={isEditing ? updateRecipe : addRecipe} />
          <Button style={styles.modalButton} title="Cancel" color="red" onPress={() => {closeRecipeForm(); }} />
          </View>
        </View>
      </Modal>

      {/* Modal xác nhận xóa*/}
      <Modal
        visible={confirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setConfirmModal(false)}
      >
        <View style={styles.modalContainer} maxWidth={300}>
          <View style={styles.modalContent} >
            <Text style={styles.title}>Delete Recipe</Text>
            <Text style={styles.modalLabel}>Are you sure you want to delete this recipe?</Text>
            <Button style={styles.modalButton} title="Delete" color="red" onPress={() => handleDelete()} />
            <Button style={styles.modalButton} title="Cancel" color="gray" onPress={() => setConfirmModal(false)} />
          </View>
        </View>
      </Modal>

      {/* Form nhập các bước nấu ăn */}
      <Modal
      visible={stepModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setStepModalVisible(false)}
      >
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add Steps</Text>
          <TextInput
            style={styles.input}
            placeholder="Step Name"
            value={stepName}
            onChangeText={setStepName}
          />
          <TextInput
            style={styles.input}
            placeholder="Step Description"
            value={stepDescription}
            onChangeText={setStepDescription}
          />
          <Button title="Add Step Image" onPress={handleRecipeImageUpload} />
          <Image source={{ uri: recipeImageUrl }} style={styles.recipeImage} resizeMode='contain'></Image>
          <Button title="Add Step" onPress={addStep} />
          <Button title="Close" onPress={() => setStepModalVisible(false)} />
        </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20,
  },
  searchInput: {
    padding: 10,
    height: 40,
    fontSize: 16,
    borderWidth: 1,
    width: '80%',
    maxWidth: 600,
    background: '#f1f1f1',
    marginRight: 10,
  },
  searchText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  searchButton: {
    width: 80,
    height: 40,
    padding: 10,
    borderRadius: 5,
    cursor: 'pointer',
    marginTop: -10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#0099FF',
  },
  addButton: {
    width: 120,
    height: 40,
    padding: 10,
    borderRadius: 5,
    cursor: 'pointer',
    marginTop: -10,
    marginLeft: 10,
    backgroundColor: '#00FF00',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    paddingVertical: 5, // Căn giữa hàng dọc cho nút
    paddingLeft: 10,
    paddingRight: 10,
  },
  name: {
    flex: 1,
    fontSize: 16,
    height: 120,
    borderWidth: 1, 
    borderColor: '#ccc', 
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 40,
  },
  cookTime: {
    flex: 1,
    fontSize: 16,
    maxWidth: 150,
    height: 120,
    borderWidth: 1, 
    borderColor: '#ccc', 
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 40,
  },
  recipeImage: {
    flex: 1,
    width: '100%',
    maxWidth: 375,
    height: 120,
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 40,
  },
  timeAdded: {
    flex: 1,
    fontSize: 16,
    height: 120,
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  actions: {
    width: 200,
    height: 120,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  nameheaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  cooktimeheaderCell: {
    flex: 1,
    fontWeight: 'bold',
    maxWidth: 150,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  recipeimageheaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    maxWidth: 400,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  timeheaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  actionheaderCell: {
    width: 200,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 6,
    marginRight: 10,
    borderRadius: 5,
    alignItems: 'center', // Đảm bảo nút nằm gọn trong cột
  },
  editButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 7,
    borderRadius: 5,
    alignItems: 'center', // Đảm bảo nút nằm gọn trong cột
  },
  deleteButtonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '60%',  // Đảm bảo modal sẽ phù hợp với màn hình nhỏ hơn
    maxWidth: 1280, // Giới hạn chiều rộng modal trên màn hình lớn
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  contentColumns: {
    flexDirection: 'row', // Chia thành 2 cột
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  leftColumn: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    width: '20%',
  },
  rightColumn: {
    flex: 4, 
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  modalLabel: {
    fontWeight: 'bold',
    width: '30%',
    fontSize: 16,
    padding: 10,
    textAlign: 'right',
    margin: 10,
  },
  modalRow: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
  },
  modalInput: {
    width: '70%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    alignContent: 'center',
    margin: 10,
  },
  modalButton: {
    marginVertical: 5, // Tạo khoảng cách giữa các nút
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%', // Để nút có chiều rộng đầy đủ của modal
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  paginationButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  paginationText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RecipeManagement;
