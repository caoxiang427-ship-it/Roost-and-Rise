import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { forwardRef, useCallback, useState, useEffect } from 'react';
import { Ionicons } from "@expo/vector-icons";
import Task from './Task';
import { TaskItem } from '@/types/todo';
import { useTodoStore, groupTaskByDate, formatDate } from '@/store/useTodoStore';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { TextInput } from 'react-native-gesture-handler';


type SearchTasksProps = {
    close: () => void;
    openEditTaskSheet: () => void;
}

type Ref = BottomSheet;

const SearchTasks = forwardRef<Ref, SearchTasksProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []

    );

    const { setSelectedTask, taskItems } = useTodoStore();
    const [search, setSearch] = useState<string | null>(null);
    
    const renderedItems = groupTaskByDate(taskItems);
    const [dict, setDict] = useState<Record<string, TaskItem[]>>(renderedItems);

    const filterTaskItems = (searchInput: string) => {
        const newDict: Record<string, TaskItem[]> = {};
        for (const [date, list] of Object.entries(renderedItems)) {
        const newList = list.filter((val: TaskItem) => 
            val.text.toLocaleLowerCase().indexOf(searchInput.toLocaleLowerCase()) >= 0
        );
        newDict[date] = newList;
        }
        setDict(newDict);
    }

    useEffect(() => {
        if(search !== null) {
        filterTaskItems(search);
        }
    }, [search]);

    return (
        <BottomSheet 
            ref={ref} 
            index={-1} 
            snapPoints={['90%']}
            enablePanDownToClose={true}
            enableDynamicSizing={false}
            backgroundStyle={styles.container}
            handleIndicatorStyle={{backgroundColor: '#5E4833'}}
            backdropComponent={renderBackdrop}>
                <View style={{flex: 1}}>
                    <View style={{backgroundColor: '#FFF', paddingHorizontal: 20}}>
                        <View style={styles.header}>
                            <TouchableOpacity
                            onPress={props.close}>
                                <Ionicons name='close' size={30} color="#937254"/>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.text}>
                            <Text style={styles.title}>Search Tasks</Text>
                            <View style={styles.searchBarContainer}>
                                <View style={styles.searchBar}>
                                    <Ionicons name='search' size={25} color='#5E4833'/>
                                    <TextInput 
                                      placeholder='Type here to search' 
                                      placeholderTextColor='#82786f' 
                                      style={styles.textInput}
                                      onChangeText={(text) => setSearch(text)}></TextInput>
                                </View>
                                <Ionicons name="filter" size={25} color="#5E4833"/>
                            </View>
                        </View>

                        <View style={{borderColor: '#5E4833', borderWidth: 0.5, marginHorizontal: -20, marginBottom: 10}}></View>

                    </View>
                <BottomSheetFlatList
                contentInsetAdjustmentBehavior='never'
                data={Object.keys(dict).filter(date => dict[date].length > 0)}
                contentContainerStyle={styles.innerContainer}
                keyExtractor={(date) => date}
                renderItem={({ item: date }) => (
                    <View>
                        <Text style={styles.date}>{formatDate(date)}</Text>
                        {dict[date].map(task => (
                            <Task 
                              key={task.id}
                              id={task.id}
                              text={task.text}
                              completed={task.completed}
                              dread={task.dread}
                              difficulty={task.difficulty}
                              scheduledDate={task.scheduledDate}
                              taskDesc={task.taskDesc}
                              subtasks={task.subtasks}
                              xpAwarded={task.xpAwarded}
                              onPress={() => {setSelectedTask(task); props.openEditTaskSheet();}}/>
                        ))}
                        <View style={{borderColor: '#5E4833', borderWidth: 0.5, marginHorizontal: -20, marginBottom: 10}}></View>

                    </View>
                )}
                ListEmptyComponent={
                    <Animated.View entering={FadeIn.duration(300).delay(200)} exiting={FadeOut.duration(300)}>
                        <View  style={styles.emptyTaskContainer}>
                            <View style={styles.clipboardContainer}>
                                <Ionicons name="sad-outline" size={50} color='#937254'/>
                            </View>
                            <Text style={{ fontFamily: 'InterSemiBold', fontSize: 20, color: '#937254'}}>
                                {Object.keys(renderedItems).length === 0 ? 'No tasks added yet' : 'Sorry no tasks found'}
                            </Text>
                        </View>
                    </Animated.View>
                }>

                </BottomSheetFlatList>
                </View>
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
        paddingTop: 10,
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
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginTop: 40,
        borderRadius: 20
    },
    clipboardContainer: {
        borderWidth: 3,
        borderColor: '#937254',
        borderRadius: 50,
        paddingVertical: 20,
        paddingHorizontal: 22,
        marginBottom: 20,
    },
    date: {
        fontFamily: 'InterBold',
        fontSize: 20,
        color: '#5E4833',
        paddingBottom: 10,
        paddingLeft: 10,
    },
    searchBarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        backgroundColor: '#dddddd',
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginTop: 10,
        marginRight: 5,
        flex: 1
    },
    textInput: {
        paddingHorizontal: 5,
        fontFamily: "InterSemiBold",
        color: '#5E4833'
    }
});

export default SearchTasks;