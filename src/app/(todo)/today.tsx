import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { TextInput, Platform, KeyboardAvoidingView, Pressable, Text, View, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import Task from '@/components/todo/Task';
import { TaskItem, SubtaskItem } from '../../types/todo';
import { supabase } from '@/lib/supabase';
import { styles } from '../../styles/todo_styles';
import { GestureHandlerRootView } from "react-native-gesture-handler";


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
      .select(`
        *,
        subtasks (
          id,
          text,
          completed
        )
      `)
      .eq("user_id", userID)
      .order('created_at', { ascending: false });

    if (error){
      console.log(error);
      return;
    }

    const formattedTasks: TaskItem[] = data.map(task => ({
    id: task.id,
    text: task.text,
    completed: task.completed,
    dread: task.dread,
    difficulty: task.difficulty,
    taskDesc: task.task_desc,
    subtasks: task.subtasks ?? []
  }));

  setTaskItems(formattedTasks);
  };

  const handleAddTask = async (
    text: string,
    dread: boolean,
    taskDesc = '',
    subtasks: SubtaskItem[] = []
   ): Promise<void> => {
    Keyboard.dismiss();
    
    if (!text.trim()) return;

    if (!userID) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userID,
        text: text.trim(),
        completed: false,
        dread: dread,
        difficulty: 'easy',
        task_desc: taskDesc ?? ''
      })
      .select()
      .single();

    if (error) {
      console.log(error);
      return;
    }

    if (subtasks.length > 0) {
      const { error: subtaskError } = await supabase
        .from('subtasks')
        .insert(
          subtasks.map(subtask => ({
            task_id: data.id,
            text: subtask.text,
            completed: subtask.completed,
          }))
        );

      if (subtaskError) {
        console.log(subtaskError);
      }
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
    <GestureHandlerRootView style={{ flex: 1}}>
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
              onPress={() => console.log('add task')}>
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
              //taskItems.map((item) => {
                //return <Task 
                  //        key={item.id}
                    //      completed={item.completed}
                      //    text={item.text}
                          //onDelete={() => deleteTask(item.id)}
                          //onToggle={() => toggleCompletion(item.id, item.completed)}
                        //  />
                          
              //})
            }
        </ScrollView>

      </View>
    </GestureHandlerRootView>
  );
}