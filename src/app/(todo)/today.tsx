import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { TextInput, Platform, KeyboardAvoidingView, Pressable, StyleSheet, Text, View, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import Task from '@/components/todo/Task';
import { TaskItem } from '../../types/todo';
import { supabase } from '@/lib/supabase';

export default function TodoScreen() {
  const [userID, setUserID] = useState<string | null>(null)
  const [task, setTask] = useState<string>('');
  const [taskItems, setTaskItems] = useState<TaskItem[]>([]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
  if (userID) {
    fetchTasks();
  }
}, [userID]);

  const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserID(user?.id ?? null);
    };

  const fetchTasks = async () => {

    if (!userID) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error){
      console.log(error);
      return;
    }

    setTaskItems(
      data.map(task => ({
        id: task.id,
        text: task.text,
        completed: task.completed
      }))
    );
  };

  const handleAddTask = async (): Promise<void> => {
    Keyboard.dismiss();
    
    if (!task.trim()) return;

    if (!userID) return;

    const { error } = await supabase
      .from('tasks')
      .insert({
        user_id: userID,
        text: task.trim(),
        completed: false,
      });

    if (error) {
      console.log(error);
      return;
    }

    setTask('');
    fetchTasks();
  }

  const toggleCompletion = async (
    id: number,
    completed: boolean
  ) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        completed: !completed,
      })
      .eq('id', id);

    if (error) {
      console.log(error);
      return;
    };

    fetchTasks();

  }

  const deleteTask = async (id: number) => {

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.log(error);
      return;
    }

    fetchTasks();
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
                        key={item.id}
                        completed={item.completed}
                        text={item.text}
                        onDelete={() => deleteTask(item.id)}
                        onToggle={() => toggleCompletion(item.id, item.completed)}/>
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