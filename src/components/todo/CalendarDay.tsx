import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


const CIRCLE_SIZE = 40;

function CalendarDay({ date, state, marking, onPress }: any) {
  const isSelected = !!marking?.selected || state === 'selected';
  const isToday = state === 'today';
  const isDisabled = state === 'disabled';

  return (
    <TouchableOpacity onPress={() => onPress?.(date)} style={dayStyles.wrapper}>
      <View
        style={[
          dayStyles.circle,
          isSelected && dayStyles.circleSelected,
        ]}>
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
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 4, 
},
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#937254',
    backgroundColor: '#FCF4D2'
  },
  circleSelected: { backgroundColor: '#937254', borderColor: '#5E4833' },
  text: { fontFamily: 'InterBold', fontSize: 16, color: '#937254' },
  textSelected: { color: '#FFF' },
  textDisabled: { color: '#d1ab87' }, // new month or out of min/ max date set
  textToday: {textDecorationLine: 'underline', color: '#7b2929'}
});

export default CalendarDay;