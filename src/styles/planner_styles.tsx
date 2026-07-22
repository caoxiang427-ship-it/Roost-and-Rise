import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    resizeMode: 'contain',
    width: '85%',
    height: '10%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden'
  },
  headerLeft: {
    paddingLeft: 20
  },
  dayName: {
    fontFamily: "InterBold",
    color: '#FFF',
    fontSize: 20
  },
  date: {
    fontFamily: 'InterBold',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15
  },
  headerRight: {
    paddingRight: 20
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  askAiBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2
  },
  geminiImg: {
    resizeMode: 'contain',
    width: 15,
    height: 15,
    marginRight: 5,
  },
  aiBtnTxt: {
    fontFamily: "InterSemiBold",
    color: '#FFF',
    fontSize: 12,
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
  hourContainer: {
    borderRadius: 10,
    backgroundColor: '#F7EFD4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  hourText: {
    fontFamily: 'InterSemiBold',
    color: '#7e6751',
    fontSize: 11,
  },
  // calendar event look
  eventBlock: { flex: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4, justifyContent: 'center' },
  eventTitle: { fontFamily: 'InterSemiBold', fontSize: 12, color: '#3f3f3f' },
  eventDesc: { fontSize: 10, color: '#5f5f5f' },

  // task event look — deliberately different: white card, difficulty accent bar, checkbox
  taskBlock: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF', borderRadius: 6, borderLeftWidth: 5,
    paddingHorizontal: 6, paddingVertical: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
  },
  taskBlockDone: { backgroundColor: '#F0F0F0', opacity: 0.85 },
  taskTitle: { flex: 1, fontFamily: 'InterSemiBold', fontSize: 12, color: '#5E4833' },
  taskTitleDone: { color: 'rgba(94,72,51,0.6)', textDecorationLine: 'line-through' },
});