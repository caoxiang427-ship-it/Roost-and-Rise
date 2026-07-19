import 'react-native-gesture-handler';
import { Image, ImageBackground, Text, View, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useEffect, useRef } from 'react';
import { styles } from '../../styles/todo_styles';
import Task from '@/components/todo/Task';
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from '@gorhom/bottom-sheet';
import * as Progress from 'react-native-progress';
import AddTask from '@/components/todo/AddTask';
import EditTask from '@/components/todo/EditTask';
import CalendarSheet from '@/components/todo/CalendarSheet';
import SearchTasks from '@/components/todo/SearchTasks';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import ShowReward from '@/components/ShowReward';
import CalendarDay from '@/components/todo/CalendarDay';
import { useTodoStore, useRenderedTaskItems, calculateProgress } from '@/store/useTodoStore';
import PendingTasks from '@/components/todo/PendingTasks';
import { useState } from 'react';

// uhh layout looks weird on android for some reason, fix ltr

export default function TodoScreen() {

  const {
    tasksLoading,
    selectedDate,
    selectedTask,
    init,
    setSelectedDate,
    setSelectedTask,
  } = useTodoStore();

  const [showReward, setShowReward] = useState(false);
  const [rewardXP, setRewardXP] = useState(0);
  // after toggle completion, xp will decrease, this is so the "showReward" component can reflect the -XP
  const [decreaseXp, setDecreaseXp] = useState(false);

  const triggerReward = (amount: number, decrease?: boolean) => {
    if (amount <= 0) return;
    setDecreaseXp(!!decrease);
    setRewardXP(amount);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  const renderedTaskItems = useRenderedTaskItems();
  const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-GB');
  // get today's date, complicated implementation to avoid timezone bugs
  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    init();
  }, []);

  // bottom sheet references
  const addTaskRef = useRef<BottomSheet>(null);
  const editTaskRef = useRef<BottomSheet>(null);
  const calendarRef = useRef<BottomSheet>(null);
  const pendingTasksRef = useRef<BottomSheet>(null);
  const searchTasksRef = useRef<BottomSheet>(null);
  
    // open/ close functions for bottom sheet
  const openAddTaskSheet = () => addTaskRef.current?.expand();
  const openEditTaskSheet = () => editTaskRef.current?.expand();
  const openCalendarSheet = () => calendarRef.current?.expand();
  const openPendingTasksSheet = () => pendingTasksRef.current?.expand();
  const openSearchTasksSheet = () => searchTasksRef.current?.expand();

  const closeAddTaskSheet = () => addTaskRef.current?.close();
  const closeEditTaskSheet = () => editTaskRef.current?.close();
  const closeCalendarSheet = () => calendarRef.current?.close();
  const closePendingTasksSheet = () => pendingTasksRef.current?.close();
  const closeSearchTasksSheet = () => searchTasksRef.current?.close();

  if (tasksLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E90A1" />
      </View>
    )
  }

  // to calculate if selected date is past or future -> used to conditonally render bg image
  const dayState = () => {
    if (selectedDate < todayDate) return 'past';
    if (selectedDate === todayDate) return 'today';
    return 'future';
  };

  return (
    //layout weird on android phone, the header part fix it ltr
    <View style={{ flex: 1 }}>
        
        <FlatList
          style={styles.container}
          contentInsetAdjustmentBehavior='never'
          data={renderedTaskItems}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <>
              <Animated.View key={dayState()} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
                <ImageBackground
                  source={
                  dayState() === 'today' 
                  ? require("../../../assets/images/todo/todo_header.png")
                  : dayState() === 'past'
                  ? require("../../../assets/images/todo/todo_header_past.jpg")
                  : require("../../../assets/images/todo/todo_header_future.png")}
                  style={styles.image}>
                
                <View style={styles.topDisplay}>
                  <Animated.View key={selectedDayName} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
                      <View style={styles.topDisplayLeft}>
                        <Text style={styles.header}>{selectedDate === todayDate ? "Today" : selectedDayName } </Text>
                        <Text style={styles.date}>{formattedSelectedDate} </Text>
                      </View>
                    </Animated.View>

                    <View style={styles.topDisplayRight}>
                      <View style = {styles.topButtons}>
                        <TouchableOpacity
                          onPress={openCalendarSheet}>
                            <Ionicons name="calendar-outline" size={25} color="#FFF"/>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={openSearchTasksSheet}>
                            <Ionicons name="search" size={25} color="#FFF"/>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.pendingTaskBtn}
                        onPress={openPendingTasksSheet}>
                        <Text style={styles.pendingTaskTxt}>Pending Tasks</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={ { alignSelf: 'flex-end', paddingRight: 20, paddingTop: 10}}>
                    {showReward && <ShowReward xp={rewardXP} decrease={decreaseXp}></ShowReward>}
                  </View>

                  <View style={styles.progressBarWrapper}>
                    <ImageBackground 
                      source={require("../../../assets/images/todo/progress_bar.png")}
                      style={styles.progressBar}
                      imageStyle={{resizeMode: 'cover', justifyContent: 'flex-end'}}>
                        <View style={styles.progressBarInner}>
                          {/* maybe switch this for custom progress bar so it's more adaptable to diff phone dimensions, see index.tsx one*/}
                          <Progress.Bar 
                            progress={calculateProgress(renderedTaskItems)} width={300} height={15} color='#FFF' unfilledColor='#9D7957' borderColor='#9D7957' borderRadius={10} borderWidth={2}>
                          </Progress.Bar>
                          <Text style={styles.progressPercentTxt}>{Math.round(calculateProgress(renderedTaskItems)*100)}%</Text>
                        </View>
                    </ImageBackground>
                  </View>

                </ImageBackground>
              </Animated.View>

              <CalendarProvider date={selectedDate} onDateChanged={setSelectedDate} >
                <WeekCalendar
                  firstDay={1}
                  allowShadow={false}
                  dayComponent={CalendarDay}
                  calendarHeight={50}
                  style={{ backgroundColor: '#f2e7c0', height: 40}}
                  markedDates={{
                    [selectedDate]: { selected: true },
                  }}
                  theme={{
                    calendarBackground: '#F4E6B0',
                    textSectionTitleColor: '#937254',   // "M T W T F S S" row
                    textDayHeaderFontFamily: 'InterBold',
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
                id={item.id}
                text={item.text}
                completed={item.completed}
                dread={item.dread}
                difficulty={item.difficulty}
                xpAwarded={item.xpAwarded}
                scheduledDate={item.scheduledDate}
                onTriggerReward={triggerReward}
                taskDesc={item.taskDesc}
                subtasks={item.subtasks}
                onPress={() => {setSelectedTask(item); openEditTaskSheet();
                }}
                />
            </View>
          )}
          ListEmptyComponent={
            <Animated.View entering={FadeIn.duration(300).delay(200)} exiting={FadeOut.duration(300)}>
              <View style={styles.noTaskContainer}>
                <Image 
                  source={require("../../../assets/images/todo/egg_icon.png")} 
                  style={{ width: 100, height: 100 }}
                  resizeMode={'center'} />

                <Text style={styles.noTaskTitle}>No tasks yet!</Text>
                <Text style={styles.noTaskSubtitle}> Add new tasks/ choose from pending</Text>
                <TouchableOpacity style={styles.noTaskPendingBtn} onPress={openPendingTasksSheet}>
                  <Text style={styles.noTaskPendingTxt}>Pending Tasks</Text>
                  </TouchableOpacity>
              </View>
            </Animated.View>
          }
        />
        
      <TouchableOpacity 
            style={styles.addBtn}
            onPress={openAddTaskSheet}>
            <Ionicons name="add" size={40} color="#FFF"/>
      </TouchableOpacity>

      <SearchTasks ref={searchTasksRef} close={closeSearchTasksSheet} openEditTaskSheet={openEditTaskSheet}></SearchTasks>
      <PendingTasks ref={pendingTasksRef} close={closePendingTasksSheet} openEditTaskSheet={openEditTaskSheet}></PendingTasks>
      <AddTask ref={addTaskRef} close={closeAddTaskSheet} openCalendar={openCalendarSheet}></AddTask>
      <EditTask ref={editTaskRef} task={selectedTask} close={closeEditTaskSheet} openCalendar={openCalendarSheet}></EditTask>
      <CalendarSheet ref={calendarRef} close={closeCalendarSheet}></CalendarSheet>
      

    </View>
  );
}