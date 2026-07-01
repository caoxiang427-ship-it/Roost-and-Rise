import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SubtaskItem } from '@/types/todo';
import Subtask from '@/components/todo/Subtask';
import { Ionicons } from "@expo/vector-icons";
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTodoStore } from '@/store/useTodoStore';
import { useProfileStore } from '@/store/useProfileStore';
import Animated, { FadeInRight, FadeOutLeft, Easing } from 'react-native-reanimated';

type TaskProps = {
    id: number;
    text: string;
    completed: boolean;
    dread: boolean;
    difficulty: "easy" | "moderate" | "difficult" | "";
    xpAwarded: number;
    scheduledDate: string;
    onTriggerReward?: (amount: number, decrease?: boolean) => void;
    taskDesc?: string;
    subtasks?: SubtaskItem[];
    onPress?: () => void;
}

const Task = (props: TaskProps) => {

    const { deleteTask, toggleCompletion, toggleDread, updateTaskXp, rescheduleTask } = useTodoStore(); 
    const { addProgressXp, removeProgressXp } = useProfileStore();

    const now = new Date();
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tomorrowDate = () => {
    const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    };

    const taskDescSection = props.taskDesc ? (
        <Text style={styles.taskDesc}>{props.taskDesc}</Text>
    ) : null;

    const subtaskSection = props.subtasks ? (
        <View style={styles.subtaskWrapper}>
            {props.subtasks.map((subtask) => (
                <Subtask key={subtask.id} id={subtask.id} text={subtask.text} completed={subtask.completed}/>
            ))}
        </View>
    ) : null;

    const difficultyStyles = {
        easy: styles.easy,
        moderate: styles.moderate,
        difficult: styles.difficult,
    }

    return (
        // if there are multiple tasks, the animations won't play for some reason. they only play if there's one task rendered
        <Animated.View 
          entering={FadeInRight.duration(300).easing(Easing.inOut(Easing.quad))} 
          exiting={FadeOutLeft.duration(300).easing(Easing.inOut(Easing.quad))}>
        <ReanimatedSwipeable
            containerStyle={styles.container}
            overshootRight={true}
            // look into editing this so big swipe -> delete btn fills up space and triggers the delete function
            renderRightActions={() => (
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity
                      style={styles.moveBtn}
                      onPress={() => {
                        props.scheduledDate === todayDate
                            ? rescheduleTask(props.id, tomorrowDate())
                            : rescheduleTask(props.id, todayDate);
                        }}>
                        <Ionicons name="arrow-forward-circle-outline" size={24} color="#FFF"/>
                        <Text style={styles.btnTxt}>{props.scheduledDate === todayDate ? 'Do tmr' : 'Do today'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteTask(props.id)}>
                        <Ionicons name="trash" size={24} color="#FFF"/>
                        <Text style={styles.btnTxt}>Delete</Text>
                    </TouchableOpacity>
                </View>
            )}>
            <TouchableOpacity onPress={props.onPress} style={[styles.task, props.difficulty && difficultyStyles[props.difficulty]]}>
                <TouchableOpacity
                    onPress={async () => {
                        toggleCompletion(props.id, props.completed, props.subtasks ?? []);
                        if (!props.completed) {
                            const awarded = await addProgressXp(props.difficulty);
                            props.onTriggerReward?.(awarded);
                            updateTaskXp(props.id, awarded)}
                        else {
                            const removed = await removeProgressXp(props.xpAwarded);
                            props.onTriggerReward?.(removed, true);
                            updateTaskXp(props.id, 0);
                            }}}>
                    <Ionicons name={props.completed ? "checkbox-outline" : "square-outline"} size={30} color="#5E4833"/>
                </TouchableOpacity>

                <View style={styles.textContainer}>
                    <Text style={[styles.taskText, props.completed && styles.completedText]}>
                        {props.text}
                    </Text>

                    {taskDescSection}

                    {subtaskSection}
                </View>

                <TouchableOpacity
                onPress={() => toggleDread(props.id, props.dread)}>
                    <View style={[styles.flagContainer, props.dread && styles.flagDread]}>
                        <Ionicons name={props.dread ? "flag" : "flag-outline"} size={18} color={props.dread ? "#FFF" : "#937254"}/>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </ReanimatedSwipeable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    task: {
        flexDirection: 'row',
        borderRadius: 10,
        backgroundColor: "#f7f4e1",
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderLeftWidth: 7,
        marginBottom: 20,
    },
    textContainer: {
        flex: 1,
        flexShrink: 1,
        marginHorizontal: 15,
    },
    taskText: {
        fontFamily: "InterSemiBold",
        color: "#5E4833",
        fontSize: 15,
        paddingBottom: 3,
    },
    completedText: {
        color: 'rgb(94, 72, 51, 0.7)',
        textDecorationLine: 'line-through',
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
    deleteBtn: {
        backgroundColor: "#BC0000",
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 2,
    },
    moveBtn: {
       backgroundColor: "rgb(127, 127, 127)000",
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        justifyContent: "center",
        alignItems: "center", 
    },
    btnTxt: {
        fontFamily: 'InterBold',
        color: '#FFF',
        fontSize: 10,
    },
    taskDesc: {
        fontFamily: "InterRegular",
        fontSize: 12,
        color: "#9D7957",
        paddingBottom: 3,
        paddingLeft: 10,
    },
    subtaskWrapper: {
        paddingLeft: 10,
    },
    easy: {
        borderLeftColor: "#00BC22",
    },
    moderate: {
        borderLeftColor: "#EE8F00"
    },
    difficult: {
        borderLeftColor: "#BC0000"
    },
        
});

export default Task;