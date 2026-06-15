import { StyleSheet, Text, View } from 'react-native';

type TaskProps = {
    text: string;
}

const Task = (props: TaskProps) => {

    return (
        <View style={style.item}>
            <Text style={style.text}>{props.text}</Text>
        </View>
    )
}

const style = StyleSheet.create({
    item: {
        borderWidth: 2,
        borderColor: '#E8A33D',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,

    },
    text: {
        fontSize: 18,
    }

        
});

export default Task;