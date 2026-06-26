import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { forwardRef, useCallback, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { TaskItem } from '@/types/todo';
import Task from './Task';

type PendingTasksProps = {
    close: () => void;
    taskItems: TaskItem[];
}

type Ref = BottomSheet;

const PendingTasks = forwardRef<Ref, PendingTasksProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []

    );

    const pendingTaskItems = props.taskItems.filter((item) => !item.completed);

    return (
        <BottomSheet 
            ref={ref} 
            snapPoints={['75%']} 
            index={-1} 
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            handleIndicatorStyle={{backgroundColor: 'transparent'}}
            backdropComponent={renderBackdrop}>
                <BottomSheetFlatList
                contentInsetAdjustmentBehavior='never'
                data={pendingTaskItems}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <View></View>
                }
                renderItem={({ item }) => (
                    <View>
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
                    <View>
                        <Text>No pending tasks yet!</Text>
                    </View>
                }>

                </BottomSheetFlatList>
        </BottomSheet>
        
        
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f7f4e1',
    },
    wrapper: {
        flex: 1,
        },
    header: {
        paddingHorizontal: 30,
        paddingBottom: 5,
    },
    closeBtn: {
    }
});

export default PendingTasks;