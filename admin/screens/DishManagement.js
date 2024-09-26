import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import axios from 'axios';

const DishManagement = () => {
  const [dishes, setDishes] = useState([]);
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [filteredDishes, setFilteredDishes] = useState([]); // State for filtered dishes
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDishId, setEditDishId] = useState(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = () => {
    axios.get('http://localhost:5000/dishes')
      .then(response => {
        setDishes(response.data);
        setFilteredDishes(response.data); // Initially set filtered dishes to all dishes
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
      kcal_quantity: Number(kcal),
      protein: Number(protein),
      fat: Number(fat),
      carbs: Number(carbs),
      ingredients: ingredients.split(',').map(item => item.trim()),
    };

    if (isEditing && editDishId) {
      // Edit existing dish
      axios.put(`http://localhost:5000/dishes/${editDishId}`, newDish)
        .then(response => {
          console.log('Dish updated', response.data);
          fetchDishes(); // Refresh list
          resetForm();
          setModalVisible(false);
        })
        .catch(error => console.error(error));
    } else {
      // Add new dish
      axios.post('http://localhost:5000/dishes', newDish)
        .then(response => {
          console.log('Dish added', response.data);
          fetchDishes(); // Refresh list
          resetForm();
          setModalVisible(false);
        })
        .catch(error => console.error(error));
    }
  };

  const resetForm = () => {
    setName('');
    setKcal('');
    setProtein('');
    setFat('');
    setCarbs('');
    setIngredients('');
    setIsEditing(false);
    setEditDishId(null);
  };

  const editDish = (dish) => {
    setName(dish.name);
    setKcal(dish.kcal_quantity.toString());
    setProtein(dish.protein.toString());
    setFat(dish.fat.toString());
    setCarbs(dish.carbs.toString());
    setIngredients(dish.ingredients.join(', '));
    setIsEditing(true);
    setEditDishId(dish._id);
    setModalVisible(true);
  };

  const deleteDish = (dishId) => {
    Alert.alert(
      "Delete Dish",
      "Are you sure you want to delete this dish?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            axios.delete(`http://localhost:5000/dishes/${dishId}`)
              .then(response => {
                console.log('Dish deleted', response.data);
                fetchDishes(); // Refresh list
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

      {/* Search Field and Buttons Row */}
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, styles.searchInput]} // Custom style for search input
          placeholder="Search by Dish Name"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Button title="Search" onPress={handleSearch} />
        <Button title="Add Dish" onPress={() => setModalVisible(true)} />
      </View>

      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.kcal_quantity}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => editDish(item)}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteDish(item._id)}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerCell}>Dish Name</Text>
            <Text style={styles.headerCell}>Kcal Quantity</Text>
            <Text style={styles.headerCell}>Actions</Text>
          </View>
        )}
      />

      {/* Modal for Adding/Editing Dish */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Dish' : 'Add New Dish'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Dish Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Kcal Quantity"
              keyboardType="numeric"
              value={kcal}
              onChangeText={setKcal}
            />
            <TextInput
              style={styles.input}
              placeholder="Protein (g)"
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
            />
            <TextInput
              style={styles.input}
              placeholder="Fat (g)"
              keyboardType="numeric"
              value={fat}
              onChangeText={setFat}
            />
            <TextInput
              style={styles.input}
              placeholder="Carbs (g)"
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
            />
            <TextInput
              style={styles.input}
              placeholder="Ingredients (comma-separated)"
              value={ingredients}
              onChangeText={setIngredients}
            />
            <Button title={isEditing ? 'Save Changes' : 'Add Dish'} onPress={addDish} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
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
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Center them vertically
    marginBottom: 20,
  },
  searchInput: {
    flex: 1, // Take up available space
    marginRight: 10, // Add some space between the input and buttons
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default DishManagement;
