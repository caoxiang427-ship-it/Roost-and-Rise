import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DateProps = {
    day: string;
    date: number;
    isSelected: boolean;
    isToday: boolean;
}

const DateCard = (props: DateProps) => {

    return (
        <TouchableOpacity style={[
            styles.container,
            props.isSelected && styles.selectedCard]}>
            <Text style={[styles.day, props.isSelected && styles.selectedTxt]}>{props.day}</Text>
            <Text style={[styles.date, props.isSelected && styles.selectedTxt, props.isToday && styles.todayTxt]}>{props.date}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderColor: "#937254",
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: "#FCF4D2",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 8,
    },
    day: {
        fontFamily: "InterBold",
        fontSize: 15,
        color: "#937254",
        paddingHorizontal: 3,
    },
    date: {
        fontFamily: "InterBold",
        fontSize:36,
        color: "#937254",
        paddingHorizontal: 1,
    },
    selectedCard: {
        backgroundColor: "#937254",
        borderColor: "#5E4833",
    },
    selectedTxt: {
        color: "#FFF",
    },
    todayTxt:{
        textDecorationLine: "underline",
    },
});

export default DateCard;