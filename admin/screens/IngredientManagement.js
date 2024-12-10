import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons'; 
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity, Modal, ScrollView, Picker } from 'react-native';
import axios from 'axios';

const IngredientManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [searchIngredient, setSearchIngredient] = useState([]);
  const [name, setName] = useState('');
  const [carb, setCarb] = useState('');
  const [xo, setXo] = useState('');
  const [fat, setFat] = useState('');
  const [protein, setProtein] = useState('');
  const [kcal, setKcal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentIngreId, setCurrentIngreId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // Số phần tử trên mỗi trang
  const [totalPages, setTotalPages] = useState(1);    

  useEffect(() => {
    fetchIngredient(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchIngredient = (curPage, sTerm) => {
    axios.get(`http://localhost:5000/ingredients/get?page=${curPage}&limit=7&search=${sTerm}`)
      .then((response) => {
        setIngredients(response.data.ingredients); 
        setTotalPages(response.data.totalPages); 
      })
      .catch((error) => console.error(error));
  };
  
  const handleSearch = () => {
    setCurrentPage(1);
    fetchIngredient(1, searchTerm); // Fetch dữ liệu từ đầu khi tìm kiếm
    setCurrentPage(1);
    fetchIngredient(1, searchTerm); 
  };

  const validateInput = () => {
    if (!name || !carb || !xo || !fat || !protein || !kcal) {
      alert("Vui lòng nhập đủ thông tin");
      return false;
    }
    return true;
  };

  const validateIngredient = () => {
    if (!validateInput()) return;
    try {
      const newIngre = { name, carb, xo, fat, protein, kcal};
      if (editMode) {
        // chỉnh sửa ingredient
        axios.put(`http://localhost:5000/ingredients/update/${currentIngreId}`, newIngre)
          .then(response => {
            console.log('Ingredient updated', response.data);
            resetForm();
            fetchIngredient(currentPage,'');
          })
          .catch(error => {
            console.error('Error updating ingredient:', error);
            alert('Failed to update ingredient. Please try again.');
          });
      } else {
        // Thêm ingredient
        axios.post('http://localhost:5000/ingredients/add', newIngre)
          .then(response => {
            console.log('Ingredient added', response.data);
            resetForm();
            fetchIngredient(currentPage,'');
          }) .catch(error => {
            console.error('Error adding ingredient:', error);
            alert('Failed to add ingredient. Please try again.');
      }); 
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }};
  

  const deleteIngredient = (IngreId) => {
    axios.delete(`http://localhost:5000/ingredients/delete/${IngreId}`)
      .then(response => {
        console.log('Ingredient deleted', response.data);
        fetchIngredient(currentPage,''); // Cập nhật danh sách sau khi xóa nguyên liệu
      })
      .catch(error => console.error(error));
  };

  const editIngredient = (ingre) => {
    setCurrentIngreId(ingre._id);
    setName(ingre.name);
    setCarb(ingre.carb);
    setXo(ingre.xo);
    setFat(ingre.fat);
    setProtein(ingre.protein);
    setKcal(ingre.kcal);
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentIngreId(null);
    setName('');
    setCarb('');
    setXo('');
    setFat('');
    setProtein('');
    setKcal('');
    setEditMode(false);
    setShowModal(false);
  };

const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage-1);
      fetchIngredient(currentPage, searchTerm);
    } else {
      setCurrentPage(1);
      fetchIngredient(currentPage, searchTerm);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage+1);
      fetchIngredient(currentPage, searchTerm);
    } else {
      setCurrentPage(totalPages);
      fetchIngredient(currentPage, searchTerm);
    }
  };


  return (
    <ScrollView style={styles.container}>
    <Text style={styles.title}>Ingredient Management</Text>

    <View style={styles.searchRow}>
      <TextInput
      style={[styles.input, styles.searchInput]} 
      placeholder="Search by Name"
      value={searchTerm}
      onChangeText={setSearchTerm}
      />

      {/* <Button title="Search" onPress={handleSearch} /> */}

      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.searchText}>Add Ingredient</Text>
      </TouchableOpacity> 
    </View>

    {/* Ingredient List */}
    <FlatList
      data={ingredients}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.namecell}>{item.name}</Text>
          <Text style={styles.carbcell}>{item.carb}</Text>
          <Text style={styles.xocell}>{item.xo}</Text>
          <Text style={styles.fatcell}>{item.fat}</Text>
          <Text style={styles.proteincell}>{item.protein}</Text>
          <Text style={styles.kcalcell}>{item.kcal}</Text>
          <View style={styles.actionCell}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => editIngredient(item)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteIngredient(item._id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListHeaderComponent={() => (
        <View style={styles.header}>
          <Text style={styles.nameheaderCell}>Thực phẩm (100g)</Text>
          <Text style={styles.carbheaderCell}>Carb (g)</Text>
          <Text style={styles.xoheaderCell}>Xơ (g)</Text>
          <Text style={styles.fatheaderCell}>Fat (g)</Text>
          <Text style={styles.proteinheaderCell}>Protein (g)</Text>
          <Text style={styles.kcalheaderCell}>Calo / Kcal</Text>
          <Text style={styles.actionheaderCell}>Actions</Text>
        </View>
      )}
      ListFooterComponent={() => (
        <View style={styles.paginationContainer}>
          <TouchableOpacity style={styles.paginationButton} onPress={handlePreviousPage} disabled={currentPage === 1}>
            <Text style={styles.paginationText}>Previous</Text>
          </TouchableOpacity>
    
          <Text style={styles.paginationText}>Page {currentPage} of {totalPages}</Text>

          <TouchableOpacity style={styles.paginationButton} onPress={handleNextPage} disabled={currentPage === totalPages}>
            <Text style={styles.paginationText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    />

    {/* Modal for Add/Edit Ingredient Form */}
    <Modal
      visible={showModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{editMode ? 'Edit Ingredient' : 'Add New Ingredient'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Carb (g)"
            value={carb}
            onChangeText={setCarb}
          />
          <TextInput
            style={styles.input}
            placeholder="Xơ (g)"
            value={xo}
            onChangeText={setXo}
          />
          <TextInput
            style={styles.input}
            placeholder="Fat (g)"
            value={fat}
            onChangeText={setFat}
          />
          <TextInput
            style={styles.input}
            placeholder="Protein (g)"
            value={protein}
            onChangeText={setProtein}
          />
          <TextInput
            style={styles.input}
            placeholder="Calo / Kcal"
            value={kcal}
            onChangeText={setKcal}
          />
          <Button style={styles.modalButton} title={editMode ? 'Update Ingredient' : 'Submit'} onPress={validateIngredient} />
          <Button style={styles.modalButton} title="Cancel" color="red" onPress={resetForm} />
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
    width: 200,
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
  namecell: {
    flex: 1,
    fontSize: 16,
    height: 44,
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5, 
    paddingLeft: 10,
  },
  carbcell: {
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
  xocell: {
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
  fatcell: {
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
  proteincell: {
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
  kcalcell: {
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
  actionCell: {
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
    backgroundColor: '#000000',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  nameheaderCell: {
    color: '#ffffff',
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  carbheaderCell: {
    color: '#ffffff',
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  xoheaderCell: {
    color: '#ffffff',
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  fatheaderCell: {
    color: '#ffffff',
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  proteinheaderCell: {
    color: '#ffffff',
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  kcalheaderCell: {
    color: '#ffffff',
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  actionheaderCell: {
    color: '#ffffff',
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

export default IngredientManagement;
