import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
      backgroundColor: '#FFF',
      flex: 1,
  },
  image: {
    width: '100%',
    height: 340,
  },
  topDisplay: {
    flexDirection: 'row',
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  topDisplayLeft: {
    
  },
  header: {
    fontFamily: "InterBold",
    fontSize: 24,
    color: "#FFF",
    paddingRight: 20,
  },
  date: {
    fontFamily: "InterBold",
    fontSize: 15,
    color: "#FFF",
    opacity: 0.7,
    paddingRight: 20,
  },
  topDisplayRight: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: "center",
  },
  topButtons: {
    flexDirection: 'row',
    width: 65,
    justifyContent: "space-between",
    zIndex: 99,
  },
  pendingTaskBtn: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingTaskTxt: {
    fontFamily: "InterSemiBold",
    fontSize: 10,
    color: "#FFF"
  },
  progressBarWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 8,
    justifyContent: 'flex-end',
  },
  progressBar: {
    height: 60,
    width: '100%',
    justifyContent: "center",
  },
  progressBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: '8%',
    paddingLeft: '2%',
    paddingRight: '5%',
  },
  progressPercentTxt: {
    fontFamily: "InterBold",
    fontSize: 13,
    color: "#9D7957",
    paddingHorizontal: 5
  },
  calendarContainer: {
    width: 400,
    height: 105,
    backgroundColor: '#F4E6B0',
  },
  content: {
    alignItems: "center",
  },
  todoHeader: {
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: "space-between"
  },
  taskHeader: {
    fontFamily: "InterBold",
    color: "#5E4833",
    fontSize: 24,
    paddingRight: 20,
  },
  todoTasks: {
    marginHorizontal: 20,
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
  noTaskContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  noTaskTitle: {
    color: '#937254',
    fontFamily: "InterBold",
    fontSize: 24,
  },
  noTaskSubtitle: {
    color: '#937254',
    fontFamily: "InterSemiBold",
    fontSize: 16,
    marginTop: 5,

  },
  noTaskPendingBtn: {
    backgroundColor: "#5E4833",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  noTaskPendingTxt: {
    color: '#FFF',
    fontFamily: "InterBold",
    fontSize: 15,
  },


});
