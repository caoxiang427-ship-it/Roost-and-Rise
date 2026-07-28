import 'react-native-gesture-handler';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch, Keyboard, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import ColorPicker, { Panel3, BrightnessSlider, Swatches, Preview } from 'reanimated-color-picker';
import { usePlannerStore, formatDatetoString, combineDateAndTime } from '@/store/usePlannerStore';
import Animated, { FadeIn, FadeOut, LinearTransition, Easing } from 'react-native-reanimated';
import { addMinutes } from '@/store/useTodoStore';


type AddEventFormProps = {
    selectedDate: string;
    close: () => void;
    goToEventHour: (startTime: string) => void;
    draggedStartTime?: { dateTime: string; timeZone?: string };
    draggedEndTime?: { dateTime: string; timeZone?: string };
};

const AddEventForm = (props: AddEventFormProps) => {

    const {addEvent} = usePlannerStore();

    const [eventTitle, setEventTitle] = useState<string>('');
    const [eventDescription, setEventDescription] = useState<string>('');
    const [expandedTime, setExpandedTime] = useState<boolean>(props.draggedStartTime ? true : false);
    const [startTime, setStartTime] = useState<string | undefined>(props.draggedStartTime?.dateTime ?? undefined);
    const [endTime, setEndTime] = useState<string | undefined>(props.draggedEndTime?.dateTime ?? undefined)
    const [date, setDate] = useState<string>(props.selectedDate + 'T00:00:00'); // add 'T00:00:00' to prevent timezone discrepancy
    const [color, setColor] = useState<string>('#CC6E62');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showColourWheel, setShowColourWheel] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const renderScheduleTime = () => (
        <Animated.View
          style={{paddingHorizontal: 65, paddingBottom: 10}}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          layout={LinearTransition.duration(500).easing(Easing.inOut(Easing.quad))}
      >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.timeTxt}>Start Time: </Text>

                <DateTimePicker
                    value={new Date(startTime ?? combineDateAndTime(date, new Date().toISOString()))}
                    mode={'time'}
                    is24Hour={true}
                    onChange={(event, selectedStart) => selectedStart && setStartTime(selectedStart.toISOString())}
                />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.timeTxt}>End Time:   </Text>

                <DateTimePicker
                    value={new Date(endTime ?? combineDateAndTime(date, new Date().toISOString()))} // if endTime, show endTime, if not defaults to selected date + time currently
                    mode={'time'}
                    is24Hour={true}
                    onChange={(event, selectedEnd) => selectedEnd && setEndTime(selectedEnd.toISOString())}
                />
            </View>
        </Animated.View>
    );

    const openDateTimePicker = () => (
        <View style={{alignSelf: 'flex-end', paddingTop: 10}}>
            <DateTimePicker
                value={new Date(date)}
                mode={'date'}
                is24Hour={true}
                onChange={(event, selectedDate) => {
                    // if date changes, update startTime and endTime to match
                    if (!selectedDate) return;
                        const newDate = formatDatetoString(selectedDate);
                        setDate(newDate);
                        setStartTime(prev => (prev ? combineDateAndTime(newDate, prev) : prev));
                        setEndTime(prev => (prev ? combineDateAndTime(newDate, prev) : prev));
                }}
            />
        </View>
    );

    const handleSubmit = async () => {

        const isAllDay = !expandedTime;
        let start: string;
        let end: string;

        if (isAllDay) {
            start = date;   // "YYYY-MM-DDT00:00:00" — store strips the time on read
            end = date;
        } else {
            start = startTime ?? combineDateAndTime(date, new Date().toISOString());
            end = endTime ?? addMinutes(start, 30);
            if (start === end) {
                return Alert.alert("Timing error", "Start time and End time cannot be the same", [{ text: 'Ok', style: 'cancel' }]);
            }
        }

        if (!eventTitle.trim()) {
            return Alert.alert("Input a title", "Please input an event title", [{text: "Ok", style: 'cancel'}])
        }
 
        await addEvent(eventTitle, start, end, isAllDay, color, eventDescription);
        if (!isAllDay) {props.goToEventHour?.(start)};
        props.close();
        // reset state
        setEventTitle('');
        setEventDescription('');
        setColor('#ffff9c');
        const formattedSelectedDate = props.selectedDate + 'T00:00:00';
        setDate(formattedSelectedDate);
        setStartTime(combineDateAndTime(formattedSelectedDate, new Date().toISOString()));
        setEndTime(combineDateAndTime(formattedSelectedDate, new Date().toISOString()));
    };

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    //everytime selectedDate changes in planner, AddEvent date, startTime and endTime will update to match
    useEffect(() => {
        const newDate = props.selectedDate + 'T00:00:00';
        setDate(newDate);
        setStartTime(prev => (prev ? combineDateAndTime(newDate, prev) : prev));
        setEndTime(prev => (prev ? combineDateAndTime(newDate, prev) : prev));
    }, [props.selectedDate]);

    // everytime draggedStartTime and draggedEndTIme changes in planner, values in AddEvent will update to match
    useEffect(() => {
        if (props.draggedStartTime) setStartTime(props.draggedStartTime.dateTime);
        if (props.draggedEndTime) setEndTime(props.draggedEndTime.dateTime);
    }, [props.draggedStartTime, props.draggedEndTime]);

    return (
        <View>
            <View style={styles.header}>
                <View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between'}}>
                    <Text style={styles.titleTxt}> Add New Event:</Text>
                    <TouchableOpacity
                        style={styles.addEventBtn}
                        onPress={handleSubmit}>
                            <Text style={styles.addEventTxt}>Add Event </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <BottomSheetTextInput
              multiline
              style={styles.titleInput} 
              placeholder='Write the event title here! *' 
              placeholderTextColor={'#AF947B'}
              onChangeText={(value) => setEventTitle(value)} value={eventTitle}></BottomSheetTextInput>

            <BottomSheetTextInput
              multiline
              style={styles.descInput} 
              placeholder='Event Description...' 
              placeholderTextColor={'#AF947B'}
              onChangeText={(value) => setEventDescription(value)} value={eventDescription}></BottomSheetTextInput>
            
            <Animated.View layout={LinearTransition.duration(500)}>
                <View style={{paddingHorizontal: 40, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={{flexDirection: 'row'}}>
                            <Ionicons name={expandedTime ? "chevron-down" : "chevron-forward"} size={20} color="#937254"/>
                            <Text style={styles.scheduleTimeTxt}> Schedule time </Text>
                        </View>
                        <Switch
                            value={expandedTime}
                            trackColor={{ false: '#767577', true: '#0cba00' }}
                            ios_backgroundColor={'rgb(170, 170, 170)'}
                            onValueChange={(value) => {
                                setExpandedTime(value);
                                if (value && !startTime) {
                                    const start = combineDateAndTime(date, new Date().toISOString());
                                    setStartTime(start);
                                    setEndTime(addMinutes(start, 30));
                                }
                                if (!value) { 
                                    setStartTime(undefined); setEndTime(undefined);
                                }}
                            }/>
                    </View>
                </View>
                {expandedTime && renderScheduleTime() }
            </Animated.View>

            <View style={styles.swatchesContainer}>
                <Text style={styles.scheduleTimeTxt}>Colour:</Text>
                <ColorPicker
                    style={{ width: '100%' }}
                    value={color}
                    onCompleteJS={({ hex }) => setColor(hex)}
                >
                    <View style={[styles.swatches, {flexDirection: 'row', gap: 8}]}>
                        <Swatches 
                          style={{ alignItems: 'center', justifyContent: 'center'}} 
                          colors={['#FF7F82', '#F38958', '#ffc955', '#5EE7B7', '#75C0C5', '#b1a1ff', '#F49FD2']} />
                        <TouchableOpacity onPress={() => setShowColourWheel(v => !v)}>
                            <View style={[styles.customSwatch, { backgroundColor: color }]}>
                                <Ionicons name="add" size={18} color={'#FFF'} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {showColourWheel && (
                        <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        layout={LinearTransition.duration(300)}
                        style={{ width: '50%', paddingTop: 15, gap: 15, alignSelf: 'center' }}
                        >
                        <Panel3 />
                        <BrightnessSlider />
                        </Animated.View>
                    )}

                </ColorPicker>
            </View>
            
            <View style={{paddingBottom: keyboardVisible ? 10 : 50, alignItems: 'flex-end', marginHorizontal: 30}}>
                <TouchableOpacity
                onPress={() => setShowDatePicker(!showDatePicker)}>
                    <Ionicons name="calendar-clear-outline" size={25} color="#937254"/>
                </TouchableOpacity>

                {showDatePicker && openDateTimePicker()}
            </View>

        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    titleTxt: {
        fontFamily: 'InterBold',
        color: '#5E4833',
        fontSize: 20,
        marginLeft: 15
    },
    addEventBtn: {
        backgroundColor: "#937254",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-end',
        marginRight: 15,
    },
    addEventTxt: {
        fontFamily: "InterBold",
        color: "#FFF"
    },
    addEventTitle: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 40,
    },
    titleInput: {
        flex: 1,
        textAlignVertical: 'top',
        fontFamily: "InterBold",
        color: '#5E4833',
        marginHorizontal: 45,
        marginBottom: 10
    },
    descInput: {
        borderWidth: 2,
        borderColor: '#937254',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        marginHorizontal: 40,
        color: '#937254'
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
    },
    scheduleTimeTxt: {
        fontFamily: "InterBold",
        color: '#937254',
        fontSize: 15
    },
    timeTxt: {
        fontFamily: 'InterSemiBold',
        color: '#5E4833'
    },
    swatchesContainer: {
        paddingHorizontal: 40
    },
    swatches: {
        borderWidth: 2,
        borderColor: '#937254',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginVertical: 10,
    },
    customSwatch: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#937254',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5
    },
});

export default AddEventForm;