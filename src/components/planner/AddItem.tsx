import 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, forwardRef, useCallback } from 'react';
import { Ionicons } from "@expo/vector-icons";
import AddEventForm from './AddEventForm';
import AddTaskForm from './AddTaskForm';

type AddItemProps = {
    close: () => void;
    selectedDate: string;
    goToEventHour: (startTime: string) => void;
    draggedStartTime?: { dateTime: string; timeZone?: string };
    draggedEndTime?: { dateTime: string; timeZone?: string };
};

type Ref = BottomSheetModal;

const AddItem = forwardRef<Ref, AddItemProps>((props, ref) => {
    
    const [selectedTab, setSelectedTab] = useState<'event' | 'task'>('event');

    const renderBackdrop = useCallback(
        (p: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...p} />, []);

    return (
        <BottomSheetModal
        ref={ref}
        enableDynamicSizing={true}
        enablePanDownToClose
        backgroundStyle={styles.container}
        backdropComponent={renderBackdrop}
        handleStyle={{backgroundColor: '#f7f4e1'}}
        handleIndicatorStyle={{backgroundColor: '#5E4833'}}>
        <BottomSheetView>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={props.close} style={styles.closeBtn}>
                    <Ionicons name="close" size={30} color="#937254" />
                </TouchableOpacity>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={selectedTab === 'event' && styles.selectedTab} onPress={() => setSelectedTab('event')}>
                    <Text style={selectedTab === 'event' ? styles.selectedTxt : styles.txt}>Event</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={selectedTab === 'task' && styles.selectedTab} onPress={() => setSelectedTab('task')}>
                    <Text style={selectedTab === 'task' ? styles.selectedTxt : styles.txt}>Task</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {selectedTab === 'event'
            ? <AddEventForm
                selectedDate={props.selectedDate}
                close={props.close}
                goToEventHour={props.goToEventHour}
                draggedStartTime={props.draggedStartTime}
                draggedEndTime={props.draggedEndTime}
                />
            : <AddTaskForm 
                selectedDate={props.selectedDate} 
                close={props.close}
                goToEventHour={props.goToEventHour}
                draggedStartTime={props.draggedStartTime}
                draggedEndTime={props.draggedEndTime} />}
        </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 15,
    },
    closeBtn: {
        position: 'absolute',
        left: 20
    },
    tabContainer: {
        backgroundColor: '#b39477',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 10
    },
    selectedTab: {
        backgroundColor: '#f7f4e1',
        borderRadius: 5,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    selectedTxt: {
        fontFamily: "InterSemiBold",
        color: '#937254',   
    },
    txt: {
        fontFamily: "InterSemiBold",
        color: '#FFF'
    }
});

export default AddItem;