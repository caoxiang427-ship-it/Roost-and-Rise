import 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, forwardRef, useCallback } from 'react';
import { Ionicons } from "@expo/vector-icons";

type AddEventProps = {
    close: () => void;
};

type Ref = BottomSheetModal;

const AddEvent = forwardRef<Ref, AddEventProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        [])
    
    const [selectedTab, setSelectedTab] = useState<"event" | "task">("event");

    const EventTab = () => {
        return (
            <View style={{paddingTop: 15}}>
                <BottomSheetTextInput style={styles.textInput} placeholder='Event Title' placeholderTextColor={'#717171'}></BottomSheetTextInput>
                <BottomSheetTextInput style={styles.textInput} placeholder='Event Description' placeholderTextColor={'#717171'}></BottomSheetTextInput>
                <View style={{alignItems: "center", paddingTop: 10}}>
                    <View>
                        <Text>Start time:</Text>
                    </View>
                    <View>
                        <Text>End time: </Text>
                    </View>
                    <TouchableOpacity style={styles.button}>
                        <Text>All day</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    };

    const TaskTab = () => {
        return (
            <View style={{paddingTop: 15}}>
                <BottomSheetTextInput style={styles.textInput} placeholder='Task title' placeholderTextColor={'#717171'}></BottomSheetTextInput>
                <BottomSheetTextInput style={styles.textInput} placeholder='Task Description' placeholderTextColor={'#717171'}></BottomSheetTextInput>
            </View>        )
    };

    return (
        <BottomSheetModal
            ref={ref} 
            snapPoints={['60%']}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            backdropComponent={renderBackdrop}>
            <BottomSheetView>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={styles.tab} onPress={() => setSelectedTab('event')}>
                        <Text>Event</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => setSelectedTab('task')}>
                        <Text>Task</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{position: 'absolute', left: 10}}
                  onPress={props.close}>
                    <Ionicons name='close' size={30} color="#3f3f3f"/>
                </TouchableOpacity>
                {selectedTab === "event" ? <EventTab /> : <TaskTab />}
            </BottomSheetView>
        </BottomSheetModal>
    
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
    },
    tabContainer: {
        backgroundColor: '#d0d0d0',
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'center',
    },
    tab: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
    },
    textInput: {
        backgroundColor: '#d0d0d0',
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        margin: 5,
    },
    button: {
        backgroundColor: '#d0d0d0',
        padding: 5,
        borderRadius: 10,
        marginVertical: 5
    }
});

export default AddEvent;