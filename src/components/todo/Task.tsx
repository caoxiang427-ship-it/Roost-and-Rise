import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

type TaskProps = {
    text: string;
    completed: boolean;
    //onDelete: () => void;
    //onToggle: () => void;
}

const Task = (props: TaskProps) => {

    return (
        <View style={styles.task}>
            <TouchableOpacity
                onPress={() => console.log("finish task")}>
                <Ionicons name="square-outline" size={30} color="#5E4833"/>
            </TouchableOpacity>

            <View style={styles.textContainer}>
                <Text style={[styles.taskText, props.completed && styles.completedText]}>
                    {props.text}
                </Text>
            </View>

            <View style={styles.flagContainer}>
                <TouchableOpacity
                    onPress={() => console.log("flag as dread doing")}>
                        <Ionicons name="flag-outline" size={18} color="#937254"/>
                    </TouchableOpacity>
            </View>
        </View>
    )
}

// uhh fix task text overflow bug later

const styles = StyleSheet.create({
    task: {
        flexDirection: 'row',
        borderRadius: 10,
        backgroundColor: "#f7f4e1",
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderLeftWidth: 7,
        borderLeftColor: "#00BC22",
        marginHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 10,
    },
    textContainer: {
        flex: 1,
        marginHorizontal: 10,
    },
    taskText: {
        fontFamily: "InterSemiBold",
        color: "#5E4833",
        fontSize: 15,
        flexWrap: 'wrap'
    },
    completedText: {},
    flagContainer: {
        borderColor: "#937254",
        borderWidth: 2,
        borderRadius: 50,
        height: 30,
        width: 30,
        justifyContent: "center",
        alignItems: "center",
    },





        
});

export default Task;