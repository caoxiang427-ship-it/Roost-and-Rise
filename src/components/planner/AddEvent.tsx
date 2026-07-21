import 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useEffect, useState, forwardRef, useCallback } from 'react';
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import ColorPicker, { Panel3, BrightnessSlider, Swatches, Preview } from 'reanimated-color-picker';
import { usePlannerStore, formatDatetoString } from '@/store/usePlannerStore';

type AddEventProps = {
    close: () => void;
    selectedDate: string;
    goToEventHour: (startTime: string) => void;
    draggedStartTime?: { dateTime: string; timeZone?: string };
    draggedEndTime?: { dateTime: string; timeZone?: string };
};

type Ref = BottomSheetModal;

const AddEvent = forwardRef<Ref, AddEventProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        [])

    // helper function for rescheduling event to different date
    const combineDateAndTime = (dateStr: string, timeStr: string) => {
        const d = new Date(dateStr); // dateStr example: "2026-07-21T00:00:00" (midnight safe date string)
        const t = new Date(timeStr); //timeStr example: "2026-07-21T14:30:00.000Z" (full ISO string)
        d.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds());
        return d.toISOString();
    };

    const {addEvent} = usePlannerStore();

    const [selectedTab, setSelectedTab] = useState<"event" | "task">('event');
    const [isAllDay, setIsAllDay] = useState<boolean>(false);
    const [eventTitle, setEventTitle] = useState<string>('');
    const [eventDescription, setEventDescription] = useState<string>('');
    const [startTime, setStartTime] = useState<string>(
        props.draggedStartTime?.dateTime
            ?? combineDateAndTime(props.selectedDate + 'T00:00:00', new Date().toISOString()) // default is selected date + time currently
    );
    const [endTime, setEndTime] = useState<string>(
        props.draggedEndTime?.dateTime
            ?? combineDateAndTime(props.selectedDate + 'T00:00:00', new Date().toISOString())
    );
    const [date, setDate] = useState<string>(props.selectedDate + 'T00:00:00'); // add 'T00:00:00' to prevent timezone discrepancy
    const [color, setColor] = useState<string>('#ffff9c')

    //everytime selectedDate changes in planner, AddEvent date, startTime and endTime will update to match
    useEffect(() => {
        const newDate = props.selectedDate + 'T00:00:00';
        setDate(newDate);
        setStartTime(prev => combineDateAndTime(newDate, prev));
        setEndTime(prev => combineDateAndTime(newDate, prev));
    }, [props.selectedDate]);

    // everytime draggedStartTime and draggedEndTIme changes in planner, values in AddEvent will update to match
    useEffect(() => {
        if (props.draggedStartTime) setStartTime(props.draggedStartTime.dateTime);
        if (props.draggedEndTime) setEndTime(props.draggedEndTime.dateTime);
    }, [props.draggedStartTime, props.draggedEndTime]);



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

                {/* maybe edit this to allow for multiday events */}
                <View style={{paddingTop: 20}}>
                    <DateTimePicker
                        value={new Date(date)}
                        mode={'date'}
                        is24Hour={true}
                        onValueChange={(event, selectedDate) => {
                            // if date changes, update startTime and endTime to match
                            if (!selectedDate) return;
                                const newDate = formatDatetoString(selectedDate);
                                setDate(newDate);
                                setStartTime(prev => combineDateAndTime(newDate, prev)); 
                                setEndTime(prev => combineDateAndTime(newDate, prev));
                        }}
                    />
                    <Text>Date: {date.toString()}, all day?: {isAllDay.toString()}</Text>
                    <TouchableOpacity style={isAllDay ? styles.activeBtn : styles.button} 
                        onPress={() => {
                        const nextState = !isAllDay;
                        setIsAllDay(nextState);
                        if (nextState) {
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
                      onPress={                      
                        async () => {
                            if (!eventTitle.trim()) {
                                return Alert.alert("Input a title", "Please input an event title", [{text: "Ok", style: 'cancel'}])
                            }
                            if (!isAllDay && startTime === endTime) {
                                return Alert.alert("Timing error", "Start time and End time cannot be the same", [{text: 'Ok', style: 'cancel'}])
                            }
                            await addEvent(eventTitle, startTime, endTime, isAllDay, color, eventDescription);
                            if (!isAllDay) {props.goToEventHour?.(startTime)};
                            props.close();
                            // reset state
                            setEventTitle('');
                            setEventDescription('');
                            setIsAllDay(false);
                            setColor('#ffff9c');
                            const formattedSelectedDate = props.selectedDate + 'T00:00:00';
                            setDate(formattedSelectedDate);
                            setStartTime(combineDateAndTime(formattedSelectedDate, new Date().toISOString()));
                            setEndTime(combineDateAndTime(formattedSelectedDate, new Date().toISOString()));
                                                
                      }}>
                        <Text>Add Event</Text>
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

export default AddEvent;