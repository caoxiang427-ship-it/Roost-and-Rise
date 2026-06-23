import 'react-native-gesture-handler';
import { Image, ImageBackground, Text, View, TouchableOpacity, Keyboard, ActivityIndicator, FlatList } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { styles } from '../../styles/todo_styles';
import Task from '@/components/todo/Task';
import DateCard from '@/components/todo/CalendarDate';
import { TaskItem, NewSubtaskItem, SubtaskItem } from '../../types/todo';
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Progress from 'react-native-progress';
import AddTask from '@/components/todo/AddTask';
import EditTask from '@/components/todo/EditTask';
import CalendarSheet from '@/components/todo/CalendarSheet';
import { supabase } from '@/lib/supabase';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';


// uhh layout looks weird on android for some reason, fix ltr

export default function TodoScreen() {

  const [userID, setUserID] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [taskItems, setTaskItems] = useState<TaskItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-GB');
  // get today's date, complicated implementation to avoid timezone bugs
  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const renderedTaskItems = taskItems.filter(item => item.scheduledDate === selectedDate);

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
    subtasks: task.subtasks ?? [],
    scheduledDate: task.scheduled_date,
  }));

  setTaskItems(formattedTasks);
  setTasksLoading(false);
  };

  // function to add new task
  const handleAddTask = async (
      text: string,
      dread: boolean,
      complete: boolean,
      difficulty: 'easy' | 'moderate' | 'difficult' | '',
      scheduledDate: string,
      taskDesc = '',
      subtasks: NewSubtaskItem[] = [],
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
          difficulty: difficulty,
          task_desc: taskDesc ?? '',
          scheduled_date: scheduledDate,
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
  
// function to edit task
 const handleEditTask = async (
    id: number,
    text: string,
    dread: boolean,
    complete: boolean,
    difficulty: 'easy' | 'moderate' |'difficult' | '',
    scheduledDate: string,
    taskDesc = '',
    subtasks: SubtaskItem[] = [],
    deletedSubtaskIds: number[] = [],
): Promise<void> => {
    Keyboard.dismiss();

    if (!text.trim()) return;

    const { error } = await supabase
        .from('tasks')
        .update({
            text: text.trim(),
            completed: complete,
            dread: dread,
            difficulty: difficulty,
            task_desc: taskDesc ?? '',
            scheduled_date: scheduledDate,
        })
        .eq('id', id);

    if (error) {
        console.log(error);
        return;
    }

    if (deletedSubtaskIds.length > 0) {
        const { error: deleteError } = await supabase
            .from('subtasks')
            .delete()
            .in('id', deletedSubtaskIds);

        if (deleteError) console.log(deleteError);
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

    if (error) {
      console.log(error);
      return;
    };

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

  // calculate progress percentage
  const calculateProgress = () => {
    if (renderedTaskItems.length === 0) return 0;

    const percentPerTask = 1 / renderedTaskItems.length;

    return renderedTaskItems.reduce((total, task) => {
      let taskProgress = 0;

      // If no subtasks, use task completion
      if (!task.subtasks || task.subtasks.length === 0) {
        taskProgress = task.completed ? 1 : 0;
      } else {
        const completedSubtasks = task.subtasks.filter(
          subtask => subtask.completed
        ).length;

        taskProgress = completedSubtasks / task.subtasks.length;
      }

      return total + taskProgress * percentPerTask;
    }, 0);
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

  if (tasksLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8A33D" />
      </View>
    )
  }

  // to calculate if selected date is past or future -> used to conditonally render bg image
  const dayState = () => {
    if (selectedDate < todayDate) return 'past';
    if (selectedDate === todayDate) return 'today';
    return 'future';
  };

  // function to sync selected dates across calendar in todo_list and calendar in calendarSheet
  const syncSelectedDate = (selected: string) => {
    setSelectedDate(selected);
  };

  return (
    //layout weird on phone, the header part fix it 
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
          
          <FlatList
            style={styles.container}
            contentInsetAdjustmentBehavior='never'
            data={renderedTaskItems}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={
              <>

                <ImageBackground
                  source={
                    dayState() === 'today' 
                    ? require("../../../assets/images/todo_header.png")
                    : dayState() === 'past'
                    ? require("../../../assets/images/todo_header_past.jpg")
                    : require("../../../assets/images/todo_header_future.png")}
                  style={styles.image}>
                  
                  <View style={styles.topDisplay}>
                    <View style={styles.topDisplayLeft}>
                      <Text style={styles.header}>{selectedDate === todayDate ? "Today" : selectedDayName } </Text>
                      <Text style={styles.date}>{formattedSelectedDate} </Text>
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
                            progress={calculateProgress()} width={300} height={15} color='#FFF' unfilledColor='#9D7957' borderColor='#9D7957' borderRadius={10} borderWidth={2}>
                          </Progress.Bar>
                          <Text style={styles.progressPercentTxt}>{Math.round(calculateProgress()*100)}%</Text>
                        </View>
                    </ImageBackground>
                  </View>

                </ImageBackground>

                <CalendarProvider date={selectedDate} onDateChanged={setSelectedDate}>
                  <WeekCalendar
                    firstDay={1}
                    allowShadow={false}
                    style={{ backgroundColor: '#F4E6B0' }}
                    markedDates={{
                      [selectedDate]: { selected: true },
                    }}
                    theme={{
                      calendarBackground: '#F4E6B0',
                      textSectionTitleDisabledColor: '',
                      textSectionTitleColor: '#937254',   // "M T W T F S S" row
                      dayTextColor: '#937254',
                      todayTextColor: '#5E4833',
                      selectedDayBackgroundColor: '#937254',
                      selectedDayTextColor: '#FFF',
                      textDisabledColor: '#D9D9D9',
                      textDayFontFamily: 'InterBold',
                      textDayHeaderFontFamily: 'InterBold',
                      textDayFontSize: 18,
                      textDayHeaderFontSize: 14,
                    }}
                  />
                </CalendarProvider>

                <View style={styles.todoHeader}>
                  <Text style={styles.taskHeader}>Tasks</Text>
                  <TouchableOpacity
                        onPress={() => console.log("filter")}>
                          <Ionicons name="filter" size={25} color="#5E4833"/>
                  </TouchableOpacity>
                </View>
              </>
            }
            renderItem={({ item }) => (
              <View style={styles.todoTasks}>
                <Task 
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
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.noTaskContainer}>
                <Image 
                  source={require("../../../assets/images/egg_icon.png")} 
                  style={{ width: 100, height: 100 }}
                  resizeMode={'center'} />

                <Text style={styles.noTaskTitle}>No tasks yet!</Text>
                <Text style={styles.noTaskSubtitle}> Add new tasks/ choose from pending</Text>
                <TouchableOpacity style={styles.noTaskPendingBtn} onPress={() => console.log('pending tasks')}>
                  <Text style={styles.noTaskPendingTxt}>Pending Tasks</Text>
                  </TouchableOpacity>
              </View>
            }
          />
          
        <TouchableOpacity 
              style={styles.addBtn}
              onPress={openAddTaskSheet}>
              <Ionicons name="add" size={40} color="#FFF"/>
        </TouchableOpacity>

        <AddTask ref={addTaskRef} close={closeAddTaskSheet} onAddTask={handleAddTask} openCalendar={openCalendarSheet} scheduledDate={selectedDate}></AddTask>
        <EditTask ref={editTaskRef} task={selectedTask} onEditTask={handleEditTask} close={closeEditTaskSheet} openCalendar={openCalendarSheet} scheduledDate={selectedDate}></EditTask>
        <CalendarSheet ref={calendarRef} close={closeCalendarSheet} selectedDate={selectedDate} syncSelectedDate={syncSelectedDate}></CalendarSheet>
        

      </View>
    </GestureHandlerRootView>
  );
}