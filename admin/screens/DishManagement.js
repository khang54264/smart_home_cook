import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import axios from 'axios';

const DishManagement = () => {
  const [dishes, setDishes] = useState([]);
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [ingredients, setIngredients] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/dishes')
      .then(response => setDishes(response.data))
      .catch(error => console.error(error));
  }, []);

  const addDish = () => {
    axios.post('http://localhost:5000/dishes', {
      name,
      kcal_quantity: Number(kcal),
      protein: Number(protein),
      fat: Number(fat),
      carbs: Number(carbs),
      ingredients: ingredients.split(',').map(item => item.trim()),
    })
    .then(response => {
      console.log('Dish added', response.data);
      setName('');
      setKcal('');
      setProtein('');
      setFat('');
      setCarbs('');
      setIngredients('');
    })
    .catch(error => console.error(error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dish Management</Text>
      <FlatList
        data={dishes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.kcal_quantity}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerCell}>Dish Name</Text>
            <Text style={styles.headerCell}>Kcal Quantity</Text>
          </View>
        )}
      />
      <View style={styles.container}>
      <Text style={styles.title}>Add New Dish</Text>
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
      <Button title="Add Dish" onPress={addDish} />
    </View>
    </View>
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
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default DishManagement;
