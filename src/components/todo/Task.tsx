import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from 'react-native-gesture-handler';

type TaskProps = {
    text: string;
    completed: boolean;
    //onDelete: () => void;
    //onToggle: () => void;
}

const Task = (props: TaskProps) => {

    return (
        <Swipeable
            containerStyle={styles.container}
            overshootRight={true}
            rightThreshold={40}
            onSwipeableOpen={() => console.log("Delete Task")}
            renderRightActions={() => (
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => console.log("Delete Task")}>
                    <Ionicons name="trash" size={24} color="#FFF"/>
                </TouchableOpacity>

            )}>
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
        borderLeftColor: "#00BC22",
        marginBottom: 20,
    },
    textContainer: {
        flex: 1,
        flexShrink: 1,
        marginHorizontal: 10,
    },
    taskText: {
        fontFamily: "InterSemiBold",
        color: "#5E4833",
        fontSize: 15,
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
    deleteBtn: {
        backgroundColor: "#BC0000",
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 25,
        justifyContent: "center",
        alignItems: "center",
    }





        
});

export default Task;