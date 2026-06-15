import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { red } from 'react-native-reanimated/lib/typescript/Colors';

type TaskProps = {
    text: string;
}

const Task = (props: TaskProps) => {

    return (
        <View style={style.item}>
            <View style={style.itemLeft}>
                <View style={style.checkbox}></View>
                <Text style={style.itemText}>{props.text}</Text>
            </View>
            <View style={style.itemRight}>
            <TouchableOpacity style={style.editBtn}></TouchableOpacity>
            <TouchableOpacity style={style.deleteBtn}></TouchableOpacity>
            </View>
        </View>
    )
}

// uhh fix task text overflow bug later

const style = StyleSheet.create({
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
        marginRight: 15
    },
    itemText: {
        fontSize: 18,
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