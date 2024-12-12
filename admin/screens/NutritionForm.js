import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { MentionsInput, Mention } from 'react-mentions';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Icon from 'react-native-vector-icons/Ionicons';
import firebaseConfig from '../../backend/firebaseConfig';
import axios from 'axios';

const NutritionForm = ({ visible, onClose, recipeId }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState('');
    const [nutritions, setNutritions] = useState([]);
    //Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Số phần tử trên mỗi trang
    const [totalPages, setTotalPages] = useState(1);   
    //
    const [isEditing, setIsEditing] = useState(false); //Trạng thái
    const [editNutritionId, setEditNutritionId] = useState(null);
    const [deleteNutritionId, setDeleteNutritionId] = useState(null);

    useEffect(() => {
        if (recipeId) {
            fetchNutritions(currentPage,recipeId);
        }
    }, [currentPage,recipeId]);

    const fetchNutritions = (currentPage,recipeId) => {
        try {
            axios.get(`http://localhost:5000/nutritions/getnubyid?page=${currentPage}&limit=5&recipeId=${recipeId}`)
            .then(response => {
                setNutritions(response.data.nutritions);
                setTotalPages(response.data.totalPages); 
            })
            .catch(error => console.error(error));
        } catch (error) {
            console.error('Error fetching nutritions:', error);
        }
    };

    const addNutrition = async () => {
        if (!name) {
            alert('Nutrition name is required.');
            return;
        }

        try {
            const newNutri = {
                r_id: recipeId,
                name: name,
                amount: amount,
                unit: unit,
            };

            axios.post('http://localhost:5000/nutritions/add', newNutri)
            .then(response => {
                console.log('Nutrition added', response.data);
                fetchNutritions(currentPage,recipeId);
                setName('');
                setAmount('');
                setUnit('');
            })
            .catch(error => {
                console.error('Error adding nutrition:', error);
                alert('Failed to add nutrition. Please try again.');
            });
        } catch (error) {
            console.error('Error adding nutrition:', error);
        }
    };

    const editNutrition = (nutri) => {
        setName(nutri.name);
        setAmount(nutri.amount);
        setUnit(nutri.unit)
        setIsEditing(true);
        setEditNutritionId(nutri._id);
    };

    const updateNutrition = () => {
        const updatedNutri = {
            r_id: recipeId,
            name: name,
            amount: amount,
            unit: unit,
        };
    
        axios.put(`http://localhost:5000/nutritions/update/${editNutritionId}`, updatedNutri)
            .then(response => {
                fetchNutritions(currentPage,recipeId);
                setName('');
                setAmount('');
                setUnit('');
            })
            .catch(error => {
                console.error('Error updating nutrition:', error);
                alert('Failed to update nutrition. Please try again.');
            });
    };

    const deleteNutrition = (NutriId) => {
        // Thực hiện yêu cầu xóa
        axios.delete(`http://localhost:5000/nutritions/delete/${NutriId}`)
        .then(response => {
            fetchNutritions(currentPage,recipeId);
            setName('');
            setAmount('');
            setUnit('');
            setDeleteNutritionId(null);
    })
    .catch(error => console.error(error));
    };

    const cancelEdit = () => {
        fetchNutritions(currentPage,recipeId);
        setName('');
        setAmount('');
        setUnit('');
        setIsEditing(false);
        setEditNutritionId(null);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage-1);
            fetchNutritions(currentPage, recipeId);
        } else {
            setCurrentPage(1);
            fetchNutritions(currentPage, recipeId);
        }
    };
      
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage+1);
            fetchNutritions(currentPage, recipeId);
        } else {
            setCurrentPage(totalPages);
            fetchNutritions(currentPage, recipeId);
        }
    };

    return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <Text style={styles.title}>MANAGE NUTRITIONS</Text>  
             {/* Validate step */}
            <View style={styles.contentColumns}>
                <View style={styles.leftColumn}>
                    {/* Thông tin dinh dưỡng */}
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Nutrition Name:</Text>
                        <TextInput
                            style={styles.modalInput}
                            marginRight='10'
                            placeholder="Nutrition Name"
                            value={name}
                            onChangeText={setName}/>
                    </View>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Nutrition Amount:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nutrition Amount"
                            value={amount}
                            onChangeText={setAmount}/>
                    </View>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Nutrition Unit:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nutrition Unit"
                            value={unit}
                            onChangeText={setUnit}/>
                    </View>
                </View>
                <View style={styles.rightColumn}>
                    <View style={styles.modalRow}>
                        <Button title={isEditing ? 'Update' : 'Add'} onPress={isEditing ? updateNutrition : addNutrition} />
                        {isEditing && (
                            <Button title={'Cancel'} color={'red'} onPress={cancelEdit} />
                        )}
                    </View>
                </View>
            </View>

            {/* Danh sách các thông tin dinh dưỡng */}
            <FlatList
                data={nutritions}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.amount}>{item.amount}</Text>
                        <Text style={styles.unit}>{item.unit}</Text>                      
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.editButton} onPress={() => editNutrition(item)}>
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteNutrition(item._id)}>
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.nameheaderCell}>Name</Text>
                        <Text style={styles.amountheaderCell}>Amount</Text>
                        <Text style={styles.unitheaderCell}>Unit</Text>
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
                )}/>
            <Button title="Close" onPress={onClose} />
            </View>
        </View>
    </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        height: '90%'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        height: '90%'
    },
    contentColumns: {
        flexDirection: 'row', // Chia thành 2 cột
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    rightColumn: {
        flex: 3, 
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
    },
    leftColumn: {
        flex: 7, 
        alignItems: 'left',
        justifyContent: 'center',
        width: '70%',
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
    modalImage: {
        flex: 1,
        width: '100%',
        maxWidth: 375,
        height: 150,
        alignItems: 'center',
        borderWidth: 1, 
        borderColor: '#ccc', 
        paddingVertical: 40,
    },
    modalLabel: {
        fontWeight: 'bold',
        width: '30%',
        fontSize: 16,
        padding: 10,
        textAlign: 'left',
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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
        height: 50,
        borderWidth: 1, 
        borderColor: '#ccc', 
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingVertical: 15,
    },
    amount: {
        flex: 1,
        fontSize: 16,
        height: 50,
        borderWidth: 1, 
        borderColor: '#ccc', 
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingVertical: 15,
    },
    unit: {
        flex: 1,
        fontSize: 16,
        height: 50,
        borderWidth: 1, 
        borderColor: '#ccc', 
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingVertical: 15,
    },
    actions: {
        width: 200,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1, 
        borderColor: '#ccc', 
        paddingVertical: 25,
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
    amountheaderCell: {
        color: '#ffffff',
        flex: 1,
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        borderWidth: 1, 
        borderColor: '#ccc', 
        paddingVertical: 8,
    },
    unitheaderCell: {
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

export default NutritionForm;
