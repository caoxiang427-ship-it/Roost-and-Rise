import 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, forwardRef, useCallback } from 'react';
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import ColorPicker, { Panel3, BrightnessSlider, Swatches, Preview } from 'reanimated-color-picker';

type AddEventProps = {
    close: () => void;
};

type Ref = BottomSheetModal;

type EventTabProps = {
    date: Date;
    startTime: Date;
    endTime: Date;
    isAllDay: boolean;
    color: string;
    setStartTime: (date: Date) => void;
    setEndTime: (date: Date) => void;
    setIsAllDay: (value: boolean) => void;
    setColor: (color: string) => void;
    reformatDate: (date: Date) => string;
};

const EventTab = ({
    date, startTime, endTime, isAllDay, color,
    setStartTime, setEndTime, setIsAllDay, setColor, reformatDate,
}: EventTabProps) => {
    return (
        <View style={{paddingTop: 15}}>
            <BottomSheetTextInput style={styles.textInput} placeholder='Event Title' placeholderTextColor={'#717171'}></BottomSheetTextInput>
            <BottomSheetTextInput style={styles.textInput} placeholder='Event Description' placeholderTextColor={'#717171'}></BottomSheetTextInput>
            <View style={{alignItems: "center", paddingTop: 10}}>
                <View>
                    <Text>Start time:</Text>
                    <DateTimePicker
                        value={startTime}
                        mode={'time'}
                        is24Hour={true}
                        onValueChange={(event, selectedDate) => selectedDate && setStartTime(selectedDate)}
                    />
                </View>
                <View>
                    <Text>End time: </Text>
                    <DateTimePicker
                        value={endTime}
                        mode={'time'}
                        is24Hour={true}
                        onValueChange={(event, selectedDate) => selectedDate && setEndTime(selectedDate)}
                    />
                </View>

                <Text>Date: {reformatDate(date)}, all day?: {isAllDay.toString()}</Text>
                <TouchableOpacity style={isAllDay ? styles.activeBtn : styles.button} onPress={() => setIsAllDay(!isAllDay)}>
                    <Text>All day</Text>
                </TouchableOpacity>
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
    )
};

const TaskTab = () => {
    return (
        <View style={{paddingTop: 15}}>
            <BottomSheetTextInput style={styles.textInput} placeholder='Task title' placeholderTextColor={'#717171'}></BottomSheetTextInput>
            <BottomSheetTextInput style={styles.textInput} placeholder='Task Description' placeholderTextColor={'#717171'}></BottomSheetTextInput>
        </View>
    )
};

const AddEvent = forwardRef<Ref, AddEventProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        [])
    
    const [selectedTab, setSelectedTab] = useState<"event" | "task">("event");
    const [isAllDay, setIsAllDay] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [endTime, setEndTime] = useState<Date>(new Date());
    const [date, setDate] = useState<Date>(new Date());
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [color, setColor] = useState<string>('#ffff9c')

    // reformat startTime/ endTime to dateTime: string format that eventItem takes in
    const reformatDateTime = (date: Date) => {
        return date.toISOString()
    }

    // for all day events, reformat date to date: string format that eventItem takes in
    const reformatDate = (date: Date) => {
        return date.toISOString().split('T')[0]
    }

    return (
        <BottomSheetModal
            ref={ref} 
            snapPoints={['90%']}
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
                {selectedTab === "event" ? <EventTab
                    date={date}
                    startTime={startTime}
                    endTime={endTime}
                    isAllDay={isAllDay}
                    color={color}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                    setIsAllDay={setIsAllDay}
                    setColor={setColor}
                    reformatDate={reformatDate}
                    /> : <TaskTab />}
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