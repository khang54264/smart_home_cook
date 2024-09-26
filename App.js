import 'react-native-gesture-handler'; 
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import UserManagement from './admin/screens/UserManagement';
import DishManagement from './admin/screens/DishManagement';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Ionicons';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Drawer.Navigator
          initialRouteName="UserManagement"
          screenOptions={{
            drawerStyle: {
              backgroundColor: '#f0f0f0', // Background color of the drawer
              width: 300,
            },
            drawerActiveTintColor: '#e91e63', // Active item color
            drawerInactiveTintColor: '#000', // Inactive item color
            drawerLabelStyle: {
              fontSize: 18, // Font size of labels
            },
          }}
        >
          <Drawer.Screen
            name="User Management"
            component={UserManagement}
            options={{
              drawerIcon: ({ focused, size }) => (
                <Icon name="people" size={size} color={focused ? '#e91e63' : '#000'} />
              ),
            }}
          />
          <Drawer.Screen
            name="Dish Management"
            component={DishManagement}
            options={{
              drawerIcon: ({ focused, size }) => (
                <Icon name="restaurant" size={size} color={focused ? '#e91e63' : '#000'} />
              ),
            }}
          />
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
