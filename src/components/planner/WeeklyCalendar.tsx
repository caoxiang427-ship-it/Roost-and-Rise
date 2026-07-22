
import {StyleSheet, Text, View } from 'react-native';
import {useCalendar } from '@howljs/calendar-kit';
import { CalendarProvider, WeekCalendar} from 'react-native-calendars';
import CalendarDayWeekly from '@/components/planner/CalendarDayWeekly';

type WeeklyCalendarProps = {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
}

// future edit -> in weeekly calendar view, pressing on date will bring you to day view
const WeeklyCalendar = (props: WeeklyCalendarProps) => {

    // get width of time and each date column to line up calendar dates and the 7-week calendar layout
    const { hourWidth, calendarLayout } = useCalendar();
    const columnWidth = (calendarLayout.width - hourWidth) / 7;
    const weekStripWidth = columnWidth * 7;

    return (
      <View style={styles.calendar}>
        <View style={[styles.calendarLeft, {width: hourWidth}]}>
          <Text>Time</Text>
        </View>
          <CalendarProvider date={props.selectedDate} onDateChanged={props.setSelectedDate} >
            <WeekCalendar
              firstDay={1}
              allowShadow={false}
              dayComponent={(props) => <CalendarDayWeekly {...props} columnWidth={columnWidth}/>}
              hideDayNames
              calendarHeight={70}
              calendarWidth={weekStripWidth}
              style={{ backgroundColor: '#FFF', paddingLeft: 0, paddingRight: 0}}
              markedDates={{
                [props.selectedDate]: { selected: true },
              }}
            />
          </CalendarProvider>
      </View>
    );
  }

const styles = StyleSheet.create({
    calendar: {
    flexDirection: 'row',
    },
    calendarLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: "#cecece"
    },
})

export default WeeklyCalendar;