import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { MentionsInput, Mention } from 'react-mentions';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Icon from 'react-native-vector-icons/Ionicons';
import firebaseConfig from '../../backend/firebaseConfig';
import axios from 'axios';

const TagForm = ({ visible, onClose, recipeId }) => {
    const [tag, setTag] = useState([]);
    const [tagInput, setTagInput] = useState(''); // Input trong dropdown
    const [dropdownTags, setDropdownTags] = useState([]); // Danh sách tag trong dropdown
    const [assignedTags, setAssignedTags] = useState([]); // Danh sách tag đã được gán

    useEffect(() => {
        if (recipeId) {
            fetchRecipeTag(recipeId);
            fetchDropdownTag(tagInput);
        }
    }, [tagInput,recipeId]);

    const fetchRecipeTag = (recipeId) => {
        try {
            axios.get(`http://localhost:5000/tags/getrecipetag?recipeId=${recipeId}`)
            .then(response => {
                setAssignedTags(response.data.tags);
            })
            .catch(error => console.error(error));
        } catch (error) {
            console.error('Error fetching nutritions:', error);
        }
    };

    const fetchDropdownTag = (search) => {
        try {
            axios.get(`http://localhost:5000/tags/getdropdown?search=${search}`)
            .then(response => {
                setDropdownTags(response.data.tags);
            })
            .catch(error => console.error(error));
        } catch (error) {
            console.error('Error fetching nutritions:', error);
        }
    };

    const selectTag = (item) => {
        setTag(item);
        setTagInput(item.name);
    };

    const addTag = () => {
        if (!tagInput) {
            alert('A tag is required.');
            return;
        }
        try {
            const newRepTag = {
                r_id: recipeId,
                t_id: tag._id
            };
            axios.post('http://localhost:5000/tags/addreptag', newRepTag)
            .then(response => {
                console.log('Tag added', response.data);
                fetchRecipeTag(recipeId);
                setTagInput('');
                setTag(null);
                fetchDropdownTag(tagInput);
            })
            .catch(error => {
                console.error('Error adding step:', error);
                alert('Failed to add step. Please try again.');
            });
        } catch (error) {
            console.error('Error adding step:', error);
        }
    };

    return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <Text style={styles.title}>MANAGE TAGS</Text>  
             {/* Validate step */}
            <View style={styles.contentColumns}>
                <View style={styles.leftColumn}>
                    {/* Tags Dropdown */}
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Find Tag:</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={tagInput}
                            onChangeText={setTagInput}
                            placeholder="Search for tag"/>
                        <Button title={'Add'} onPress={() => addTag()} />
                    </View>
                    <FlatList
                        data={dropdownTags}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.dropdownItem} onPress={() => selectTag(item)}>
                                <Text>{item.name} ({item.info})</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.dropdownList}/>
                </View>
                <View style={styles.rightColumn}>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Recipe's Tag:</Text>
                    </View>
                    <View style={styles.assignedTagsContainer}>
                        {assignedTags.map((tag) => (
                            <View key={tag} style={styles.tagItem}>
                                <Text style={styles.tagText}>{tag}</Text>
                                <TouchableOpacity onPress={() => removeTag(tag)} style={styles.removeButton}>
                                    <Text style={styles.removeButtonText}>x</Text>
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
    tagItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
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

export default TagForm;
