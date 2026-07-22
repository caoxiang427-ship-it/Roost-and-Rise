import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { CalendarBody, CalendarContainer, CalendarHeader, CalendarKitHandle } from '@howljs/calendar-kit';
import { Ionicons } from "@expo/vector-icons";
import { EventItem } from '@/types/event';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import WeeklyCalendar from '@/components/planner/WeeklyCalendar';
import AddEvent from '@/components/planner/AddEvent';
import EditEvent from '@/components/planner/EditEvent';
import { usePlannerStore } from '@/store/usePlannerStore';
import { TaskItem } from '@/types/todo';


export default function planner() {

  const {eventItems, eventsLoading, init, rescheduleEvent} = usePlannerStore();

  const [numberOfDays, setNumberOfDays] = useState(1); // 7 = week, 1 = day
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); //react-native-calendars take in dates in YYYY-MM-DD format
  const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', {weekday: 'long',});
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-GB');
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

  // for difficulty colour mapping
  const DIFFICULTY_COLOR: Record<string, string> = {
    easy: '#00BC22', moderate: '#EE8F00', difficult: '#BC0000', '': '#937254',
  };
  // helper function to convert TaskItem to EventItem
  const addMinutes = (iso: string, m: number) =>
    new Date(new Date(iso).getTime() + m * 60000).toISOString();

  // function to convert taskItem into new object that's structurally compatible with what library calendar kit requires (it's eventItem with more properties)
  const taskToCalendarEvent = (t: TaskItem) => {
    // !! converts datatype to boolean, if start.time is present, timed = true
    const timed = !!t.startTime;
    return {
      id: `task-${t.id}`, // 'task' prefix to distinguish it from regular calendar events
      title: t.text,
      isTask: true as const,
      taskId: t.id,
      completed: t.completed,
      difficulty: t.difficulty,
      color: 'transparent', // we fully custom-render tasks, so base color is unused
      ...(timed
        ? {
            allDay: false,
            start: { dateTime: t.startTime! },
            end: { dateTime: t.endTime ?? addMinutes(t.startTime!, 30) }, // default 30 min
          }
        : {
            allDay: true,
            start: { date: t.scheduledDate },
            end: { date: t.scheduledDate },
          }),
    };
  };

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
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{marginRight: 15}}
              onPress={() => {
                Alert.alert('Google Calendar Sync', 'Do you want to import google calendar events here?', [{text: 'Ok'}, {text: 'Cancel', style: 'cancel'}])
                console.log('sync with google calendar')}}>
              <Ionicons name="sync-outline" size={25} color="#171a5d"/>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                calendarRef.current?.setVisibleDate(selectedDate);
                numberOfDays === 1 ? setNumberOfDays(7) : setNumberOfDays(1)}}>
              <Ionicons name="calendar-outline" size={25} color="#171a5d"/>
            </TouchableOpacity>
          </View>
        </View>
        <WeeklyCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
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