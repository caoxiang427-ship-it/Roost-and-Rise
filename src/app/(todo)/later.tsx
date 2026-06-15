import { View, Text, StyleSheet } from 'react-native';

export default function TodoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backlog To-Do List</Text>
      {/* Your future list logic will go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});