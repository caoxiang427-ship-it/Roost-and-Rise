import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { CalendarBody, CalendarContainer, CalendarHeader, useCalendar, CalendarKitHandle } from '@howljs/calendar-kit';
import { CalendarProvider, WeekCalendar} from 'react-native-calendars';
import CalendarDayWeekly from '@/components/planner/CalendarDayWeekly';
import { Ionicons } from "@expo/vector-icons";
import { EventItem } from '@/types/event';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import AddEvent from '@/components/planner/AddEvent';
import EditEvent from '@/components/planner/EditEvent';
import { usePlannerStore } from '@/store/usePlannerStore';


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

  const {eventItems, eventsLoading, init, rescheduleEvent} = usePlannerStore();

  const [numberOfDays, setNumberOfDays] = useState(1); // 7 = week, 1 = day
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); //react-native-calendars take in dates in YYYY-MM-DD format
  const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-GB');
  const [events, setEvents] = useState<EventItem[]>(eventItems);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | undefined>(undefined); // upon pressing on event -> event becomes selected and open editEventSheet
  const [rescheduledEvent, setRescheduledEvent] = useState<EventItem | undefined>(undefined); //upon long press, select "reschedule event" so you can drag to reschedule

  // for the drag to create event
  const [draggedStart, setDraggedStart] = useState<{ dateTime: string; timeZone?: string } | null>(null);
  const [draggedEnd, setDraggedEnd] = useState<{ dateTime: string; timeZone?: string } | null>(null);

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

  const goToEventHour = (startTime: string) => {
      calendarRef.current?.goToDate({
          date: startTime,
          animatedDate: true,
          hourScroll: true,
          animatedHour: true,
      });
  };

  useEffect(() => {
    calendarRef.current?.goToDate({ date: selectedDate, animatedDate: true });
  }, [selectedDate]);

  useEffect(() => {
    init();
  }, []);
    
  return (
      <CalendarContainer
        ref={calendarRef}
        events={eventItems}
        isLoading={eventsLoading}
        initialTimeIntervalHeight={90}
        numberOfDays={numberOfDays}
        allowPinchToZoom={true}
        onPressEvent={(event) => {openEditEventSheet(); setSelectedEvent(event)}}
        onLongPressEvent={(event) => setRescheduledEvent(event)}
        onDateChanged={(date) => setSelectedDate(standardiseDateFormat(date))}
        allowDragToCreate
        defaultDuration={30} // default event 30 mins if they tap instead of dragging
        onDragCreateEventEnd={(newEvent) => {
          setDraggedStart(newEvent.start);
          setDraggedEnd(newEvent.end);
          openAddEventSheet();
        }}
        allowDragToEdit={true}
        selectedEvent={rescheduledEvent ?? undefined}
        onDragSelectedEventEnd={(event: any) => {
          rescheduleEvent({
            id: event.id,
            start: event.start,
            end: event.end,
         })
         setRescheduledEvent(undefined);
        }
        }
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
        
        <AddEvent
          ref={addEventRef}
          close={closeAddEventSheet}
          selectedDate={selectedDate}
          goToEventHour={(startTime) => goToEventHour(startTime)}
          draggedStartTime={draggedStart ?? undefined}
          draggedEndTime={draggedEnd ?? undefined}
        />
        
        <EditEvent
          ref={editEventRef}
          close={closeEditEventSheet}
          event={selectedEvent!}
        />
      </CalendarContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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