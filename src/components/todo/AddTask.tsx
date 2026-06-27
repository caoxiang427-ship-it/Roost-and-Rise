import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, forwardRef, useCallback } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { NewSubtaskItem } from '@/types/todo';
import Subtask from './Subtask';
import Animated, { SlideInLeft, SlideOutLeft, Easing } from 'react-native-reanimated';
import { useTodoStore } from '@/store/useTodoStore';

type AddTaskProps = {
    close: () => void;
    openCalendar: () => void;
};

type Ref = BottomSheet;

const AddTask = forwardRef<Ref, AddTaskProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []

    );

    const { handleAddTask, selectedDate } = useTodoStore();

    const [task, setTask] = useState<string>('');
    const [taskDesc, setTaskDesc] = useState<string>('');
    const [dread, setDread] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [newSubtasks, setNewSubtasks] = useState<NewSubtaskItem[]>([]);
    const [subtaskInput, setSubtaskInput] = useState<string>('');
    const [difficulty, setDifficulty] = useState<'easy'|'moderate'|'difficult'|''>('');
    // for expandable difficulty button
    const [expanded, setExpanded] = useState<boolean>(false);

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

        await handleAddTask(task, dread, isComplete, difficulty, selectedDate, taskDesc, newSubtasks);
        // Reset local state after submit
        setTask('');
        setTaskDesc('');
        setIsComplete(false);
        setDread(false);
        setNewSubtasks([]);
        setSubtaskInput('');
        setExpanded(false);
        setDifficulty('');
        props.close();
    };
    

    return (
        <BottomSheet 
            ref={ref} 
            index={-1} 
            enableDynamicSizing={true}
            maxDynamicContentSize={700}
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            handleIndicatorStyle={{backgroundColor: '#5E4833'}}
            backdropComponent={renderBackdrop}>
            <BottomSheetScrollView style={styles.innerContainer} keyboardShouldPersistTaps='handled'>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={props.close}>
                            <Ionicons name='close' size={30} color="#937254"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.addTaskBtn}
                        onPress={handleSubmit}>
                            <Text style={styles.addTaskTxt}>Add Task </Text>
                    </TouchableOpacity>
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

                <View style={styles.footer}>

                    <View style={styles.difficultyOptions}>
                        <TouchableOpacity onPress={() => {setExpanded(!expanded); setDifficulty('');}} style={[styles.difficultyBtn, difficulty ? difficultyStyles[difficulty] : null]}>
                                <Text style={[styles.difficultyTxt, difficulty && {color: '#FFF'}]}>{difficulty ? difficultyLabels[difficulty] : 'Difficulty * '}</Text>
                        </TouchableOpacity>

                        { //layout not good on phone, fix visual bug
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
                      onPress={props.openCalendar}>
                        <Ionicons name="calendar-clear-outline" size={25} color="#937254"/>
                    </TouchableOpacity>

                </View>

                
            </BottomSheetScrollView>
        </BottomSheet>
        
        
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f7f4e1',
    },
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
    addTaskBtn: {
        backgroundColor: "#937254",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
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
        paddingBottom: 100,
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

});

export default AddTask;