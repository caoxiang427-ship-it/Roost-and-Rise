import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CIRCLE_SIZE = 35;

type DateData = {
  dateString: string; // 'YYYY-MM-DD'
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

type CalendarDayWeeklyProps = {
  date?: DateData;
  state?: string;
  marking?: { selected?: boolean };
  onPress?: (date?: DateData) => void;
  columnWidth: number; // passed down from useCalendar() in the parent
};

function getWeekday(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue", ...
}

function CalendarDayWeekly({
  date,
  state,
  marking,
  onPress,
  columnWidth,
}: CalendarDayWeeklyProps) {

  const isSelected = !!marking?.selected || state === 'selected';
  const isToday = state === 'today';
  const isDisabled = state === 'disabled';

  const dayName = date ? getWeekday(date.dateString) : '';

  return (
    <TouchableOpacity
      onPress={() => {
        onPress?.(date);
      }}
      style={[dayStyles.wrapper, { width: columnWidth }]}>
      <Text style={dayStyles.dayName}>{dayName}</Text>
      <View style={[dayStyles.circle, isSelected && dayStyles.circleSelected]}>
        <Text
          style={[
            dayStyles.text,
            isSelected && dayStyles.textSelected,
            isDisabled && dayStyles.textDisabled,
            isToday && dayStyles.textToday,
          ]}>
          {date?.day}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const dayStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
  },
  dayName: {
    fontFamily: 'InterBold',
    fontSize: 12,
    color: '#937254',
    marginBottom: 2,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#937254',
    backgroundColor: '#FCF4D2',
  },
  circleSelected: { backgroundColor: '#937254', borderColor: '#5E4833' },
  text: { fontFamily: 'InterBold', fontSize: 16, color: '#937254' },
  textSelected: { color: '#FFF' },
  textDisabled: { color: '#d1ab87' }, // new month or out of min/max date set
  textToday: { textDecorationLine: 'underline', color: '#7b2929' },
});

export default CalendarDayWeekly;