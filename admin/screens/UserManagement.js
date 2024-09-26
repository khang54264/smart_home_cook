import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity, Modal, ScrollView } from 'react-native';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:5000/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error(error));
  };

  const addUser = () => {
    const newUser = { username, email, password };

    if (editMode) {
      // Update existing user
      axios.put(`http://localhost:5000/users/${currentUserId}`, newUser)
        .then(response => {
          console.log('User updated', response.data);
          resetForm();
          fetchUsers();
        })
        .catch(error => console.error(error));
    } else {
      // Add new user
      axios.post('http://localhost:5000/users', newUser)
        .then(response => {
          console.log('User added', response.data);
          resetForm();
          fetchUsers();
        })
        .catch(error => console.error(error));
    }
  };

  const deleteUser = (userId) => {
    axios.delete(`http://localhost:5000/users/${userId}`)
      .then(response => {
        console.log('User deleted', response.data);
        fetchUsers(); // Cập nhật danh sách sau khi xóa người dùng
      })
      .catch(error => console.error(error));
  };

  const editUser = (user) => {
    setUsername(user.username);
    setEmail(user.email);
    setPassword(user.password);
    setCurrentUserId(user._id);
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setCurrentUserId(null);
    setEditMode(false);
    setShowModal(false);
  };

  const filterUsers = () => {
    if (searchTerm) {
      return users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return users;
  };

  return (
    <ScrollView style={styles.container}>
    <Text style={styles.title}>User Management</Text>

    <View style={styles.searchRow}>
      <TextInput
      style={[styles.input, styles.searchInput]} // Apply specific styles for the search input
      placeholder="Search by Username"
      value={searchTerm}
      onChangeText={setSearchTerm}
      />
      <Button title="Search" onPress={fetchUsers} />
      <Button title="Add User" onPress={() => setShowModal(true)} />
    </View>

    {/* User List */}
    <FlatList
      data={filterUsers()}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.cell}>{item.username}</Text>
          <Text style={styles.cell}>{item.email}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => editUser(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteUser(item._id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      ListHeaderComponent={() => (
        <View style={styles.header}>
          <Text style={styles.headerCell}>Username</Text>
          <Text style={styles.headerCell}>Email</Text>
          <Text style={styles.headerCell}>Actions</Text>
        </View>
      )}
    />

    {/* Modal for Add/Edit User Form */}
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{editMode ? 'Edit User' : 'Add New User'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title={editMode ? 'Update User' : 'Submit'} onPress={addUser} />
          <Button title="Cancel" color="red" onPress={resetForm} />
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
    flexDirection: 'row', // Align elements in a row
    alignItems: 'center', // Vertically center the items
    marginBottom: 20,
  },
  searchInput: {
    flex: 1, // Occupies the remaining space in the row
    marginRight: 10, // Adds space between the input and the buttons
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
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
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
});

export default UserManagement;
