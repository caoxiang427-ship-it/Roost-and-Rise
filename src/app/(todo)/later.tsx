import { ImageBackground, KeyboardAvoidingView, Pressable, Text, View, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { Stack } from 'expo-router';
import { styles } from '../../styles/test_styles';
import Task from '@/components/todo/Task';
import DateCard from '@/components/todo/CalendarDate';
import { TaskItem } from '../../types/todo';
import {  useFonts } from 'expo-font';
import { Ionicons } from "@expo/vector-icons";


export default function TodoScreen() {
  const [loaded] = useFonts({
    InterRegular: require("../../../assets/fonts/Inter_18pt-Regular.ttf"),
    InterSemiBold: require("../../../assets/fonts/Inter_18pt-SemiBold.ttf"),
    InterBold: require("../../../assets/fonts/Inter_18pt-Bold.ttf")
  });

  return (
    <View>
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
                    onPress={() => console.log("calendar")}>
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
              <Task text={"Finsish implementing app UI"} completed={false}></Task>
              <Task text={"Finsish implementing app UI la la la la la la la la la la la la la la la la la la la la "} completed={false}></Task>
              <Task text={"Implement todo list feature with CRUD operations"} completed={false}></Task>
              <Task text={"Finsish implementing app UI"} completed={false}></Task>
              <Task text={"Finsish implementing app UI"} completed={false}></Task>
              <Task text={"Finsish implementing app UI"} completed={false}></Task>
              <Task text={"Finsish implementing app UI"} completed={false}></Task>
            </View>

          </View>
        
      </ScrollView>

      <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => console.log("add new task")}>
            <Ionicons name="add" size={40} color="#FFF"/>
      </TouchableOpacity>

    </View>
  );
}