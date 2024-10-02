import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons'; 
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity, Modal, ScrollView, Picker } from 'react-native';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchusers, setSearchUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:5000/users/getall')
      .then(response => setUsers(response.data))
      .catch(error => console.error(error));
  };

  const searchUsers = () => {
    axios.get('http://localhost:5000/users/search')
      .then(response => setSearchUsers(response.data))
      .catch(error => console.error(error));
  }

  const addUser = () => {
    try {
      const newUser = { username, password, name, email, ...(editMode && { role }) }; // Chỉ thêm role nếu editMode là true
      if (editMode) {
        // chỉnh sửa user
        axios.put(`http://localhost:5000/users/update/${currentUserId}`, newUser)
          .then(response => {
            console.log('User updated', response.data);
            resetForm();
            fetchUsers();
          })
          .catch(error => console.error(error));
      } else {
        // Thêm user
        axios.post('http://localhost:5000/users/create', newUser)
          .then(response => {
            console.log('User added', response.data);
            resetForm();
            fetchUsers();
          })  
      }
    } catch (error) {
      console.error('Error adding user:', error.response.data);
    }};
  

  const deleteUser = (userId) => {
    axios.delete(`http://localhost:5000/users/delete/${userId}`)
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
    setName(user.name);
    setRole(user.role);
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setName('');
    setCurrentUserId(null);
    setEditMode(false);
    setShowPassword(false);
    setShowModal(false);
  };

  const filterUsers = () => {
    if (searchTerm) {
      return users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return users;
  };

  function formatDate(dateString) {
    const date = new Date(dateString); // Chuyển đổi chuỗi thành đối tượng Date
    const day = String(date.getDate()).padStart(2, '0'); // Lấy ngày và định dạng với 2 chữ số
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Lấy tháng (bắt đầu từ 0) và định dạng
    const year = date.getFullYear(); // Lấy năm

    return `${day}/${month}/${year}`; // Trả về định dạng DD/MM/YYYY
  }

  const formattedDate = (date) => {
    return formatDate(date);
  }

  const roleDefine = (role) => {
    if (role == 'user') {
      return 'User';
    } else {
      return 'Admin';
    }
    return 'NaN';
  }

  return (
    <ScrollView style={styles.container}>
    <Text style={styles.title}>User Management</Text>

    <View style={styles.searchRow}>
      <TextInput
      style={[styles.input, styles.searchInput]} 
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
          <Text style={styles.usercell}>{item.username}</Text>
          <Text style={styles.namecell}>{item.name}</Text>
          <Text style={styles.emailcell}>{item.email}</Text>
          <Text style={styles.datecell}>{formattedDate(item.time_created)}</Text>
          <Text style={styles.rolecell}>{roleDefine(item.role)}</Text>
          <View style={styles.actionCell}>
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
        </View>
      )}
      ListHeaderComponent={() => (
        <View style={styles.header}>
          <Text style={styles.userheaderCell}>Username</Text>
          <Text style={styles.nameheaderCell}>Name</Text>
          <Text style={styles.emailheaderCell}>Email</Text>
          <Text style={styles.dateheaderCell}>Time Created</Text>
          <Text style={styles.roleheaderCell}>Role</Text>
          <Text style={styles.actionheaderCell}>Actions</Text>
        </View>
      )}
      ListFooterComponent={() => (
        <View style={styles.paginationContainer}>
          <TouchableOpacity style={styles.paginationButton}  >
            <Text style={styles.paginationText}>Previous</Text>
          </TouchableOpacity>
    
          <Text style={styles.paginationText}>Page of </Text>

          <TouchableOpacity style={styles.paginationButton} >
            <Text style={styles.paginationText}>Next</Text>
          </TouchableOpacity>
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
            editable={!editMode}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword} // Sử dụng trạng thái showPassword để điều chỉnh secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordIcon}>
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color="black"
              />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          {/* Droplist để chọn role cho User (chỉ hiển thị khi editMode = true) */}
          {editMode && (
            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => setRole(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="User" value="user" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          )}
          <Button style={styles.modalButton} title={editMode ? 'Update User' : 'Submit'} onPress={addUser} />
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
    padding: 10,
  },
  usercell: {
    flex: 1,
    fontSize: 16,
    height: 50,
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5, 
    paddingLeft: 10,
  },
  namecell: {
    flex: 1,
    fontSize: 16,
    height: 50,
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5, 
    paddingLeft: 10,
  },
  emailcell: {
    flex: 1,
    fontSize: 16,
    height: 50,
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5,
    paddingLeft: 10, 
  },
  datecell: {
    flex: 1,
    fontSize: 16,
    height: 50,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5, 
  },
  rolecell: {
    width: 120,
    fontSize: 16,
    height: 50,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8, 
    paddingHorizontal: 5, 
  },
  actionCell: {
    width: 300,
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
  userheaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
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
  emailheaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  dateheaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  roleheaderCell: {
    width: 120,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingVertical: 8,
  },
  actionheaderCell: {
    width: 300,
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
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    alignItems: 'center', // Đảm bảo nút nằm gọn trong cột
  },
  editButtonText: {
    color: '#fff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    font: 12,
    height: 40,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center', // Đảm bảo nút nằm gọn trong cột
  },
  deleteButtonText: {
    color: '#fff',
  },
  passContainer: {
    width: '80%',  
    paddingBottom: 20,
  },
  passwordInput: {
    width: '100%', 
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  passwordIcon: {
    position: 'absolute',
    right: 10, 
    top: 8, 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '40%',
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

export default UserManagement;
