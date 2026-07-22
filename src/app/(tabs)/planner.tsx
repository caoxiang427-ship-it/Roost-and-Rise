import AddEvent from '@/components/planner/AddEvent';
import EditEvent from '@/components/planner/EditEvent';
import WeeklyCalendar from '@/components/planner/WeeklyCalendar';
import { usePlannerStore } from '@/store/usePlannerStore';
import { useTodoStore } from '@/store/useTodoStore';
import { EventItem } from '@/types/event';
import { TaskItem } from '@/types/todo';
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CalendarBody, CalendarContainer, CalendarHeader, CalendarKitHandle } from '@howljs/calendar-kit';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, Text, TouchableOpacity, View, Image } from 'react-native';
import { styles } from '@/styles/planner_styles';
import { ImageBackground } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// for difficulty colour mapping
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#00931b', moderate: '#d78100', difficult: '#BC0000', '': '#937254',
}; 

// to standardise date format between the 2 different calendar libraries
// umm honestly it probably would be easier to just build my own weekly calendar instead of using the library but i alr did it so :(
const standardiseDateFormat = (dateInput: string) => {
  const d = new Date(dateInput);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

export default function planner() {

  const insets = useSafeAreaInsets();
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

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const at = (h: number, m: number) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString(); };
    
  // dummy tasks (for testing first)
  const [dummyTasks, setDummyTasks] = useState<TaskItem[]>([
    { id: 9001, text: 'Finish planner integration', completed: false, dread: false,
      difficulty: 'difficult', taskDesc: 'wire tasks into calendar', subtasks: [],
      scheduledDate: todayDate, xpAwarded: 0, startTime: at(10, 0), endTime: at(10, 30) },
    { id: 9002, text: 'Reply to emails', taskDesc: '', completed: false, dread: false,
      difficulty: 'easy', subtasks: [], scheduledDate: todayDate, xpAwarded: 0,
      startTime: at(14, 0), endTime: at(15, 0) },
    { id: 9003, text: 'Buy groceries (no time set)', taskDesc: '', completed: false, dread: false,
      difficulty: 'moderate', subtasks: [], scheduledDate: todayDate, xpAwarded: 0,
      startTime: null, endTime: null }, // -> all-day
  ]);

  const toggleDummyTaskComplete = (taskId: number) =>
    setDummyTasks(prev => prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t)));

  // merge real events + mapped tasks. Later: replace dummyTasks with taskItems from useTodoStore.
  const calendarEvents = [
    // change default color to 'transparent' to allow for horizontal margins for event blocks
    ...eventItems.map(e => ({ ...e, backgroundColor: e.color, color: 'transparent' })), 
    ...dummyTasks.map(taskToCalendarEvent)];

  // for taskItem -> guards the checkbox-vs-onPressEvent conflict 
  const checkboxPressedAt = useRef(0);

  const calendarRef = useRef<CalendarKitHandle>(null);
  const addEventRef = useRef<BottomSheetModal>(null);
  const editEventRef = useRef<BottomSheetModal>(null);

  const openAddEventSheet = () => addEventRef.current?.present();
  const openEditEventSheet = () => editEventRef.current?.present();

  const closeAddEventSheet = () => addEventRef.current?.dismiss();
  const closeEditEventSheet = () => editEventRef.current?.dismiss();

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

  // custom hour renderer (for styling purposes)
  const renderHour = useCallback((hour: any) => {
    return (
      <View style={[styles.hourContainer, {marginLeft: insets.left + 5}]}>
        <Text style={styles.hourText}>{hour.hourStr}</Text>
      </View>
    );
  }, []);

  // custom event render, update with useCallback later
  const renderEvent = (event: any) => {
    // plain calendar event
    if (!event.isTask) {
      // daily view
      if (numberOfDays === 1) {
        return (
          <View style={{ paddingHorizontal: 10, flex: 1}}>
            <View style={[styles.eventBlock, { backgroundColor: event.backgroundColor, padding: 10}]}>
              <Text style={[styles.eventTitle, { fontSize: 13, marginBottom: 5 }]}>{event.title}</Text>
              {event.eventDesc ? (
                <Text style={styles.eventDesc}>{event.eventDesc}</Text>
              ) : null}
            </View>
          </View>
        );
      }
      // weekly view
      else {
        return (
          <View style={[styles.eventBlock, { backgroundColor: event.backgroundColor, padding: 5 }]}>
            <Text style={[styles.eventTitle, { fontSize: 8 }]}>{event.title}</Text>
          </View>
        );
      }
    }
  
    // task event (distinct look + tickable checkbox)
    
    if (numberOfDays === 1) {
      return (
        <View style={{ paddingHorizontal: 10, flex: 1}}>
          <View style={[styles.taskBlock, {padding: 10, gap: 6}, event.completed && styles.taskBlockDone]}>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => {
                checkboxPressedAt.current = Date.now();
                toggleDummyTaskComplete(event.taskId);
              }}>
              <Ionicons name={event.completed ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={DIFFICULTY_COLOR[event.difficulty]} />
            </TouchableOpacity>
            <Text numberOfLines={2} style={[styles.taskTitle, { fontSize: 13 }, event.completed && styles.taskTitleDone]}>
              {event.title}
            </Text>
          </View>
        </View>
      );
    }
    else {
      return (
      <View style={[styles.taskBlock, { paddingHorizontal: 2, paddingVertical: 5, gap: 2}, event.completed && styles.taskBlockDone]}>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => {
              checkboxPressedAt.current = Date.now();
              toggleDummyTaskComplete(event.taskId);
            }}>
            <Ionicons name={event.completed ? 'checkmark-circle' : 'ellipse-outline'} size={8} color={DIFFICULTY_COLOR[event.difficulty]} />
          </TouchableOpacity>
          <Text style={[styles.taskTitle, { fontSize: 8 }, event.completed && styles.taskTitleDone]}>
            {event.title}
          </Text>
        </View>
      );
    }
  };

  // custom all day event render, update with useCallback later
  const renderAlldayEvent = (event: any) => {
    // plain calendar event
    if (!event.isTask) {
      // daily view
      if (numberOfDays === 1) {
        return (
          <View style={{ paddingHorizontal: 10, flex: 1, paddingBottom: 2}}>
            <View style={[styles.eventBlock, { backgroundColor: event.backgroundColor, paddingVertical: 5, paddingHorizontal: 10}]}>
              <Text style={[styles.eventTitle, { fontSize: 13}]}>{event.title}</Text>
            </View>
          </View>
        );
      }
      // weekly view
      else {
        return (
          <View style={[styles.eventBlock, { flex: 0, backgroundColor: event.backgroundColor, paddingVertical: 3, paddingHorizontal: 5}]}>
            <Text numberOfLines={1} style={[styles.eventTitle, { fontSize: 8 }]}>{event.title}</Text>
          </View>
        );
      }
    }
  
    // task event (distinct look + tickable checkbox)
    
    if (numberOfDays === 1) {
      return (
        <View style={{ paddingHorizontal: 10, flex: 1, paddingBottom: 2}}>
          <View style={[styles.taskBlock, {paddingVertical: 5, paddingHorizontal: 10, gap: 6}, event.completed && styles.taskBlockDone]}>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => {
                checkboxPressedAt.current = Date.now();
                toggleDummyTaskComplete(event.taskId);
              }}>
              <Ionicons name={event.completed ? 'checkmark-circle' : 'ellipse-outline'} size={15} color={DIFFICULTY_COLOR[event.difficulty]} />
            </TouchableOpacity>
            <Text numberOfLines={1} style={[styles.taskTitle, { fontSize: 13 }, event.completed && styles.taskTitleDone]}>
              {event.title}
            </Text>
          </View>
        </View>
      );
    }
    else {
      return (
      <View style={[styles.taskBlock, { flex: 0, paddingHorizontal: 2, paddingVertical: 5, gap: 2}, event.completed && styles.taskBlockDone]}>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => {
              checkboxPressedAt.current = Date.now();
              toggleDummyTaskComplete(event.taskId);
            }}>
            <Ionicons name={event.completed ? 'checkmark-circle' : 'ellipse-outline'} size={8} color={DIFFICULTY_COLOR[event.difficulty]} />
          </TouchableOpacity>
          <Text numberOfLines={1} style={[styles.taskTitle, { fontSize: 8 }, event.completed && styles.taskTitleDone]}>
            {event.title}
          </Text>
        </View>
      );
    }
  };

    
  return (
      <CalendarContainer
        ref={calendarRef}
        events={calendarEvents}
        isLoading={eventsLoading}
        initialTimeIntervalHeight={90}
        numberOfDays={numberOfDays}
        allowPinchToZoom={true}
        onPressEvent={(event) => {openEditEventSheet(); setSelectedEvent(event)}}
        onLongPressEvent={(event: any) => { if (!event.isTask) setRescheduledEvent(event); }}
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
        theme={{
          headerBorderColor: '#917F6E',
          dayBarBorderColor: '#917F6E',
          hourBorderColor: '#917F6E',
          singleDayBorderColor: '#917F6E',
          nowIndicatorColor: '#db4346',
          colors: {
            border: '#d1d0d0'
          },
          countText: {
            fontFamily: 'InterSemiBold',
            color: '#7e6751'
          }
        }}
        overlapEventsSpacing={0}
      >
        <ImageBackground 
          source={require("../../../assets/images/planner/planner_header.png")} 
          style={[styles.header, {marginTop: insets.top + 10, marginHorizontal: insets.left + 30}]}>

          <View style={styles.headerLeft}>
            <Text style={styles.dayName}>{selectedDate === todayDate ? 'Today' : selectedDayName}</Text>
            <Text style={styles.date}>{formattedSelectedDate}</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={{marginRight: 10}}
                onPress={() => {
                  Alert.alert('Google Calendar Sync', 'Do you want to import google calendar events here?', [{text: 'Ok'}, {text: 'Cancel', style: 'cancel'}])
                  console.log('sync with google calendar')}}>
                <Ionicons name="sync-outline" size={20} color="#ffffff"/>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  calendarRef.current?.setVisibleDate(selectedDate);
                  numberOfDays === 1 ? setNumberOfDays(7) : setNumberOfDays(1)}}>
                <Ionicons name="calendar-outline" size={20} color="#ffffff"/>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.askAiBtn}>
              <View style={{flexDirection: 'row'}}>
                <Image source={require("../../../assets/images/planner/gemini_logo.png")} style={styles.geminiImg}></Image>
                <Text style={styles.aiBtnTxt}>Ask AI</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <WeeklyCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
        <CalendarHeader renderEvent={renderAlldayEvent} dayBarHeight={0} renderDayItem={() => null}/>
        <CalendarBody renderEvent={renderEvent} renderHour={renderHour}/>

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