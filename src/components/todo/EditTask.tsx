import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { forwardRef, useCallback, useMemo } from 'react';
import { Ionicons } from "@expo/vector-icons";
import SubtaskInput from './SubtaskInput';

type AddTaskProps = {
    close: () => void;
}

type Ref = BottomSheet;

const EditTask = forwardRef<Ref, AddTaskProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []

    );

    return (
        <BottomSheet 
            ref={ref} 
            snapPoints={['35%']} 
            index={-1} 
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            handleIndicatorStyle={{backgroundColor: '#5E4833'}}
            backdropComponent={renderBackdrop}>
            <BottomSheetView style={styles.innerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={props.close}>
                            <Ionicons name='close' size={30} color="#937254"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.addTaskBtn}
                        onPress={() => console.log("close bottom sheet")}>
                            <Text style={styles.addTaskTxt}>Add Task</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.addTaskTitle}>
                    <TouchableOpacity
                      onPress={() => console.log("finish task")}>
                        <Ionicons name="square-outline" size={30} color="#5E4833"/>
                    </TouchableOpacity>

                    <BottomSheetTextInput 
                      multiline 
                      style={styles.taskInput} 
                      placeholder='Write your task here! *'
                      placeholderTextColor={'#AF947B'} >
                    </BottomSheetTextInput>

                    <TouchableOpacity
                      onPress={() => console.log("flag as dread doing")}>
                        <View style={styles.flagContainer}>
                            <Ionicons name="flag-outline" size={18} color="#937254"/>
                    </View>
                    </TouchableOpacity>
                </View>

                <BottomSheetTextInput
                  multiline
                  style={styles.taskDescInput}
                  placeholder='Task description...'
                  placeholderTextColor={'#AF947B'}>
                </BottomSheetTextInput>
                    {/* fix height thing, as more subtasks, height of bottom sheet grows with it until it reachses max, then scroll */}
                <SubtaskInput></SubtaskInput>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.difficultyBtn}
                        onPress={() => console.log("choose difficulty")}>
                            <Text style={styles.difficultyTxt}>Difficulty *</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => console.log("reschedule task")}>
                        <Ionicons name="calendar-clear-outline" size={25} color="#937254"/>
                    </TouchableOpacity>

                </View>

                
            </BottomSheetView>
        </BottomSheet>
        
        
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        backgroundColor: '#f7f4e1',
    },
    innerContainer: {
        backgroundColor: '#FFF',
        height: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    addTaskBtn: {
        backgroundColor: "#937254",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    addTaskTxt: {
        fontFamily: "InterBold",
        color: "#FFF"
    },
    addTaskTitle: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 40,
    },
    taskInput: {
        flex: 1,
        marginHorizontal: 5,
        textAlignVertical: 'top',
        fontFamily: "InterBold",
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
    taskDescInput: {
        borderWidth: 2,
        borderColor: '#937254',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        marginHorizontal: 40
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 40,
        paddingBottom: 40,
        marginTop: 'auto',
    },
    difficultyBtn: {
        backgroundColor: "#D9D9D9",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#787878"
    },
    difficultyTxt: {
        fontFamily: "InterSemiBold",
        fontSize: 13,
        color: '#787878',
    },

});

export default EditTask;