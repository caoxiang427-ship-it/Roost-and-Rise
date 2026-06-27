import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { forwardRef, useCallback } from 'react';
import { Ionicons } from "@expo/vector-icons";
import Task from './Task';
import { useTodoStore, usePendingTaskItems } from '@/store/useTodoStore';


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

    return (
        <BottomSheet 
            ref={ref} 
            index={-1} 
            enableDynamicSizing={true}
            maxDynamicContentSize={800} 
            enablePanDownToClose={true}
            handleIndicatorStyle={{backgroundColor: '#5E4833'}}
            backdropComponent={renderBackdrop}>
                <BottomSheetFlatList
                contentInsetAdjustmentBehavior='never'
                data={pastPendingTaskItems}
                contentContainerStyle={styles.container}
                keyExtractor={(item) => item.id.toString()}
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
                            <Text style={styles.subtitle}>Incomplete tasks from <Text style={{textDecorationLine: 'underline'}}>past</Text> days</Text>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <View>
                    <Task
                        id={item.id}
                        text={item.text}
                        completed={item.completed}
                        dread={item.dread}
                        difficulty={item.difficulty}
                        taskDesc={item.taskDesc}
                        subtasks={item.subtasks}
                        onPress={() => {setSelectedTask(item); props.openEditTaskSheet();}}
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
        paddingHorizontal: 20,
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
});

export default PendingTasks;