import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { MentionsInput, Mention } from 'react-mentions';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Icon from 'react-native-vector-icons/Ionicons';
import firebaseConfig from '../../backend/firebaseConfig';
import axios from 'axios';

const StepForm = ({ visible, onClose, recipeId }) => {
    const defImage = 'https://firebasestorage.googleapis.com/v0/b/home-cook-54264.appspot.com/o/images%2FNoImage.jpg?alt=media&token=9ba8361b-879d-4ce6-97eb-35f1e1948ecd';
    const [stepNumber, setStepNumber] = useState('');
    const [stepName, setStepName] = useState('');
    const [stepDescription, setStepDescription] = useState('');
    const [stepImageUrl, setStepImageUrl] = useState(defImage);
    const [steps, setSteps] = useState([]);
    //Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(3); // Số phần tử trên mỗi trang
    const [totalPages, setTotalPages] = useState(1);   
    //
    const [isEditing, setIsEditing] = useState(false); //Trạng thái
    const [editStepId, setEditStepId] = useState(null);
    const [deleteStepId, setDeleteStepId] = useState(null);

    useEffect(() => {
        if (recipeId) {
            fetchSteps(currentPage,recipeId);
        }
    }, [currentPage,recipeId]);

    const fetchSteps = (currentPage,recipeId) => {
        try {
            axios.get(`http://localhost:5000/steps/getstepbyid?page=${currentPage}&limit=3&recipeId=${recipeId}`)
            .then(response => {
                setSteps(response.data.steps);
                setTotalPages(response.data.totalPages); 
            })
            .catch(error => console.error(error));
        } catch (error) {
            console.error('Error fetching steps:', error);
        }
    };

    const addStep = async () => {
        if (!stepNumber) {
            alert('Step number is required.');
            return;
        }
        if (!stepName) {
            alert('Step name is required.');
            return;
        }
        if (!stepDescription) {
            alert('Step description is required.');
            return;
        }

        try {
            const newStep = {
                r_id: recipeId,
                step_number: stepNumber,
                step_name: stepName,
                description: stepDescription,
                image_url: stepImageUrl,
            };

            axios.post('http://localhost:5000/steps/add', newStep)
            .then(response => {
                console.log('Step added', response.data);
                fetchSteps(currentPage,recipeId);
                setStepNumber('');
                setStepName('');
                setStepDescription('');
                setStepImageUrl(defImage);
            })
            .catch(error => {
                console.error('Error adding step:', error);
                alert('Failed to add step. Please try again.');
            });
        } catch (error) {
            console.error('Error adding step:', error);
        }
    };

    const editStep = (step) => {
        setStepNumber(step.step_number);
        setStepName(step.step_name);
        setStepDescription(step.description)
        setStepImageUrl(step.image_url);
        setIsEditing(true);
        setEditStepId(step._id);
    };

    const updateStep = () => {
        const updatedStep = {
            r_id: recipeId,
            step_number: stepNumber,
            step_name: stepName,
            description: stepDescription,
            image_url: stepImageUrl,
        };
    
        axios.put(`http://localhost:5000/steps/update/${editStepId}`, updatedStep)
            .then(response => {
                fetchSteps(currentPage,recipeId);
                setStepNumber('');
                setStepName('');
                setStepDescription('');
                setStepImageUrl(defImage);
            })
            .catch(error => {
                console.error('Error updating step:', error);
                alert('Failed to update step. Please try again.');
            });
    };

    const deleteStep = (stepId) => {
        setDeleteStepId(stepId);
        // Thực hiện yêu cầu xóa
        axios.delete(`http://localhost:5000/steps/delete/${stepId}`)
        .then(response => {
            fetchSteps(currentPage,recipeId);
            setStepNumber('');
            setStepName('');
            setStepDescription('');
            setStepImageUrl(defImage);
            setDeleteStepId(null);
    })
    .catch(error => console.error(error));
    };

    const cancelEdit = () => {
        fetchSteps(currentPage,recipeId);
        setStepNumber('');
        setStepName('');
        setStepDescription('');
        setStepImageUrl(defImage);
        setIsEditing(false);
        setEditStepId(null);
    };

    //Xử lý hình ảnh từ máy
    const selectImageFromDevice = async () => {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*'; // Chỉ chấp nhận hình ảnh
      
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
      
                    reader.onloadend = () => {
                        resolve({
                            uri: reader.result, // URI của file dưới dạng base64
                            name: file.name, // Tên file
                            type: file.type, // Loại file
                        });
                    };
      
                    reader.onerror = (error) => {
                        reject("Error reading file: " + error);
                    };
                    reader.readAsDataURL(file); // Đọc file dưới dạng Data URL (base64)
                } else {
                    reject('No file selected');
                }
            };
      
            input.click(); // Mở hộp thoại chọn file
        });
    };
    
    const handleStepImageUpload = async () => {
        try {
            const file = await selectImageFromDevice(); // Chọn ảnh từ máy
            const storage = getStorage();
            const storageRef = ref(storage, `steps/${file.name}`);
          
            // Chuyển đổi từ base64 (data URL) sang Blob để upload
            const response = await fetch(file.uri);
            const bytes = await response.blob();
      
            uploadBytes(storageRef, bytes).then((snapshot) => {
                getDownloadURL(snapshot.ref).then((url) => {
                    setStepImageUrl(url); 
                    console.log("Image upload successful", stepImageUrl);
                });
            });
        } catch (error) {
            console.error("Image upload failed: ", error);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage-1);
            fetchSteps(currentPage, recipeId);
        } else {
            setCurrentPage(1);
            fetchSteps(currentPage, recipeId);
        }
    };
      
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage+1);
            fetchSteps(currentPage, recipeId);
        } else {
            setCurrentPage(totalPages);
            fetchSteps(currentPage, recipeId);
        }
    };

    return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <Text style={styles.title}>MANAGE STEPS</Text>  
             {/* Validate step */}
            <View style={styles.contentColumns}>
                <View style={styles.leftColumn}>
                    {/* Thông tin công thức nấu ăn */}
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Step Number:</Text>
                        <TextInput
                            style={styles.modalInput}
                            marginRight='10'
                            placeholder="Step Number"
                            value={stepNumber}
                            onChangeText={setStepNumber}/>
                        <Text style={styles.modalLabel}>Step Name:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Step Name"
                            value={stepName}
                            onChangeText={setStepName}/>
                    </View>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Description:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Description"
                            value={stepDescription}
                            onChangeText={setStepDescription}
                            multiline={true} // Cho phép nhiều dòng
                            numberOfLines={4}/>
                    </View>
                </View>
                <View style={styles.rightColumn}>
                    {/* Hình ảnh bước nấu ăn */}
                    <Image source={{ uri: stepImageUrl }} style={styles.modalImage} resizeMode='contain'></Image>
                    <Button title={isEditing ? 'Edit Image' : 'Add Image'} onPress={handleStepImageUpload} />
                    <View style={styles.modalRow}>
                        <Button title={isEditing ? 'Update' : 'Add'} onPress={isEditing ? updateStep : addStep} />
                        {isEditing && (
                            <Button title={'Cancel'} color={'red'} onPress={cancelEdit} />
                        )}
                    </View>
                </View>
            </View>

            {/* Danh sách các bước nấu của công thức */}
            <FlatList
                data={steps}
                keyExtractor={(item) => item.step_number}
                renderItem={({ item }) => (
                    <View style={styles.stepRow}>
                        <Text style={styles.stepNumber}>{item.step_number}</Text>
                        <Text style={styles.stepName}>{item.step_name}</Text>
                        <Image source={{ uri: item.image_url }} style={styles.stepImage} resizeMode='contain'></Image>
                        <Text style={styles.description}>{item.description}</Text>                      
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.editButton} onPress={() => editStep(item)}>
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteStep(item._id)}>
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.stepNumberheaderCell}>Step Number</Text>
                        <Text style={styles.stepNameheaderCell}>Step Name</Text>
                        <Text style={styles.stepimageheaderCell}>Image</Text>
                        <Text style={styles.descriptionheaderCell}>Description</Text>
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
    stepRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
        paddingVertical: 5, // Căn giữa hàng dọc cho nút
        paddingLeft: 10,
        paddingRight: 10,
    },
    stepNumber: {
        flex: 1,
        fontSize: 16,
        maxWidth: 120,
        height: 120,
        borderWidth: 1, 
        borderColor: '#ccc', 
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingVertical: 40,
    },
    stepName: {
        flex: 1,
        fontSize: 16,
        height: 120,
        maxWidth: 200,
        borderWidth: 1, 
        borderColor: '#ccc', 
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingVertical: 40,
    },
    stepImage: {
        flex: 1,
        width: '100%',
        maxWidth: 375,
        height: 120,
        alignItems: 'center',
        borderWidth: 1, 
        borderColor: '#ccc', 
        paddingVertical: 40,
    },
    description: {
        flex: 1,
        fontSize: 16,
        height: 120,
        borderWidth: 1, 
        borderColor: '#ccc', 
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingVertical: 40,
    },
    actions: {
        width: 200,
        height: 120,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1, 
        borderColor: '#ccc', 
        paddingVertical: 40,
    },
    header: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#000000',
        borderBottomWidth: 2,
        borderBottomColor: '#ddd',
        alignItems: 'center',
    },
    stepNumberheaderCell: {
        color: '#ffffff',
        flex: 1,
        maxWidth: 120,
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        borderWidth: 1, 
        borderColor: '#ccc', 
        paddingVertical: 8,
    },
    stepNameheaderCell: {
        color: '#ffffff',
        flex: 1,
        maxWidth: 200,
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        borderWidth: 1, 
        borderColor: '#ccc', 
        paddingVertical: 8,
    },
    stepimageheaderCell: {
        color: '#ffffff',
        flex: 1,
        fontWeight: 'bold',
        fontSize: 16,
        maxWidth: 375,
        textAlign: 'center',
        borderWidth: 1, 
        borderColor: '#ccc', 
        paddingVertical: 8,
    },
    descriptionheaderCell: {
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

export default StepForm;
