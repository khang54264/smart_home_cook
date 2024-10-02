// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwmmtFHevBzMzxDxcLx9olsODkvvZ-rlE",
  authDomain: "home-cook-54264.firebaseapp.com",
  projectId: "home-cook-54264",
  storageBucket: "home-cook-54264.appspot.com",
  messagingSenderId: "500741096077",
  appId: "1:500741096077:web:1d8d130057d3bf3e97d8c4",
  measurementId: "G-Q55DW85R3G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Khởi tạo Firebase Storageu
const storage = getStorage(app);

export { storage };
