import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
      backgroundColor: '#0492b5',
  },
  image: {
    width: 410,
    height: 340,
  },
  topDisplay: {
    flexDirection: 'row',
    justifyContent: "space-between"
  },

  topDisplayLeft: {
    marginTop: 110,
    marginLeft: 15,
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
    opacity: 0.6,
    paddingRight: 20,
  },
  topDisplayRight: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: "center",
    marginTop: 107,
    marginRight: 30,
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
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingTaskTxt: {
    fontFamily: "InterSemiBold",
    fontSize: 10,
    color: "#FFF"
  },
  calendarContainer: {
    width: 400,
    height: 105,
    backgroundColor: '#F4E6B0',
  },
  content: {
    alignItems: "center",
  },
  bottomDisplay: {
    backgroundColor: "#FFF",
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
    alignItems: "center",
    marginHorizontal: 20,
  },
  addBtn: {
    position: "absolute",
    backgroundColor: "rgb(59, 153, 185, 0.8)",
    borderRadius: 50,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    bottom: 25,
    right: 25,


  },


});
