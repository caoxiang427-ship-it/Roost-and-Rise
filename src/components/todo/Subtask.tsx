import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

type SubtaskProps = {
    text: string;
    completed: boolean;
    onDelete?: () => void;
    onToggle: () => void;
}
const Subtask = (props: SubtaskProps) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
              onPress={props.onToggle}>
                <Ionicons name={props.completed ? "checkbox-outline" : "square-outline"} size={20} color="#5E4833"/>
            </TouchableOpacity>

            <Text style={[styles.text, props.completed && styles.completedText]}>{props.text}</Text>

            {props.onDelete && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={props.onDelete}>
                    <Ionicons name="trash-outline" size={20} color="#BC0000"/>
            </TouchableOpacity>
            )}
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 3,
        paddingBottom: 2,
    },
    text: {
        fontFamily: "InterRegular",
        fontSize: 13,
        paddingHorizontal: 5,
        color: '#5E4833',
        flex: 1,
    },
    completedText: {
        color: 'rgb(94, 72, 51, 0.7)',
        textDecorationLine: 'line-through',
    },
    deleteBtn: {
        paddingLeft: 3,
    },
});

export default Subtask;