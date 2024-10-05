import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import axios from 'axios';
import { Image } from 'react-native-web';
import { launchImageLibrary } from 'react-native-image-picker';
import firebaseConfig from '../../backend/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const DishManagement = () => {
  const [dishes, setDishes] = useState([]);
  const [name, setName] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [kcal, setKcal] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [nutritions, setNutritions] = useState('');
  const [availableIngredients, setAvailableIngredients] = useState([]); // Dữ liệu nguyên liệu từ kho
  const [selectedIngredients, setSelectedIngredients] = useState([]); // Nguyên liệu đã chọn
  const [ingredientInput, setIngredientInput] = useState(''); // Giá trị trong TextInput
  const [ingredients, setIngredients] = useState([]);
  const [ingredientAmount, setIngredientAmount] = useState('');
  const [steps, setSteps] = useState([]);
  const [currentStepNumber, setCurrentStepNumber] = useState('');
  const [stepName, setStepName] = useState('');
  const [currentStepDescription, setCurrentStepDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDishId, setEditDishId] = useState(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = () => {
    axios.get('http://localhost:5000/dishes/get')
      .then(response => {
        setDishes(response.data);
        setFilteredDishes(response.data);
      })
      .catch(error => console.error(error));
  };

  const handleSearch = () => {
    const filtered = dishes.filter(dish => 
      dish.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDishes(filtered);
  };

  const addDish = () => {
    const newDish = {
      name,
      cook_time: cookTime,
      kcal_quantity: kcal,
      cuisine_type: cuisineType,
      nutritions,
      ingredients,
    };

    axios.post('http://localhost:5000/dishes', newDish)
      .then(response => {
        fetchDishes();
        resetForm();
        setModalVisible(false);
      })
      .catch(error => console.error(error));
  };

  const updateDish = () => {
    const updatedDish = {
      name,
      cook_time: cookTime,
      kcal_quantity: kcal,
      cuisine_type: cuisineType,
      nutritions,
      ingredients,
    };

    axios.put(`http://localhost:5000/dishes/${editDishId}`, updatedDish)
      .then(response => {
        fetchDishes();
        resetForm();
        setModalVisible(false);
      })
      .catch(error => console.error(error));
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

  const handleImageUpload = async () => {
    try {
      const file = await selectImageFromDevice(); // Chọn ảnh từ máy
      const storage = getStorage();
      const storageRef = ref(storage, `images/${file.name}`);
      
      // Chuyển đổi từ base64 (data URL) sang Blob để upload
      const response = await fetch(file.uri);
      const bytes = await response.blob();
  
      uploadBytes(storageRef, bytes).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setImageUrl(url); 
          console.log("Image upload successful",url);
        });
      });
    } catch (error) {
      console.error("Image upload failed: ", error);
    }
  };

  const addStep = () => {
    setSteps([...steps, { 
      step_number: steps.length + 1, 
      step_name: stepName, 
      description: currentStepDescription,
      image_url: imageUrl 
    }]);
    setStepName('');
    setCurrentStepDescription('');
    setImageUrl('');  
  };

  const submitSteps = () => {
    const newSteps = {
      _id: editDishId,
      steps
    };
  
    axios.post('http://localhost:5000/dishes', newSteps)
      .then(response => {
        resetForm();
      })
      .catch(error => console.error(error));
  };

  const resetForm = () => {
    setName('');
    setCookTime('');
    setKcal('');
    setCuisineType('');
    setNutritions('');
    setIngredients([]);
    setSteps([]);
    setIsEditing(false);
    setEditDishId(null);
  };

  const editDish = (dish) => {
    setName(dish.name);
    setCookTime(dish.cook_time);
    setKcal(dish.kcal_quantity.toString());
    setCuisineType(dish.cuisine_type);
    setNutritions(dish.nutritions);
    setIngredients(dish.ingredients);
    setSteps(dish.steps);
    setIsEditing(true);
    setEditDishId(dish._id);
    setModalVisible(true);
  };

  const deleteDish = (dishId) => {
    Alert.alert(
      "Delete Dish",
      "Are you sure you want to delete this dish?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            axios.delete(`http://localhost:5000/dishes/${dishId}`)
              .then(response => {
                fetchDishes();
              })
              .catch(error => console.error(error));
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dish Management</Text>

      <View style={styles.searchRow}>
      <TextInput
      style={[styles.input, styles.searchInput]} 
      placeholder="Search by Name"
      value={searchTerm}
      onChangeText={setSearchTerm}
      />
      <Button title="Search" onPress={handleSearch} />
        <Button title="Add Dish" onPress={() => setModalVisible(true)} />
      </View>

      <FlatList
        data={dishes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.cookTime}>{item.cook_time}</Text>
            <Text style={styles.cuisineType}>{item.cuisine_type}</Text>
            <Text style={styles.kcalQuantity}>{item.kcal_quantity}</Text>
            <Text style={styles.timeAdded}>{item.time_added}</Text>
            <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => editDish(item)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteDish(item._id)}
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
            <Text style={styles.cuisineheaderCell}>Cuisine</Text>
            <Text style={styles.kcalheaderCell}>Kcal</Text>
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
          <Text style={styles.title}>{isEditing ? 'Edit Dish' : 'Add New Dish'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Tên Món Ăn"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Thời Gian Nấu"
            value={cookTime}
            onChangeText={setCookTime}
          />
          <TextInput
            style={styles.input}
            placeholder="Calories (kcal)"
            value={kcal}
            onChangeText={setKcal}
          />
          <TextInput
            style={styles.input}
            placeholder="Loại văn hóa ẩm thực (Á, Âu)"
            value={cuisineType}
            onChangeText={setCuisineType}
          />
          <TextInput
            style={styles.input}
            placeholder="Các chất dinh dưỡng"
            value={nutritions}
            onChangeText={setNutritions}
          />
          <TextInput
            style={styles.input}
            placeholder="Danh sách nguyên liệu (cách nhau bởi dấu phẩy)"
            value={ingredients.join(', ')}
            onChangeText={(text) => setIngredients(text.split(',').map(item => ({ ingredient_id: item.trim(), ingredient_amount: '' })))}
          />

          <Button style={styles.modalButton} title="Manage Steps" color="green" onPress={() => setStepModalVisible(true)} />
          
          <Button style={styles.modalButton} title={isEditing ? 'Update Dish' : 'Submit'} onPress={isEditing ? updateDish : addDish} />
          <Button style={styles.modalButton} title="Cancel" color="red" onPress={resetForm} />
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
            value={currentStepDescription}
            onChangeText={setCurrentStepDescription}
          />
          <Button title="Add Image" onPress={handleImageUpload} />
          <Image src={imageUrl} style={styles.stepImage}></Image>
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
    flex: 1, 
    marginRight: 10, 
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
    height: 44,
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5, 
    paddingLeft: 10,
  },
  cookTime: {
    flex: 1,
    fontSize: 16,
    height: 44,
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5,
    paddingLeft: 10, 
    textAlign: 'center',
  },
  cuisineType: {
    flex: 1,
    fontSize: 16,
    height: 44,
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5,
    paddingLeft: 10, 
    textAlign: 'center',
  },
  kcalQuantity: {
    flex: 1,
    fontSize: 16,
    height: 44,
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5,
    paddingLeft: 10, 
    textAlign: 'center',
  },
  timeAdded: {
    flex: 1,
    fontSize: 16,
    height: 44,
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5,
    paddingLeft: 10, 
    textAlign: 'center',
  },
  actions: {
    width: 200,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 5, 
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
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  cuisineheaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
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
  kcalheaderCell: {
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
  stepImage: {
    width: 300,
    height: 250,
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',  // Đảm bảo modal sẽ phù hợp với màn hình nhỏ hơn
    maxWidth: 600, // Giới hạn chiều rộng modal trên màn hình lớn
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
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

export default DishManagement;
