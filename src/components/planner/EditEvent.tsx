import 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch, Keyboard, Platform } from 'react-native';
import { useEffect, useState, forwardRef, useCallback } from 'react';
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import ColorPicker, { Panel3, BrightnessSlider, Swatches } from 'reanimated-color-picker';
import { usePlannerStore, getDateTimeString, formatDatetoString, combineDateAndTime } from '@/store/usePlannerStore';
import { addMinutes } from '@/store/useTodoStore';
import Animated, { FadeIn, FadeOut, LinearTransition, Easing } from 'react-native-reanimated';
import { EventItem } from '@/types/event';

type EditEventProps = {
    close: () => void;
    event: EventItem;
};

type Ref = BottomSheetModal;

const EditEvent = forwardRef<Ref, EditEventProps>((props, ref) => {

    const renderBackdrop = useCallback(
        (p: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...p} />, []);

    const { updateEvent, deleteEvent } = usePlannerStore();

    const [eventTitle, setEventTitle] = useState<string>(props.event?.title ?? '');
    const [eventDescription, setEventDescription] = useState<string>(props.event?.eventDesc ?? '');
    const [expandedTime, setExpandedTime] = useState<boolean>(!(props.event?.allDay ?? false));
    const [startTime, setStartTime] = useState<string | undefined>(
        props.event?.allDay ? undefined : getDateTimeString(props.event?.start)
    );
    const [endTime, setEndTime] = useState<string | undefined>(
        props.event?.allDay ? undefined : getDateTimeString(props.event?.end)
    );
    const [date, setDate] = useState<string>(
        (getDateTimeString(props.event?.start)?.split('T')[0] ?? new Date().toISOString().split('T')[0]) + 'T00:00:00'
    );
    const [color, setColor] = useState<string>(props.event?.color ?? '#ffff9c');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showColourWheel, setShowColourWheel] = useState<boolean>(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // repopulate whenever a different event is opened
    useEffect(() => {
        if (!props.event) return;
        setEventTitle(props.event.title ?? '');
        setEventDescription(props.event.eventDesc ?? '');
        setColor(props.event.color ?? '#ffff9c');

        const allDay = props.event.allDay ?? false;
        const startStr = getDateTimeString(props.event.start);
        const endStr = getDateTimeString(props.event.end);

        setExpandedTime(!allDay);
        setStartTime(allDay ? undefined : startStr);
        setEndTime(allDay ? undefined : endStr);
        setDate((startStr?.split('T')[0] ?? new Date().toISOString().split('T')[0]) + 'T00:00:00');
        setShowDatePicker(false);
        setShowColourWheel(false);
    }, [props.event?.id]);

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

    const renderScheduleTime = () => (
        <Animated.View
            style={{ paddingHorizontal: 65, paddingBottom: 10 }}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            layout={LinearTransition.duration(500).easing(Easing.inOut(Easing.quad))}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.timeTxt}>Start Time: </Text>
                <DateTimePicker
                    value={new Date(startTime ?? combineDateAndTime(date, new Date().toISOString()))}
                    mode={'time'}
                    is24Hour={true}
                    onValueChange={(e, selectedStart) => selectedStart && setStartTime(selectedStart.toISOString())}
                />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.timeTxt}>End Time:   </Text>
                <DateTimePicker
                    value={new Date(endTime ?? combineDateAndTime(date, new Date().toISOString()))}
                    mode={'time'}
                    is24Hour={true}
                    onValueChange={(e, selectedEnd) => selectedEnd && setEndTime(selectedEnd.toISOString())}
                />
            </View>
        </Animated.View>
    );

    const openDateTimePicker = () => (
        <View style={{ alignSelf: 'flex-end', paddingTop: 10 }}>
            <DateTimePicker
                value={new Date(date)}
                mode={'date'}
                is24Hour={true}
                onValueChange={(e, selectedDate) => {
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
        if (!props.event) return;
        if (!eventTitle.trim()) {
            return Alert.alert("Input a title", "Please input an event title", [{ text: "Ok", style: 'cancel' }]);
        }

        const isAllDay = !expandedTime;
        let start: string;
        let end: string;

        if (isAllDay) {
            start = date;   // store strips the time to YYYY-MM-DD on read
            end = date;
        } else {
            start = startTime ?? combineDateAndTime(date, new Date().toISOString());
            end = endTime ?? addMinutes(start, 30);
            if (start === end) {
                return Alert.alert("Timing error", "Start time and End time cannot be the same", [{ text: 'Ok', style: 'cancel' }]);
            }
        }

        await updateEvent(props.event.id, eventTitle, start, end, isAllDay, color, eventDescription);
        props.close();
    };

    const confirmDelete = () => {
        Alert.alert("Delete event", "Are you sure you want to delete this event?", [
            { text: 'Yes', onPress: () => { deleteEvent(props.event?.id); props.close(); } },
            { text: 'No', style: 'cancel' },
        ]);
    };

    return (
        <BottomSheetModal
            ref={ref}
            enableDynamicSizing={true}
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            backdropComponent={renderBackdrop}
            handleStyle={{ backgroundColor: '#f7f4e1' }}
            handleIndicatorStyle={{ backgroundColor: '#5E4833' }}>
            <BottomSheetView style={{ paddingTop: 5 }}>

                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity onPress={props.close}>
                            <Ionicons name="close" size={30} color="#937254" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.addEventBtn} onPress={handleSubmit}>
                            <Text style={styles.addEventTxt}>Update Event</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <BottomSheetTextInput
                    multiline
                    style={styles.titleInput}
                    placeholder='Write the event title here! *'
                    placeholderTextColor={'#AF947B'}
                    onChangeText={setEventTitle}
                    value={eventTitle} />

                <BottomSheetTextInput
                    multiline
                    style={styles.descInput}
                    placeholder='Event Description...'
                    placeholderTextColor={'#AF947B'}
                    onChangeText={setEventDescription}
                    value={eventDescription} />

                <Animated.View layout={LinearTransition.duration(500)}>
                    <View style={{ paddingHorizontal: 40, paddingVertical: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Ionicons name={expandedTime ? "chevron-down" : "chevron-forward"} size={20} color="#937254" />
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
                                    if (!value) { setStartTime(undefined); setEndTime(undefined); }
                                }} />
                        </View>
                    </View>
                    {expandedTime && renderScheduleTime()}
                </Animated.View>

                <View style={styles.swatchesContainer}>
                    <Text style={styles.scheduleTimeTxt}>Colour:</Text>
                    <ColorPicker
                        style={{ width: '100%' }}
                        value={color}
                        onCompleteJS={({ hex }) => setColor(hex)}>
                        <View style={[styles.swatches, { flexDirection: 'row', gap: 8 }]}>
                            <Swatches
                                style={{ alignItems: 'center', justifyContent: 'center' }}
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
                                style={{ width: '50%', paddingTop: 15, gap: 15, alignSelf: 'center' }}>
                                <Panel3 />
                                <BrightnessSlider />
                            </Animated.View>
                        )}
                    </ColorPicker>
                </View>

                <View style={{flexDirection: 'row', paddingBottom: keyboardVisible ? 10 : 50, justifyContent: 'space-between', marginHorizontal: 30, paddingTop: 10}}>
                    <TouchableOpacity onPress={confirmDelete}>
                        <Ionicons name="trash-outline" size={24} color="#BC0000" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
                        <Ionicons name="calendar-clear-outline" size={25} color="#937254" />
                    </TouchableOpacity>
                    
                    {showDatePicker && openDateTimePicker()}

                </View>

            </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    container: { backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    titleTxt: { fontFamily: 'InterBold', color: '#5E4833', fontSize: 20, marginLeft: 15 },
    addEventBtn: {
        backgroundColor: "#937254",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-end',
    },
    addEventTxt: { fontFamily: "InterBold", color: "#FFF" },
    titleInput: {
        flex: 1,
        textAlignVertical: 'top',
        fontFamily: "InterBold",
        color: '#5E4833',
        marginHorizontal: 45,
        marginBottom: 10,
    },
    descInput: {
        borderWidth: 2,
        borderColor: '#937254',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        marginHorizontal: 40,
        color: '#937254',
    },
    scheduleTimeTxt: { fontFamily: "InterBold", color: '#937254', fontSize: 15 },
    timeTxt: { fontFamily: 'InterSemiBold', color: '#5E4833' },
    swatchesContainer: { paddingHorizontal: 40 },
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
        marginRight: 5,
    },
});

export default EditEvent;