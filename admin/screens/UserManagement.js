import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false); 

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:5000/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error(error));
  };

  const addUser = () => {
    axios.post('http://localhost:5000/users', { username, email, password })
      .then(response => {
        console.log('User added', response.data);
        setUsername('');
        setEmail('');
        setPassword('');
        setShowForm(false); // Ẩn form sau khi thêm người dùng
        fetchUsers();
      })
      .catch(error => console.error(error));
  };

  const deleteUser = (userId) => {
    axios.delete(`http://localhost:5000/users/${userId}`)
      .then(response => {
        console.log('User deleted', response.data);
        fetchUsers(); // Cập nhật danh sách sau khi xóa người dùng
      })
      .catch(error => console.error(error));
  };

  const toggleForm = () => {
    setShowForm(!showForm); // Hiển thị/Ẩn form khi nhấn nút
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.username}</Text>
            <Text style={styles.cell}>{item.email}</Text>
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
            <Text style={styles.headerCell}>Action</Text>
          </View>
        )}
      />

      {/* Nút để hiện form */}
      <Button title={showForm ? "Hide Form" : "Add User"} onPress={toggleForm} />

      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Add New User</Text>
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
          <Button title="Submit" onPress={addUser} />
        </View>
      )}
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
});

export default UserManagement;
