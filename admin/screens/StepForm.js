import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { MentionsInput, Mention } from 'react-mentions';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Icon from 'react-native-vector-icons/Ionicons';
import firebaseConfig from '../../backend/firebaseConfig';
import axios from 'axios';

const StepForm = ({ visible, onClose, recipeId }) => {
    const [stepNumber, setStepNumber] = useState('');
    const [stepName, setStepName] = useState('');
    const [stepDescription, setStepDescription] = useState('');
    const [stepImageUrl, setStepImageUrl] = useState(null);
    const [steps, setSteps] = useState([]);

    useEffect(() => {
        if (recipeId) {
            fetchSteps();
        }
    }, [recipeId]);

    const fetchSteps = async () => {
        try {
            axios.get(`http://localhost:5000/steps/getstepbyid/${recipeId}/steps`)
            .then(response => {
                setSteps(response.data.steps);
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
                _id: recipeId,
                step_number: stepNumber,
                step_name: stepName,
                description: stepDescription,
                image_url: stepImageUrl,
            };

            axios.post('http://localhost:5000/steps/add', newStep)
            .then(response => {
                console.log('Step added', response.data);
                fetchSteps();
                setStepNumber('');
                setStepName('');
                setStepDescription('');
                setStepImageUrl(null);
            })
            .catch(error => {
                console.error('Error adding step:', error);
                alert('Failed to add step. Please try again.');
            });
        } catch (error) {
            console.error('Error adding step:', error);
        }
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
    
    const handleRecipeImageUpload = async () => {
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

    return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <Text style={styles.title}>Manage Steps</Text>
            {/* Danh sách các bước nấu của công thức */}
            <FlatList
                data={steps}
                keyExtractor={(item) => item.step_number}
                renderItem={({ item }) => (
                    <View style={styles.stepItem}>
                        <Text style={styles.stepTitle}>{item.step_number}</Text>
                        <Text style={styles.stepTitle}>{item.step_name}</Text>
                        <Text style={styles.stepTitle}>{item.description}</Text>
                        <Image source={{ uri: item.image_url }} style={styles.stepImage} resizeMode='contain'></Image>
                    </View>
                )}
            />

            {/* Add new step */}
            <TextInput
                style={styles.input}
                placeholder="Step Name"
                value={stepName}
                onChangeText={setStepName}
            />
            <TextInput
                style={styles.input}
                placeholder="Step Description"
                value={stepDescription}
                onChangeText={setStepDescription}
            />
            <Button title="Add Step Image" onPress={handleRecipeImageUpload} />
            <Image source={{ uri: stepImageUrl }} style={styles.stepImage} />
            <Button title="Add Step" onPress={addStep} />
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
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        maxHeight: '80%',
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
    stepImage: {
        width: 100,
        height: 100,
        marginVertical: 10,
    },
    stepItem: {
        marginBottom: 10,
    },
    stepTitle: {
        fontWeight: 'bold',
    },
    stepImage: {
        width: 50,
        height: 50,
    },
});

export default StepForm;
