import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  headerWrapper: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: "space-between"
  },
  taskWrapper: {
    paddingHorizontal: 20,
  },
  items: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10
  },
  subtitle: {
    fontSize: 18,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#E8A33D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { 
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff' 
  },
  createTaskWrapper: {
    marginTop: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#434343",
    width: 300,
    height: 45,
    backgroundColor: '#FFF',
  },
  addTaskBtn: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: '#434343',
    borderWidth: 1,
    backgroundColor: "#FFF",
    justifyContent: 'center',
    alignItems: 'center'
  },
  addTask: {
    fontSize: 30,
    color: '#434343',
  },
});