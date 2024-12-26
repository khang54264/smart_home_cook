import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { MentionsInput, Mention } from 'react-mentions';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Icon from 'react-native-vector-icons/Ionicons';
import firebaseConfig from '../../backend/firebaseConfig';
import axios from 'axios';

const IngredientForm = ({ visible, onClose, recipeId }) => {
    const [ingredient, setIngredient] = useState([]);
    const [ingredientInput, setIngredientInput] = useState(''); // Input trong dropdown
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState('');
    const [dropdownIngredients, setDropdownIngredients] = useState([]); // Danh sách nguyên liệu trong dropdown
    const [assignedIngredients, setAssignedIngredients] = useState([]); // Danh sách nguyên liệu đã được gán

    useEffect(() => {
        if (recipeId) {
            fetchIngreList(recipeId);
            fetchDropdownIngre(ingredientInput);
        }
    }, [ingredientInput,recipeId]);

    const fetchIngreList = (recipeId) => {
        try {
            axios.get(`http://localhost:5000/ingredients/getingrelist?recipeId=${recipeId}`)
            .then(response => {
                setAssignedIngredients(response.data.ingredients);
            })
            .catch(error => console.error(error));
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    const fetchDropdownIngre = (search) => {
        try {
            axios.get(`http://localhost:5000/ingredients/getdropdown?search=${search}`)
            .then(response => {
                setDropdownIngredients(response.data.ingredients);
            })
            .catch(error => console.error(error));
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    const selectIngredient = (item) => {
        setIngredient(item);
        setIngredientInput(item.name);
    };

    const addIngredient = () => {
        if (!ingredientInput) {
            alert('A ingredient is required.');
            return;
        }
        try {
            const newIngreList = {
                r_id: recipeId.trim(),
                i_id: ingredient._id.trim(),
                amount: amount.trim(),
                unit: unit.trim(),
            };
            axios.post('http://localhost:5000/ingredients/addingrelist', newIngreList)
            .then(response => {
                console.log('Ingredient added', response.data);
                fetchIngreList(recipeId);
                setIngredientInput('');
                setAmount('');
                setUnit('');
                setIngredient(null);
                fetchDropdownIngre(ingredientInput);
            })
            .catch(error => {
                console.error('Error adding ingredient:', error);
                alert('Failed to add ingredient. Please try again.');
            });
        } catch (error) {
            console.error('Error adding ingredient:', error);
        }
    };

    const removeIngre = (IngreId) => {
        if (!recipeId || !IngreId) {
            alert('Missing recipe ID or ingredient ID.');
            return;
        }
        try {
            axios.delete(`http://localhost:5000/ingredients/delingrelist/${IngreId}`)
                .then(response => {
                    console.log('Ingredient removed:', response.data);
                    fetchIngreList(recipeId); // Cập nhật danh sách ingredients
                })
                .catch(error => {
                    console.error('Error removing Ingredient:', error);
                    alert('Failed to remove Ingredient. Please try again.');
                });
        } catch (error) {
            console.error('Error removing Ingredient:', error);
        }
    };

    return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <Text style={styles.title}>MANAGE INGREDIENTS</Text>  
             {/* Validate ingredient */}
            <View style={styles.contentColumns}>
                <View style={styles.leftColumn}>
                    {/* Ingredients Dropdown */}
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Amount:</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="Amount"/>
                        <Text style={styles.modalLabel}>Unit:</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={unit}
                            onChangeText={setUnit}
                            placeholder="Unit"/>
                    </View>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Find Ingredient:</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={ingredientInput}
                            onChangeText={setIngredientInput}
                            placeholder="Search for ingredient"/>
                        <Button title={'Add'} onPress={() => addIngredient()} />
                    </View>
                    <FlatList
                        data={dropdownIngredients}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.dropdownItem} onPress={() => selectIngredient(item)}>
                                <Text>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.dropdownList}/>
                </View>
                <View style={styles.rightColumn}>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Recipe's Ingredients:</Text>
                    </View>
                    <View style={styles.assignedTagsContainer}>
                        {assignedIngredients.map((ingre) => (
                            <View key={ingre} style={styles.ingreItem}>
                                <Text style={styles.ingreText}>{ingre.name} {ingre.amount} {ingre.unit}</Text>
                                <TouchableOpacity onPress={() => removeIngre(ingre._id)} style={styles.removeButton}>
                                    <Text style={styles.removeButtonText}>X</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
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
        height: '50%'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        height: '50%',
        maxHeight: '80%',
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
    dropdownList: {
        maxHeight: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        marginTop: 4,
        borderRadius: 8,
    },
    dropdownItem: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    assignedTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    ingreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    ingreText: {
        marginRight: 4,
    },
    removeButton: {
        backgroundColor: '#ff6b6b',
        borderRadius: 12,
        paddingHorizontal: 4,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 12,
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
});

export default IngredientForm;
