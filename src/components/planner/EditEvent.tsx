import 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useEffect, useState, forwardRef, useCallback } from 'react';
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import ColorPicker, { Panel3, BrightnessSlider, Swatches, Preview } from 'reanimated-color-picker';
import { usePlannerStore, getDateTimeString } from '@/store/usePlannerStore';
import { EventItem } from '@/types/event';

type EditEventProps = {
    close: () => void;
    event: EventItem;
};

type Ref = BottomSheetModal;

const EditEvent = forwardRef<Ref, EditEventProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        [])

    const {updateEvent, deleteEvent} = usePlannerStore();
    

    const [selectedTab, setSelectedTab] = useState<"event" | "task">('event');
    const [isAllDay, setIsAllDay] = useState<boolean>(props.event?.allDay ?? false);
    const [eventTitle, setEventTitle] = useState<string>(props.event?.title ?? '');
    const [eventDescription, setEventDescription] = useState<string>(props.event?.eventDesc ?? '');
    const [startTime, setStartTime] = useState<string>(getDateTimeString(props.event?.start) ?? new Date().toISOString()); //dateTime -> full ISO string "2026-07-20T14:30:00.000Z", if allDay date -> YYYY-MM-DD
    const [endTime, setEndTime] = useState<string>(getDateTimeString(props.event?.end) ?? new Date().toISOString()); //dateTime -> full ISO string "2026-07-20T14:30:00.000Z", if allDay date -> YYYY-MM-DD
    const [date, setDate] = useState<string>(
          (getDateTimeString(props.event?.start)?.split('T')[0] ?? new Date().toISOString().split('T')[0]) // get YYYY-MM-DD
            + 'T00:00:00' //then add this to the end to resolve any time zone conflicts
    );
    const [color, setColor] = useState<string>(props.event?.color ?? '#ffff9c')

    useEffect(() => {
        if (!props.event) return;
        setEventTitle(props.event.title ?? '');
        setEventDescription(props.event.eventDesc ?? ''); // see note below
        setIsAllDay(props.event.allDay ?? false);
        setColor(props.event.color ?? '#ffff9c');

        const start = getDateTimeString(props.event.start) ?? new Date().toISOString();
        const end = getDateTimeString(props.event.end) ?? new Date().toISOString();
        setStartTime(start);
        setEndTime(end);
        setDate(start.split('T')[0] + 'T00:00:00');
    }, [props.event?.id]); // everytime selected event changes, refire

    // event tab
    const renderEventTab = () => (
        <View style={{paddingTop: 15}}>
            <BottomSheetTextInput style={styles.textInput} placeholder='Event Title' placeholderTextColor={'#717171'}
            onChangeText={(value) => setEventTitle(value)} value={eventTitle}></BottomSheetTextInput>
            <BottomSheetTextInput style={styles.textInput} placeholder='Event Description' placeholderTextColor={'#717171'}
            onChangeText={(value) => setEventDescription(value)} value={eventDescription}></BottomSheetTextInput>
            <View style={{alignItems: "center", paddingTop: 10}}>
                <View>
                    <Text>Start time:</Text>
                    <DateTimePicker
                        value={new Date(startTime)}
                        mode={'time'}
                        is24Hour={true}
                        onValueChange={(event, selectedDate) => selectedDate && setStartTime(selectedDate.toISOString())}
                    />
                </View>
                <View>
                    <Text>End time: </Text>
                    <DateTimePicker
                        value={new Date(endTime)}
                        mode={'time'}
                        is24Hour={true}
                        onValueChange={(event, selectedDate) => selectedDate && setEndTime(selectedDate.toISOString())}
                    />
                </View>

                <View style={{paddingTop: 20}}>
                    <DateTimePicker
                        value={new Date(date)}
                        mode={'date'}
                        is24Hour={true}
                        onValueChange={(event, selectedDate) => selectedDate && setDate(selectedDate.toISOString())}
                    />
                    <Text>Date: {date.toString()}, all day?: {isAllDay.toString()}</Text>
                    <TouchableOpacity style={isAllDay ? styles.activeBtn : styles.button} 
                        onPress={() => {
                        const next = !isAllDay;
                        setIsAllDay(next);
                        if (next) {
                        setStartTime(date);
                        setEndTime(date);
                        }
                    }}
                    >
                        <Text>All day</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{ padding: 20, }}>
                        <ColorPicker
                            style={{ width: '100%' }}
                            value={color}
                            onCompleteJS={({ hex }) => setColor(hex)}
                        >
                            <Preview />
                            <Panel3 />
                            <BrightnessSlider />
                            <Swatches colors={['#ffff9c', '#ff7272', '#72c6ff', '#8cff72', '#c672ff']} />
                        </ColorPicker>
                    </View>
                </View>
            </View>
        </View>

    );

    const renderTaskTab = () => (
        <View style={{paddingTop: 15}}>
            <BottomSheetTextInput style={styles.textInput} placeholder='Task title' placeholderTextColor={'#717171'}></BottomSheetTextInput>
            <BottomSheetTextInput style={styles.textInput} placeholder='Task Description' placeholderTextColor={'#717171'}></BottomSheetTextInput>
        </View>
    );

    return (
        <BottomSheetModal
            ref={ref} 
            snapPoints={['90%']}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            backdropComponent={renderBackdrop}>
            <BottomSheetView>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    <TouchableOpacity
                    onPress={props.close}>
                        <Ionicons name='close' size={30} color="#3f3f3f"/>
                    </TouchableOpacity>
                    
                    <View style={styles.tabContainer}>
                        <TouchableOpacity style={styles.tab} onPress={() => setSelectedTab('event')}>
                            <Text>Event</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tab} onPress={() => setSelectedTab('task')}>
                            <Text>Task</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button}
                      onPress={async () => {
                        await updateEvent(props.event?.id, eventTitle, startTime, endTime, isAllDay, color, eventDescription);
                        props.close();
                      }}>
                        <Text>Update Event</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                      onPress={() => {
                        Alert.alert("Delete task", "Are you sure you want to delete this task?", [
                            { text: 'Yes', onPress: () => {deleteEvent(props.event?.id); props.close()} },
                            { text: 'No', style: 'cancel' }
                        ])
                      }}>
                        <Text>Delete</Text>
                    </TouchableOpacity>

                </View>
                {selectedTab === "event" ? renderEventTab() : renderTaskTab()}
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
    activeBtn: {
        backgroundColor: '#ff7272',
        padding: 5,
        borderRadius: 10,
        marginVertical: 5
    },
    button: {
        backgroundColor: '#d0d0d0',
        padding: 5,
        borderRadius: 10,
        marginVertical: 5
    }
});

export default EditEvent;