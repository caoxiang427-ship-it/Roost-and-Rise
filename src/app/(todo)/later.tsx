import 'react-native-gesture-handler';
import { ImageBackground, KeyboardAvoidingView, Pressable, Text, View, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { styles } from '../../styles/test_styles';
import Task from '@/components/todo/Task';
import DateCard from '@/components/todo/CalendarDate';
import { TaskItem, NewSubtaskItem, SubtaskItem } from '../../types/todo';
import {  useFonts } from 'expo-font';
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Progress from 'react-native-progress';
import AddTask from '@/components/todo/AddTask';
import EditTask from '@/components/todo/EditTask';
import CalendarSheet from '@/components/todo/CalendarSheet';
import { supabase } from '@/lib/supabase';


// uhh layout looks weird on android for some reason, fix ltr

export default function TodoScreen() {
  const [loaded] = useFonts({
    InterRegular: require("../../../assets/fonts/Inter_18pt-Regular.ttf"),
    InterSemiBold: require("../../../assets/fonts/Inter_18pt-SemiBold.ttf"),
    InterBold: require("../../../assets/fonts/Inter_18pt-Bold.ttf")
  });

  const [userID, setUserID] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
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

    // function to fetch tasks from database
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
      .order('created_at', { ascending: false })
      .order('id', { referencedTable: 'subtasks', ascending: true });

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

  // function to add new task
  const handleAddTask = async (
      text: string,
      dread: boolean,
      complete: boolean,
      taskDesc = '',
      subtasks: NewSubtaskItem[] = []
     ): Promise<void> => {
      Keyboard.dismiss();
      
      if (!text.trim()) return;
  
      if (!userID) return;
  
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userID,
          text: text.trim(),
          completed: complete,
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
      setTaskItems(prev => [...prev, data])
      fetchTasks();
    }

    // function to delete task
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

  // function to delete subtask
  const deleteSubtask = async (subtaskId: number) => {
    const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

    if (error) {
        console.log(error);
        return;
    }

    fetchTasks();
};
  
// function to edit task
 const handleEditTask = async (
    id: number,
    text: string,
    dread: boolean,
    complete: boolean,
    taskDesc = '',
    subtasks: SubtaskItem[] = []
): Promise<void> => {
    Keyboard.dismiss();

    if (!text.trim()) return;

    const { error } = await supabase
        .from('tasks')
        .update({
            text: text.trim(),
            completed: complete,
            dread: dread,
            task_desc: taskDesc ?? ''
        })
        .eq('id', id);

    if (error) {
        console.log(error);
        return;
    }

    // seperate existing subtasks from new created subtasks
    const existingSubtasks = subtasks.filter(s => s.id < 1e12); // existing supabase ids are small
    const newSubtasks = subtasks.filter(s => s.id >= 1e12); // temp Date.now() ids are large

    // update existing
    if (existingSubtasks.length > 0) {
      for (const subtask of existingSubtasks) {
          const { error: updateError } = await supabase
              .from('subtasks')
              .update({
                  text: subtask.text,
                  completed: subtask.completed,
              })
              .eq('id', subtask.id);

          if (updateError) console.log(updateError);
      }
    }
    // insert new
    if (newSubtasks.length > 0) {
        const { error: insertError } = await supabase
            .from('subtasks')
            .insert(
                newSubtasks.map(subtask => ({
                    task_id: id,
                    text: subtask.text,
                    completed: subtask.completed,
                }))
            );
        if (insertError) console.log(insertError);
    }
        fetchTasks();
};
  
  // function to toggle task completion
  const toggleCompletion = async (
    id: number,
    completed: boolean,
    subtasks: SubtaskItem[],
  ) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        completed: !completed,
      })
      .eq('id', id);

    if (subtasks.length > 0) {
        const { error: subtaskError } = await supabase
            .from('subtasks')
            .update({ completed: !completed })
            .eq('task_id', id);

        if (subtaskError) console.log(subtaskError);
    }

    if (error) {
      console.log(error);
      return;
    };

    fetchTasks();

  };

  // function to toggle dread
  const toggleDread = async (
    id: number,
    dread: boolean
  ) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        dread: !dread,
      })
      .eq('id', id);

    if (error) {
      console.log(error);
      return;
    };

    fetchTasks();

  };
  
  // function to toggle subtask completion
  const toggleSubtaskCompletion = async (
    id: number,
    completed: boolean
  ) => {
    const { error } = await supabase
      .from('subtasks')
      .update({
        completed: !completed,
      })
      .eq('id', id);

    if (error) {
      console.log(error);
      return;
    };

    fetchTasks();

  };


  // bottom sheet references
  const addTaskRef = useRef<BottomSheet>(null);
  const editTaskRef = useRef<BottomSheet>(null);
  const calendarRef = useRef<BottomSheet>(null);
  
    // open/ close functions for bottom sheet
  const openAddTaskSheet = () => addTaskRef.current?.expand();
  const openEditTaskSheet = () => editTaskRef.current?.expand();
  const openCalendarSheet = () => calendarRef.current?.expand();

  const closeAddTaskSheet = () => addTaskRef.current?.close();
  const closeEditTaskSheet = () => editTaskRef.current?.close();
  const closeCalendarSheet = () => calendarRef.current?.close();

  // to hide header when calendar bottom sheet opens
  const navigation = useNavigation();
  const hideNavigationHeader = (index: number) => {
    const isOpen = index >= 0;

    navigation.setOptions({
      headerShown: !isOpen,
    });
  };

  return (
    //layout weird on phone, the header part fix it 
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>

        <ScrollView style={styles.container} contentInsetAdjustmentBehavior="never">
          <Stack.Screen
            options={{
              // make header transparent 
              headerTransparent: true,
              headerStyle: { backgroundColor: 'transparent' },
              headerShadowVisible: false,

              // edit the back button and clear title from top
              headerBackButtonDisplayMode: 'minimal',
              title: "", 
            }}/>

          <ImageBackground
            source={require("../../../assets/images/todo_today.png")}
            style={styles.image}>
            
            <View style={styles.topDisplay}>
              <View style={styles.topDisplayLeft}>
                <Text style={styles.header}>Today </Text>
                <Text style={styles.date}>17/06/2026 </Text>
              </View>

              <View style={styles.topDisplayRight}>
                <View style = {styles.topButtons}>
                  <TouchableOpacity
                    onPress={openCalendarSheet}>
                      <Ionicons name="calendar-outline" size={25} color="#FFF"/>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => console.log("search")}>
                      <Ionicons name="search" size={25} color="#FFF"/>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.pendingTaskBtn}
                  onPress={() => console.log("Pending Tasks")}>
                  <Text style={styles.pendingTaskTxt}>Pending Tasks</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.progressBarWrapper}>
            <ImageBackground 
                source={require("../../../assets/images/progress_bar.png")}
                style={styles.progressBar}
                imageStyle={{resizeMode: 'cover', justifyContent: 'flex-end'}}>
                  <View style={styles.progressBarInner}>
                    <Progress.Bar 
                      progress={0.8} width={300} height={15} color='#FFF' unfilledColor='#9D7957' borderColor='#9D7957' borderRadius={10} borderWidth={2}>
                    </Progress.Bar>
                    <Text style={styles.progressPercentTxt}>80%</Text>
                </View>
              </ImageBackground>
            </View>

          </ImageBackground>

          <ScrollView 
            style={styles.calendarContainer}
            contentContainerStyle={styles.content}
            horizontal
            showsHorizontalScrollIndicator={false}>
              <DateCard day="Mon" date={15} isSelected={false} isToday={false}></DateCard>
              <DateCard day="Tue" date={16} isSelected={false} isToday={false}></DateCard>
              <DateCard day="Wed" date={17} isSelected={false} isToday={false}></DateCard>
              <DateCard day="Thur" date={18} isSelected={true} isToday={true}></DateCard>
              <DateCard day="Fri" date={19} isSelected={false} isToday={false}></DateCard>
              <DateCard day="Sat" date={20} isSelected={false} isToday={false}></DateCard>
              <DateCard day="Sun" date={21} isSelected={false} isToday={false}></DateCard>
          </ScrollView>

          <View style={styles.bottomDisplay}>
            <View style={styles.todoHeader}>
              <Text style={styles.taskHeader}>Tasks</Text>
              <TouchableOpacity
                    onPress={() => console.log("filter")}>
                      <Ionicons name="filter" size={25} color="#5E4833"/>
                  </TouchableOpacity>
            </View>

            <View style={styles.todoTasks}>
              { 
              taskItems.map((item) => {
                return <Task 
                          key={item.id}
                          text={item.text}
                          completed={item.completed}
                          dread={item.dread}
                          difficulty={item.difficulty}
                          taskDesc={item.taskDesc}
                          subtasks={item.subtasks}
                          onPress={() => {setSelectedTask(item); openEditTaskSheet();}}
                          onDelete={() => deleteTask(item.id)}
                          onToggleCompletion={() => toggleCompletion(item.id, item.completed, item.subtasks)}
                          onToggleDread={() => toggleDread(item.id, item.dread)}
                          onToggleSubtaskCompletion={(subtaskId, completed) => toggleSubtaskCompletion(subtaskId, completed)}
                          />
                          
              })
            }
            </View>

          </View>
          
        </ScrollView>

        <TouchableOpacity 
              style={styles.addBtn}
              onPress={openAddTaskSheet}>
              <Ionicons name="add" size={40} color="#FFF"/>
        </TouchableOpacity>

        <AddTask ref={addTaskRef} close={closeAddTaskSheet} onAddTask={handleAddTask} openCalendar={openCalendarSheet}></AddTask>
        <EditTask ref={editTaskRef} task={selectedTask} onEditTask={handleEditTask} onDeleteSubtask={deleteSubtask} close={closeEditTaskSheet} openCalendar={openCalendarSheet}></EditTask>
        <CalendarSheet ref={calendarRef} close={closeCalendarSheet} onChange={hideNavigationHeader}></CalendarSheet>
        

      </View>
    </GestureHandlerRootView>
  );
}