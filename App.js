import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView } from 'react-native';
import UserManagement from './admin/screens/UserManagement';
import DishManagement from './admin/screens/DishManagement';

export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.panel}>
        <UserManagement />
      </ScrollView>
      <ScrollView style={styles.panel}>
        <DishManagement />
      </ScrollView>
      <StatusBar style="auto" />
    </View>
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
