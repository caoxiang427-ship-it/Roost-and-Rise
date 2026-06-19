import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

type SubtaskProps = {
    text: string;
    completed: boolean;
    //onDelete: () => void;
    //onToggle: () => void;
}
const Subtask = (props: SubtaskProps) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => console.log("finish subtask")}>
                <Ionicons name={props.completed ? "checkbox-outline" : "square-outline"} size={20} color="#5E4833"/>
            </TouchableOpacity>

            <Text style={[styles.text, props.completed && styles.completedText]}>{props.text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: "center",
    },
    text: {
        fontFamily: "InterRegular",
        fontSize: 13,
        paddingHorizontal: 5,
        color: '#5E4833',
    },
    completedText: {
        color: 'rgb(94, 72, 51, 0.7)',
        textDecorationLine: 'line-through',
    },
});

export default Subtask;