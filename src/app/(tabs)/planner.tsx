import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { CalendarBody, CalendarContainer, CalendarHeader, useCalendar, CalendarKitHandle } from '@howljs/calendar-kit';
import { CalendarProvider, WeekCalendar} from 'react-native-calendars';
import CalendarDayWeekly from '@/components/planner/CalendarDayWeekly';
import { Ionicons } from "@expo/vector-icons";
import { EventItem } from '@/types/event';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import AddEvent from '@/components/planner/AddEvent';


// future edit -> in weeekly calendar view, pressing on date will bring you to day view
function WeekStripHeader(
  {
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}) {
    // get width of time and each date column to line up calendar dates and the 7-week calendar layout
    const { hourWidth, calendarLayout } = useCalendar();
    const columnWidth = (calendarLayout.width - hourWidth) / 7;
    const weekStripWidth = columnWidth * 7;

    return (
      <View style={styles.calendar}>
        <View style={[styles.calendarLeft, {width: hourWidth}]}>
          <Text>Time</Text>
        </View>
          <CalendarProvider date={selectedDate} onDateChanged={setSelectedDate} >
            <WeekCalendar
              firstDay={1}
              allowShadow={false}
              dayComponent={(props) => <CalendarDayWeekly {...props} columnWidth={columnWidth}/>}
              hideDayNames
              calendarHeight={70}
              calendarWidth={weekStripWidth}
              style={{ backgroundColor: '#FFF', paddingLeft: 0, paddingRight: 0}}
              markedDates={{
                [selectedDate]: { selected: true },
              }}
            />
          </CalendarProvider>
      </View>
    );
  }


export default function planner() {

  const [numberOfDays, setNumberOfDays] = useState(1); // 7 = week, 1 = day
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-GB');
  const [events, setEvents] = useState<EventItem[]>([]);

  const calendarRef = useRef<CalendarKitHandle>(null);
  // bottom sheet references
  const addEventRef = useRef<BottomSheetModal>(null);
  const editEventRef = useRef<BottomSheetModal>(null);

  const openAddEventSheet = () => addEventRef.current?.present();
  const openEditEventSheet = () => editEventRef.current?.present();

  const closeAddEventSheet = () => addEventRef.current?.dismiss();
  const closeEditEventSheet = () => editEventRef.current?.dismiss();

  // to standardise date format between the 2 different calendar libraries
  // umm honestly it probably would be easier to just build my own weekly calendar instead of using the library but i alr did it so :(
  const standardiseDateFormat = (dateInput: string) => {
    const d = new Date(dateInput);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  useEffect(() => {
    calendarRef.current?.goToDate({ date: selectedDate, animatedDate: true });
  }, [selectedDate]);

     const dummyEvents = [
        {id: '1',
        title: 'Meeting with Team',
        start: { dateTime: '2026-07-19T10:00:00Z' },
        end: { dateTime: '2026-07-19T11:00:00Z' },
        color: '#4285F4',},

        {id: '2',
        title: 'Meeting with Team',
        start: { date: '2026-07-19' },
        end: {  date: '2026-07-19' },
        color: '#4285F4',},

        {id: '3',
        title: 'Meeting with Team',
        start: { date: '2026-07-19' },
        end: {  date: '2026-07-19' },
        color: '#96e19e',},

        {id: '4',
        title: 'Meeting with Team',
        start: { date: '2026-07-19' },
        end: {  date: '2026-07-19' },
        color: '#ebf57d',}
    ]

  return (
      <CalendarContainer
        ref={calendarRef}
        events={dummyEvents}
        initialTimeIntervalHeight={90}
        numberOfDays={numberOfDays}
        onDateChanged={(date) => setSelectedDate(standardiseDateFormat(date))}
        allowDragToCreate
        defaultDuration={30} // default event 30 mins if they tap instead of dragging
        onDragCreateEventEnd={(newEvent) => {
        // newEvent already has the dragged { start, end } as dateTime/timeZone
        setEvents((prev) => [
          ...prev,
          { ...newEvent, id: String(Date.now()), title: 'New Event', color: '#4285F4' },
          ]);
        }}
        spaceFromBottom={100}
      >
        <View style={styles.header}>
          <View>
            <Text>{selectedDayName}</Text>
            <Text>{formattedSelectedDate}</Text>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                calendarRef.current?.setVisibleDate(selectedDate);
                numberOfDays === 1 ? setNumberOfDays(7) : setNumberOfDays(1)}}>
              <Ionicons name="calendar-outline" size={25} color="#171a5d"/>
            </TouchableOpacity>
          </View>
        </View>
        <WeekStripHeader selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
        <CalendarHeader dayBarHeight={0} renderDayItem={() => null}/>
        <CalendarBody />

        <TouchableOpacity 
          style={styles.addBtn}
          onPress={openAddEventSheet}>
          <Ionicons name="add" size={40} color="#FFF"/>
        </TouchableOpacity>

        <AddEvent ref={addEventRef} close={closeAddEventSheet}></AddEvent>
      </CalendarContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 100,
    marginHorizontal: 30,
  },
  calendar: {
    flexDirection: 'row',
  },
  calendarLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: "#cecece"
  },
  addBtn: {
    position: "absolute",
    backgroundColor: "rgba(59, 153, 185, 0.8)",
    borderRadius: 50,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    bottom: 85,
    right: 25,
  },
});