import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Task from '@/components/todo/Task';

export default function TodoScreen() {
  return (
    <View style={styles.container}>

      <View style={styles.taskWrapper}>
        <Text style={styles.title}>Today's tasks</Text>
        <Text style={styles.subtitle}>Plan your schedule for today here!</Text>

        <View style={styles.items}>
          <Task text={"Task 1"}/>
          <Task text={"Task 2"}/>
        </View>
      </View>

      <Link href="/(todo)/later" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Backlog To-do List</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  taskWrapper: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  items: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
  },
  button: {
    marginHorizontal: 20,
    width: 180,
    height: 50,
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: '#E8A33D'
  },
  buttonText: { 
    fontSize: 16,
    fontWeight: '600', 
    color: '#fff' 
  },
});