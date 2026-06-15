import { useState } from 'react';
import { Link } from 'expo-router';
import { TextInput, Platform, KeyboardAvoidingView, Pressable, StyleSheet, Text, View, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import Task from '@/components/todo/Task';
import { TaskItem } from '../../types/todo';

export default function TodoScreen() {
  const [task, setTask] = useState<string>('');
  const [taskItems, setTaskItems] = useState<TaskItem[]>([]);

  const handleAddTask = (): void => {
    Keyboard.dismiss();
    
    if (!task.trim()) return;

    setTaskItems(prev => [
      ...prev, 
      {index: Date.now(), text: task.trim(), completed: false}
    ])
    setTask('');
  }

  const toggleCompletion = (index: number) => {
    setTaskItems(prev =>
      prev.map(item => item.index === index ? {...item, completed: !item.completed} : item)
    )
  }

  const deleteTask = (index: number) => {
    setTaskItems(prev =>
      prev.filter(item => item.index != index)
    )
  }

  return (
    <View style={styles.container}>

      <View style={styles.headerWrapper}>

        <View>
          <Text style={styles.title}>Today's tasks</Text>
          <Text style={styles.subtitle}>Plan your schedule for today here!</Text>
        </View>

        <View>
          <Link href="/(todo)/later" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Backlog</Text>
        </Pressable>
      </Link>
        </View>

      </View>

      {/* Create new task */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.createTaskWrapper}>

          <TextInput 
            style={styles.input} 
            placeholder={'Write a Task'}
            value={task} 
            onChangeText={text => setTask(text)}></TextInput>

           <TouchableOpacity
            onPress={() => handleAddTask()}>
            <View style={styles.addTaskBtn}>
              <Text style={styles.addTask}>+</Text>
            </View>
           </TouchableOpacity>

      </KeyboardAvoidingView>

      {/* tasks */}
      <ScrollView 
        style={styles.taskWrapper}
        contentContainerStyle={styles.items}>
          {
            taskItems.map((item) => {
              return <Task 
                        key={item.index}
                        completed={item.completed}
                        text={item.text}
                        onDelete={() => deleteTask(item.index)}
                        onToggle={() => toggleCompletion(item.index)}/>
            })
          }
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  headerWrapper: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: "space-between"
  },
  taskWrapper: {
    paddingHorizontal: 20,
  },
  items: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10
  },
  subtitle: {
    fontSize: 18,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#E8A33D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { 
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff' 
  },
  createTaskWrapper: {
    marginTop: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#434343",
    width: 300,
    height: 45,
    backgroundColor: '#FFF',
  },
  addTaskBtn: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: '#434343',
    borderWidth: 1,
    backgroundColor: "#FFF",
    justifyContent: 'center',
    alignItems: 'center'
  },
  addTask: {
    fontSize: 30,
    color: '#434343',
  },
});