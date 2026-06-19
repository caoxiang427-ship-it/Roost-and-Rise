import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SubtaskItem } from '@/types/todo';
import Subtask from '@/components/todo/Subtask';
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

type TaskProps = {
    text: string;
    completed: boolean;
    dread: boolean;
    difficulty: "easy" | "moderate" | "hard";
    taskDesc?: string;
    subtasks?: SubtaskItem[];
    onPress?: () => void;
    //onDelete: () => void;
    //onToggle: () => void;
}

const Task = (props: TaskProps) => {

    const taskDescSection = props.taskDesc ? (
        <Text style={styles.taskDesc}>{props.taskDesc}</Text>
    ) : null;

    const subtaskSection = props.subtasks ? (
        <View style={styles.subtaskWrapper}>
            {props.subtasks.map((subtask) => (
                <Subtask key={subtask.id} text={subtask.text} completed={subtask.completed}/>
            ))}
        </View>
    ) : null;

    const difficultyStyles = {
        easy: styles.easy,
        moderate: styles.moderate,
        hard: styles.hard,
    }

    return (

        <Swipeable
            containerStyle={styles.container}
            overshootRight={true}
            // look into editing this so big swipe -> delete btn fills up space and triggers the delete function
            renderRightActions={() => (
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => console.log("Delete Task")}>
                    <Ionicons name="trash" size={24} color="#FFF"/>
                </TouchableOpacity>
            )}>
            <TouchableOpacity onPress={props.onPress} style={[styles.task, difficultyStyles[props.difficulty]]}>
                <TouchableOpacity
                    onPress={() => console.log("finish task")}>
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
                onPress={() => console.log("flag as dread doing")}>
                    <View style={[styles.flagContainer, props.dread && styles.flagDread]}>
                        <Ionicons name={props.dread ? "flag" : "flag-outline"} size={18} color={props.dread ? "#FFF" : "#937254"}/>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Swipeable>
    )
}

// uhh fix task text overflow bug later

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
        paddingHorizontal: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    taskDesc: {
        fontFamily: "InterRegular",
        fontSize: 12,
        color: "#9D7957",
        paddingVertical: 3,
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
    hard: {
        borderLeftColor: "#BC0000"
    },
        
});

export default Task;