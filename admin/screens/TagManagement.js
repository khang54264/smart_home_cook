import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons'; 
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity, Modal, ScrollView, Picker } from 'react-native';
import axios from 'axios';

const TagManagement = () => {
  const [tags, setTags] = useState([]);
  const [searchTag, setSearchTag] = useState([]);
  const [name, setName] = useState('');
  const [info, setInfo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTagId, setCurrentTagId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // Số phần tử trên mỗi trang
  const [totalPages, setTotalPages] = useState(1);    

  useEffect(() => {
    fetchTag(currentPage,searchTerm);
  }, [currentPage, searchTerm]);

  const fetchTag = (currentPage, searchTerm) => {
    axios.get(`http://localhost:5000/tags/get?page=${currentPage}&limit=7&search=${searchTerm}`)
      .then((response) => {
        setTags(response.data.tags); 
        setTotalPages(response.data.totalPages); 
      })
      .catch((error) => console.error(error));
  };
  
  const handleSearch = () => {
    setCurrentPage(1);
    fetchTag(1, searchTerm); // Fetch dữ liệu từ đầu khi tìm kiếm
    setCurrentPage(1);
    fetchTag(1, searchTerm); 
  };

  const validateInput = () => {
    if (!name || !info ) {
      alert("Vui lòng nhập đủ thông tin");
      return false;
    }
    return true;
  };

  const addTag = () => {
    if (!validateInput()) return;
    try {
      const newTag = { name, info};
      if (editMode) {
        // chỉnh sửa tag
        axios.put(`http://localhost:5000/tags/update/${currentTagId}`, newTag)
          .then(response => {
            console.log('Tag updated', response.data);
            resetForm();
            fetchTag(currentPage,'');
          })
          .catch(error => {
            console.error('Error updating tag:', error);
            alert('Failed to update tag. Please try again.');
          });
      } else {
        // Thêm tag
        axios.post('http://localhost:5000/tags/add', newTag)
          .then(response => {
            console.log('Tag added', response.data);
            resetForm();
            fetchTag(currentPage,'');
          }) .catch(error => {
            console.error('Error adding tag:', error);
            alert('Failed to add tag. Please try again.');
      }); 
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }};
  

  const deleteTag = (TagId) => {
    axios.delete(`http://localhost:5000/tags/delete/${TagId}`)
      .then(response => {
        console.log('Tag deleted', response.data);
        fetchTag(currentPage,''); // Cập nhật danh sách sau khi xóa nguyên liệu
      })
      .catch(error => console.error(error));
  };

  const editTag = (tag) => {
    setCurrentTagId(tag._id);
    setName(tag.name);
    setInfo(tag.info);
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentTagId(null);
    setName('');
    setInfo('');
    setEditMode(false);
    setShowModal(false);
  };

const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage-1);
      fetchTag(currentPage, searchTerm);
    } else {
      setCurrentPage(1);
      fetchTag(currentPage, searchTerm);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage+1);
      fetchTag(currentPage, searchTerm);
    } else {
      setCurrentPage(totalPages);
      fetchTag(currentPage, searchTerm);
    }
  };


  return (
    <ScrollView style={styles.container}>
    <Text style={styles.title}>Tag Management</Text>

    <View style={styles.searchRow}>
      <TextInput
      style={[styles.input, styles.searchInput]} 
      placeholder="Search by Name"
      value={searchTerm}
      onChangeText={setSearchTerm}
      />
        {/* <Button title="Search" onPress={handleSearch} /> */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.searchText}>Add Tag</Text>
        </TouchableOpacity> 
    </View>

    {/* Tag List */}
    <FlatList
      data={tags}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.namecell}>{item.name}</Text>
          <Text style={styles.infocell}>{item.info}</Text>
          <View style={styles.actionCell}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => editTag(item)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTag(item._id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListHeaderComponent={() => (
        <View style={styles.header}>
          <Text style={styles.nameheaderCell}>Tag Name</Text>
          <Text style={styles.infoheaderCell}>Tag Info</Text>
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

    {/* Modal for Add/Edit Tag Form */}
    <Modal
      visible={showModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{editMode ? 'Edit Tag' : 'Add New Tag'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Tag Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Tag Info"
            value={info}
            onChangeText={setInfo}
          />
          <Button style={styles.modalButton} title={editMode ? 'Update Tag' : 'Submit'} onPress={addTag} />
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
  infocell: {
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
  infoheaderCell: {
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

export default TagManagement;
