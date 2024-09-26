import 'react-native-gesture-handler'; 
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import UserManagement from './admin/screens/UserManagement';
import DishManagement from './admin/screens/DishManagement';
import { StatusBar } from 'expo-status-bar';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
    <View style={styles.container}>
      <Drawer.Navigator initialRouteName="UserManagement">
        <Drawer.Screen name="User Management" component={UserManagement} />
        <Drawer.Screen name="Dish Management" component={DishManagement} />
      </Drawer.Navigator>
    </View>
    <StatusBar style="auto" />
  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Display both panels side by side
    backgroundColor: '#fff',
  },
  panel: {
    flex: 1,
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
});
