import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { TextInput, Platform, KeyboardAvoidingView, Pressable, Text, View, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import Task from '@/components/todo/Task';
import { TaskItem } from '../../types/todo';
import { supabase } from '@/lib/supabase';
import { styles } from '../../styles/todo_styles';

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
          <Text style={styles.buttonText}>test</Text>
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
                        //onDelete={() => deleteTask(item.id)}
                        //onToggle={() => toggleCompletion(item.id, item.completed)}
                        />
            })
          }
      </ScrollView>

    </View>
  );
}