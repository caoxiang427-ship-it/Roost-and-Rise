import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { forwardRef, useCallback } from 'react';
import { Ionicons } from "@expo/vector-icons";
import Task from './Task';
import { useTodoStore, usePendingTaskItems, groupTaskByDate, formatDate } from '@/store/useTodoStore';
import { TaskItem } from '@/types/todo';


type PendingTasksProps = {
    close: () => void;
    openEditTaskSheet: () => void;
}

type Ref = BottomSheet;

const PendingTasks = forwardRef<Ref, PendingTasksProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []

    );

    const { setSelectedTask } = useTodoStore();
    const now = new Date();
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // pending task items from the past
    const pastPendingTaskItems = usePendingTaskItems().filter((item) => item.scheduledDate < todayDate);
    
    const renderedItems = groupTaskByDate(pastPendingTaskItems);

    return (
        <BottomSheet 
            ref={ref} 
            index={-1} 
            snapPoints={['80%']}
            enableDynamicSizing={true}
            maxDynamicContentSize={700} 
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            handleIndicatorStyle={{backgroundColor: '#5E4833'}}
            backdropComponent={renderBackdrop}>
                <BottomSheetFlatList
                contentInsetAdjustmentBehavior='never'
                data={Object.keys(renderedItems)}
                contentContainerStyle={styles.innerContainer}
                keyExtractor={(date) => date}
                ListHeaderComponent={
                    <View>
                        <View style={styles.header}>
                            <TouchableOpacity
                            onPress={props.close}>
                                <Ionicons name='close' size={30} color="#937254"/>
                            </TouchableOpacity>

                            <View style={{flexDirection: 'row'}}>
                                <TouchableOpacity style={[styles.Btn, { backgroundColor: '#BC0000', marginRight: 2.5}]}>
                                    <Text style={styles.btnTxt}>Delete all</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.Btn, { backgroundColor: 'rgb(127, 127, 127)000', marginLeft: 2.5}]}>
                                    <Text style={styles.btnTxt}>Move all</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.text}>
                            <Text style={styles.title}>Pending Tasks</Text>
                            <Text style={styles.subtitle}>Manage your incomplete tasks from <Text style={{textDecorationLine: 'underline'}}>past</Text> days here!</Text>
                        </View>

                        <View style={{borderColor: '#5E4833', borderWidth: 0.5, marginHorizontal: -20, marginBottom: 10}}></View>

                    </View>
                }
                renderItem={({ item: date }) => (
                    <View>
                        <Text style={styles.date}>{formatDate(date)}</Text>
                        {renderedItems[date].map(task => (
                            <Task 
                              key={task.id}
                              id={task.id}
                              text={task.text}
                              completed={task.completed}
                              dread={task.dread}
                              difficulty={task.difficulty}
                              taskDesc={task.taskDesc}
                              subtasks={task.subtasks}
                              xpAwarded={task.xpAwarded}
                              onPress={() => {setSelectedTask(task); props.openEditTaskSheet();}}/>
                        ))}
                        <View style={{borderColor: '#5E4833', borderWidth: 0.5, marginHorizontal: -20, marginBottom: 10}}></View>

                    </View>
                )}
                ListEmptyComponent={
                    <View  style={styles.emptyTaskContainer}>
                        <Text style={{ fontFamily: 'InterSemiBold', fontSize: 20, color: '#937254'}}>No pending tasks yet!</Text>
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
    innerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 90,
        backgroundColor: '#FFF',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    Btn: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnTxt: {
        fontFamily: 'InterBold',
        color: '#FFF',
        fontSize: 12,
    },
    text: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    title: {
        fontFamily: "InterBold",
        fontSize: 25,
        color: "#5E4833"
    },
    subtitle: {
        fontFamily: "InterSemiBold",
        fontSize: 16,
        color: '#937254'
    },
    emptyTaskContainer: {
        justifyContent: 'center',
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#937254',
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginTop: 40,
        borderRadius: 20
    },
    date: {
        fontFamily: 'InterBold',
        fontSize: 20,
        color: '#5E4833',
        paddingBottom: 10,
        paddingLeft: 10,
    },
});

export default PendingTasks;