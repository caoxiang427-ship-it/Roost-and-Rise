import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TaskProps = {
    text: string;
    completed: boolean;
    onDelete: () => void;
    onToggle: () => void;
}

const Task = (props: TaskProps) => {

    return (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <TouchableOpacity 
                    style={styles.checkbox}
                    onPress={props.onToggle}>
                        {props.completed && <Text style={styles.tick}>✓</Text>}
                </TouchableOpacity>
                <Text style={[styles.itemText, props.completed && styles.completedText]}>
                    {props.text}
                </Text>
            </View>
            <View style={styles.itemRight}>
            <TouchableOpacity style={styles.editBtn}></TouchableOpacity>
            <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={props.onDelete}>
            </TouchableOpacity>
            </View>
        </View>
    )
}

// uhh fix task text overflow bug later

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: '#5C4A1A',
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#5C4A1A',
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tick: {
        fontSize: 20,
        color: '#5C4A1A',
        fontWeight: 'bold',
    },
    itemText: {
        fontSize: 18,
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.5,
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
    },
    editBtn: {
        width: 20,
        height: 20,
        backgroundColor: '#c6c6c6',
        marginRight: 15
    },
    deleteBtn: {
        width: 20,
        height: 20,
        backgroundColor: '#a50000'
    }


        
});

export default Task;