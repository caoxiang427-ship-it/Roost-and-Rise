import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { useState, forwardRef, useCallback, useEffect } from 'react';
import { Ionicons } from "@expo/vector-icons";
import SubtaskInput from './SubtaskInput (delete ltr)';
import { SubtaskItem, TaskItem } from '@/types/todo';
import Subtask from './Subtask';
import Animated, { SlideInLeft, SlideOutLeft, Easing } from 'react-native-reanimated';


type EditTaskProps = {
    close: () => void;
    task: TaskItem | null;
    onEditTask: (id: number,
        text: string,
        dread: boolean,
        complete: boolean,
        difficulty: 'easy' | 'moderate' |'difficult' | '',
        taskDesc?: string,
        subtasks?: SubtaskItem[]
    ) => Promise<void>;
    openCalendar: () => void;
    onDeleteSubtask: (subtaskId: number) => void;
}

type Ref = BottomSheet;

const EditTask = forwardRef<Ref, EditTaskProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []

    );

    const [task, setTask] = useState<string>(props.task?.text ?? '');
    const [taskDesc, setTaskDesc] = useState<string>(props.task?.taskDesc ?? '');
    const [dread, setDread] = useState<boolean>(props.task?.dread ?? false);
    const [isComplete, setIsComplete] = useState<boolean>(props.task?.completed ?? false);
    const [subtasks, setSubtasks] = useState<SubtaskItem[]>(props.task?.subtasks ?? [])
    const [subtaskInput, setSubtaskInput] = useState<string>('');
    const [difficulty, setDifficulty] = useState<'easy'|'moderate'|'difficult'|''>(props.task?.difficulty ?? '');
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


    useEffect(() => {
        if (props.task) {
            setTask(props.task.text);
            setTaskDesc(props.task.taskDesc ?? '');
            setDread(props.task.dread);
            setIsComplete(props.task.completed);
            setSubtasks(props.task.subtasks ?? []);
            setDifficulty(props.task.difficulty ?? '')
        }
    }, [props.task]);

    const handleSubmit = async () => {
        if (difficulty === '') {
                    Alert.alert(
                        "Difficulty Required",          
                        "Please select a difficulty level before adding the task.", 
                        [{ text: "OK" }]                
                    );
                    return;
                };

        if (!props.task) return;
        await props.onEditTask(props.task.id, task, dread, isComplete, difficulty, taskDesc, subtasks);
        props.close();
    };

    const handleAddSubtask = () => {
        if (!subtaskInput.trim()) return;
        // id: Date.now() for newly added subtasks is a temp local id, handleEditTask will filter out existing and new subtasks and replace the Date.now() id with supabase assigned ones
        setSubtasks(prev => [...prev, { id: Date.now(), text: subtaskInput.trim(), completed: false }]);
        setSubtaskInput('');
    };

    // bug here: fix ltr!
    // removeSubtask calls onDeleteSubtask immediately but handleEditTask hasn't been called yet
    // so the subtask gets deleted from Supabase even if the user cancels. Collect deleted ids instead and only delete on submit:
    const removeSubtask = (index: number) => {
        const subtask = subtasks[index];
    
        // only delete from database if it's an existing subtask (not a temp Date.now() id)
        if (subtask.id < 1e12) {
            props.onDeleteSubtask(subtask.id);
        }

        // remove from local state
        setSubtasks(prev => prev.filter((_, i) => i !== index));
    };

    const toggleNewSubtaskCompletion = (index: number) => {
        setSubtasks(prev => prev.map((subtask, i) => 
            i === index ? { ...subtask, completed: !subtask.completed } : subtask
        ));
    }

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
            <BottomSheetScrollView style={styles.innerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={props.close}>
                            <Ionicons name='close' size={30} color="#937254"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.updateTaskBtn}
                        onPress={handleSubmit}>
                            <Text style={styles.addTaskTxt}>Update Task </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.addTaskTitle}>
                    <TouchableOpacity
                      onPress={() => setIsComplete(!isComplete)}>
                        <Ionicons name={isComplete ? "checkbox-outline" : "square-outline"} size={30} color="#5E4833"/>
                    </TouchableOpacity>

                    <BottomSheetTextInput 
                      multiline 
                      style={[styles.taskInput, isComplete && styles.completedText]}
                      value={task} 
                      placeholder='Write your task here! *'
                      placeholderTextColor={'#AF947B'}
                      onChangeText={text => setTask(text)} >
                    </BottomSheetTextInput>

                    <TouchableOpacity
                      onPress={() => setDread(!dread)}>
                        <View style={[styles.flagContainer, dread && styles.flagDread]}>
                            <Ionicons name={dread ? "flag" : "flag-outline"} size={18} color={dread ? "#FFF" : "#937254"}/>
                        </View>
                    </TouchableOpacity>
                </View>

                <BottomSheetTextInput
                  multiline
                  style={styles.taskDescInput}
                  value={taskDesc}
                  placeholder='Task description...'
                  placeholderTextColor={'#AF947B'}
                  onChangeText={text => setTaskDesc(text)}>
                </BottomSheetTextInput>

                <View style={styles.subtaskContainer}>
                {subtasks.map((subtask, index) => (
                    <Subtask
                        key={index}
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
                    <TouchableOpacity onPress={() => {setExpanded(!expanded); setDifficulty('');}} style={[styles.difficultyBtn, difficulty ? difficultyStyles[difficulty] : null]}>
                            <Text style={[styles.difficultyTxt, difficulty && {color: '#FFF'}]}>{difficulty ? difficultyLabels[difficulty] : 'Difficulty *'}</Text>
                    </TouchableOpacity>

                    {expanded && (
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
        position: 'absolute',
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
    updateTaskBtn: {
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
        color: "#5E4833"
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
        color: "#937254"
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 22,
        paddingBottom: 40,
        marginTop: 'auto',
    },
    difficultyBtn: {
        backgroundColor: "#D9D9D9",
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#787878"
    },
    difficultyTxt: {
        fontFamily: "InterSemiBold",
        fontSize: 13,
        color: '#787878',
    },
    optionTxt: {
        color: "#FFF",
        lineHeight: 17,
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

export default EditTask;