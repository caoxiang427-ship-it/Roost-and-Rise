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
    fontSize: 10,
  },
  // calendar event look
  eventBlock: { 
    flex: 1, 
    borderRadius: 10, 
    },
  eventTitle: { 
    fontFamily: 'InterBold',
    color: '#FFF',
    },
  eventDesc: {
    fontFamily: 'InterBold',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)' 
    },

  // task event look — deliberately different: white card, difficulty accent bar, checkbox
  taskBlock: {
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderWidth: 1,
    borderColor: '#AAAAAA',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.55, 
    shadowRadius: 2, 
    elevation: 7,
    borderRadius: 10,
  },
  taskBlockDone: { 
    backgroundColor: '#f0f0f0', 
    opacity: 0.65 
  },
  taskTitle: { 
    flex: 1, 
    fontFamily: 'InterBold', 
    color: '#7D7D7D' },
  taskTitleDone: { textDecorationLine: 'line-through' },
});