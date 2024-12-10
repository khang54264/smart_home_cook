import React, { useState, useContext } from 'react';
import axios from 'axios';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { UserContext } from '../../UserContext'; // Import UserContext

const Login = ({ navigation }) => {
  const { setUser } = useContext(UserContext); // Lấy hàm setUser từ UserContext
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/users/login', {
          usernameOrEmail: username,
          password: password,
      });

      const data = response.data;
      console.log(data);
      
      if (response.status === 200) {
        // Login thành công khi role là admin (role admin)
        if (data.user.role === 'admin') {
          setUser(data.user); // Lưu thông tin người dùng vào context
          navigation.replace('Drawer'); // Đi tới trang quản lý
        } else {
          Alert.alert('Error', 'Only admins can log in');
        }
      } else {
        Alert.alert('Error', data.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error(error); // Log lỗi để biết vấn đề
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Cook Management</Text>
      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '50%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    maxWidth: 400,
    alignSelf: 'center'
  },
  button: {
    width: '50%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: 'blue',
  },
  loginButtonText: {
    width: '100%',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center'
  },
});

export default Login;
