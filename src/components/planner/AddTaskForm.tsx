import 'react-native-gesture-handler';
import { BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch, Keyboard, Platform } from 'react-native';
import { useState, useEffect} from 'react';
import { Ionicons } from "@expo/vector-icons";
import { NewSubtaskItem } from '@/types/todo';
import Subtask from '../todo/Subtask';
import Animated, { SlideInLeft, SlideOutLeft, FadeIn, FadeOut, LinearTransition, Easing } from 'react-native-reanimated';
import { useTodoStore, addMinutes } from '@/store/useTodoStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDatetoString, combineDateAndTime } from '@/store/usePlannerStore';

type AddTaskFormProps = {
    selectedDate: string;
    close: () => void;
    goToEventHour: (startTime: string) => void;
    draggedStartTime?: { dateTime: string; timeZone?: string };
    draggedEndTime?: { dateTime: string; timeZone?: string };
};

const AddTaskForm = (props: AddTaskFormProps) => {
    

    const { handleAddTask } = useTodoStore();

    const [task, setTask] = useState<string>('');
    const [taskDesc, setTaskDesc] = useState<string>('');
    const [dread, setDread] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [newSubtasks, setNewSubtasks] = useState<NewSubtaskItem[]>([]);
    const [subtaskInput, setSubtaskInput] = useState<string>('');
    const [difficulty, setDifficulty] = useState<'easy'|'moderate'|'difficult'|''>('');
    // for expandable difficulty button
    const [expanded, setExpanded] = useState<boolean>(false);
    // for expandable schedule time thing
    const [expandedTime, setExpandedTime] = useState<boolean>(props.draggedStartTime ? true : false);
    const [date, setDate] = useState<string>(props.selectedDate + 'T00:00:00'); // add 'T00:00:00' to prevent timezone discrepancy
    const [startTime, setStartTime] = useState<string | undefined>(props.draggedStartTime?.dateTime);
    const [endTime, setEndTime] = useState<string | undefined>(props.draggedEndTime?.dateTime);

    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const difficultyStyles = {
        easy: { backgroundColor: '#00BC22', borderLeftColor: '#2B7C1E' },
        moderate: { backgroundColor: '#EE8F00', borderLeftColor: '#BB7102' },
        difficult: { backgroundColor: '#BC0000', borderLeftColor: '#810303' },
    };

    const difficultyLabels = {
        easy: 'Easy 😌',
        moderate: 'Moderate 🙂',
        difficult: 'Difficult 😥',
    };

    const renderScheduleTime = () => (
        <Animated.View
          style={{paddingHorizontal: 65, paddingBottom: 10}}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          layout={LinearTransition.duration(500).easing(Easing.inOut(Easing.quad))}
      >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.timeTxt}>Start Time: </Text>

                <DateTimePicker
                    value={new Date(startTime ?? combineDateAndTime(date, new Date().toISOString()))}
                    mode={'time'}
                    is24Hour={true}
                    onValueChange={(event, selectedStart) => selectedStart && setStartTime(selectedStart.toISOString())}
                />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.timeTxt}>End Time:   </Text>

                <DateTimePicker
                    value={new Date(endTime ?? combineDateAndTime(date, new Date().toISOString()))} // if endTime, show endTime, if not defaults to selected date + time currently
                    mode={'time'}
                    is24Hour={true}
                    onValueChange={(event, selectedEnd) => selectedEnd && setEndTime(selectedEnd.toISOString())}
                />
            </View>
        </Animated.View>
    );

    const handleAddSubtask = () => {
        if (!subtaskInput.trim()) return;
        setNewSubtasks(prev => [...prev, { text: subtaskInput.trim(), completed: false }]);
        setSubtaskInput('');
    };

    const removeSubtask = (index: number) => {
        setNewSubtasks(prev => prev.filter((_, i) => i !== index));
    };

    const toggleNewSubtaskCompletion = (index: number) => {
        setNewSubtasks(prev => prev.map((subtask, i) => 
            i === index ? { ...subtask, completed: !subtask.completed } : subtask
        ));
    }

    const handleSubmit = async () => {
        if (task.trim() === '') {
            Alert.alert(
                "Task Required",          
                "Please input your task before submitting.", 
                [{ text: "OK" }]                
            );
            return;
        };

        if (difficulty === '') {
            Alert.alert(
                "Difficulty Required",          
                "Please select a difficulty level before adding the task.", 
                [{ text: "OK" }]                
            );
            return;
        };

        const start = startTime ?? null;
        const end = start ? (endTime ?? addMinutes(start, 30)) : null;

        await handleAddTask(task, dread, isComplete, difficulty, date, taskDesc, newSubtasks, start, end);

        props.close();
        // Reset local state after submit
        setTask('');
        setTaskDesc('');
        setIsComplete(false);
        setDread(false);
        setNewSubtasks([]);
        setSubtaskInput('');
        setExpanded(false);
        setDifficulty('');
        setDate(formatDatetoString(new Date()));
        setStartTime(undefined);
        setEndTime(undefined);
    };
    
    const openDateTimePicker = () => (
        <View style={{alignSelf: 'flex-end', paddingRight: 20}}>
            <DateTimePicker
                value={new Date(date)}
                mode={'date'}
                is24Hour={true}
                onValueChange={(event, selectedDate) => {
                    // if date changes, update startTime and endTime to match
                    if (!selectedDate) return;
                        const newDate = formatDatetoString(selectedDate);
                        setDate(newDate);
                        setStartTime(prev => (prev ? combineDateAndTime(newDate, prev) : prev));
                        setEndTime(prev => (prev ? combineDateAndTime(newDate, prev) : prev));
                }}
            />
        </View>
    )

    useEffect(() => {
            const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
            const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
            const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
            const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    
            return () => {
                showSub.remove();
                hideSub.remove();
            };
        }, []);

    return (
        <View>
            <BottomSheetScrollView style={styles.innerContainer} keyboardShouldPersistTaps='handled'>
                <View style={styles.header}>
                    <View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between'}}>
                        <Text style={styles.titleTxt}> Add New Task:</Text>
                        <TouchableOpacity
                            style={styles.addTaskBtn}
                            onPress={handleSubmit}>
                                <Text style={styles.addTaskTxt}>Add Task </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.addTaskTitle}>
                    <TouchableOpacity
                      onPress={() => setIsComplete(prev => !prev)}>
                        <Ionicons name={isComplete ? "checkbox-outline" : "square-outline"} size={30} color="#5E4833"/>
                    </TouchableOpacity>

                    <BottomSheetTextInput 
                      multiline 
                      style={[styles.taskInput, isComplete && styles.completedText]} 
                      placeholder='Write your task here! *'
                      placeholderTextColor={'#AF947B'} 
                      onChangeText={text => setTask(text)}
                      value={task}>
                    </BottomSheetTextInput>

                    <TouchableOpacity
                      onPress={() => setDread(prev => !prev)}>
                        <View style={[styles.flagContainer, dread && styles.flagDread]}>
                            <Ionicons name={dread ? "flag" : "flag-outline"} size={18} color={dread ? "#FFF" : "#937254"}/>
                        </View>
                    </TouchableOpacity>
                </View>

                <BottomSheetTextInput
                  multiline
                  style={styles.taskDescInput}
                  placeholder='Task description...'
                  placeholderTextColor={'#AF947B'}
                  onChangeText={text => setTaskDesc(text)}
                  value={taskDesc}>
                </BottomSheetTextInput>

                <View style={styles.subtaskContainer}>
                {newSubtasks.map((subtask, index) => (
                    <Subtask
                        key={index}
                        id={index}
                        text={subtask.text}
                        completed={subtask.completed}
                        onToggle={() => toggleNewSubtaskCompletion(index)}
                        onDelete={() => removeSubtask(index)}></Subtask>
                ))}
                </View>
                 
                <View style={styles.subtaskInputContainer}>
                    <TouchableOpacity
                        onPress={handleAddSubtask}>
                        <Ionicons name="add-circle-outline" size={30} color="#937254"/>
                    </TouchableOpacity>

                    <BottomSheetTextInput
                        multiline
                        style={styles.subtaskInput}
                        placeholder='Add subtask here'
                        placeholderTextColor={'#AF947B'}
                        onChangeText={text => setSubtaskInput(text)}
                        value={subtaskInput}>
                    </BottomSheetTextInput>
                </View>
                
                <Animated.View layout={LinearTransition.duration(500)}>
                    <View style={{paddingHorizontal: 40, paddingBottom: 10}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <View style={{flexDirection: 'row'}}>
                                <Ionicons name={expandedTime ? "chevron-down" : "chevron-forward"} size={20} color="#937254"/>
                                <Text style={styles.scheduleTimeTxt}> Schedule time </Text>
                            </View>
                            <Switch
                              value={expandedTime}
                              trackColor={{ false: '#767577', true: '#0cba00' }}
                              ios_backgroundColor={'rgb(170, 170, 170)'}
                              onValueChange={(value) => {
                                setExpandedTime(value);
                                if (value && !startTime) {
                                    const start = combineDateAndTime(date, new Date().toISOString());
                                    setStartTime(start);
                                    setEndTime(addMinutes(start, 30));
                                }
                                if (!value) { setStartTime(undefined); setEndTime(undefined);
                                }}
                              }/>
                        </View>
                    </View>
                    {expandedTime && renderScheduleTime() }
                </Animated.View>
                
                <View style={{paddingBottom: keyboardVisible ? 50 : 100}}>
                    <View style={styles.footer}>

                        <View style={styles.difficultyOptions}>
                            <TouchableOpacity onPress={() => {setExpanded(!expanded); setDifficulty('');}} style={[styles.difficultyBtn, difficulty ? difficultyStyles[difficulty] : null]}>
                                    <Text style={[styles.difficultyTxt, difficulty && {color: '#FFF'}]}>{difficulty ? difficultyLabels[difficulty] : 'Difficulty * '}</Text>
                            </TouchableOpacity>

                            {
                            expanded && (
                                <> 
                                    <Animated.View
                                    entering={SlideInLeft.duration(500).easing(Easing.inOut(Easing.quad))}
                                    exiting={ SlideOutLeft.duration(500).easing(Easing.inOut(Easing.quad))}>
                                        <TouchableOpacity
                                            style={[styles.difficultyBtn, { backgroundColor: '#00BC22', borderLeftColor: '#2B7C1E'}]}
                                            onPress={() => {setDifficulty('easy'); setExpanded(false);}}>
                                                <Text style={[styles.difficultyTxt, styles.optionTxt]}>Easy 😌</Text>
                                        </TouchableOpacity>
                                    </Animated.View>

                                    <Animated.View
                                    entering={SlideInLeft.duration(500).delay(100).easing(Easing.inOut(Easing.quad))}
                                    exiting={ SlideOutLeft.duration(500).delay(100).easing(Easing.inOut(Easing.quad))}>
                                        <TouchableOpacity
                                            style={[styles.difficultyBtn, { backgroundColor: '#EE8F00', borderLeftColor: '#BB7102'}]}
                                            onPress={() => {setDifficulty('moderate'); setExpanded(false);}}>
                                                <Text style={[styles.difficultyTxt, styles.optionTxt]}>Moderate 🙂</Text>
                                        </TouchableOpacity>
                                        </Animated.View>
                                    
                                    <Animated.View
                                    entering={SlideInLeft.duration(500).delay(200).easing(Easing.inOut(Easing.quad))}
                                    exiting={ SlideOutLeft.duration(500).delay(200).easing(Easing.inOut(Easing.quad))}>
                                        <TouchableOpacity
                                            style={[styles.difficultyBtn, {backgroundColor: '#BC0000', borderLeftColor: '#810303'}]}
                                            onPress={() => {setDifficulty('difficult'); setExpanded(false);}}>
                                                <Text style={[styles.difficultyTxt, styles.optionTxt]}>Difficult 😥</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                </>
                            )}
                        </View>
                        
                        <TouchableOpacity
                        onPress={() => setShowDatePicker(!showDatePicker)}>
                            <Ionicons name="calendar-clear-outline" size={25} color="#937254"/>
                        </TouchableOpacity>

                    </View>

                    {showDatePicker && openDateTimePicker()}
                </View>

                
            </BottomSheetScrollView>
        </View>
        
        
    );
};

const styles = StyleSheet.create({
    innerContainer: {
        backgroundColor: '#FFF',
        height: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    titleTxt: {
        fontFamily: 'InterBold',
        color: '#5E4833',
        fontSize: 20,
        marginLeft: 15
    },
    addTaskBtn: {
        backgroundColor: "#937254",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-end',
        marginRight: 15,
    },
    addTaskTxt: {
        fontFamily: "InterBold",
        color: "#FFF"
    },
    addTaskTitle: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 40,
    },
    taskInput: {
        flex: 1,
        marginHorizontal: 5,
        textAlignVertical: 'top',
        fontFamily: "InterBold",
        color: '#5E4833',
    },
    flagContainer: {
        borderColor: "#937254",
        borderWidth: 2,
        borderRadius: 50,
        height: 30,
        width: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    flagDread: {
        backgroundColor: '#BC0000',
        borderColor: '#BC0000',
    },
    taskDescInput: {
        borderWidth: 2,
        borderColor: '#937254',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        marginHorizontal: 40,
        color: '#937254'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 22,
        paddingBottom: 10,
        marginTop: 'auto',
    },
    difficultyBtn: {
        backgroundColor: "#D9D9D9",
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#787878",
        marginRight: 2,
    },
    difficultyOptions: {
        flexDirection: 'row'
    },
    optionTxt: {
        fontSize: 10,
        color: "#FFF",
    },
    difficultyTxt: {
        fontFamily: "InterSemiBold",
        fontSize: 13,
        color: '#787878',
    },
    subtaskContainer: {
        paddingHorizontal: 75,
        paddingTop: 5,
    },
    subtaskInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 5,
        marginHorizontal: 40,
        marginVertical: 5,
    },
    subtaskInput: {
        marginLeft: 5,
        flex: 1,
        color: '#937254'
    },
    completedText: {
        color: 'rgb(94, 72, 51, 0.7)',
        textDecorationLine: 'line-through',
    },
    scheduleTimeTxt: {
        fontFamily: "InterBold",
        color: '#937254',
        fontSize: 15
    },
    timeTxt: {
        fontFamily: 'InterSemiBold',
        color: '#5E4833'
    },
});

export default AddTaskForm;