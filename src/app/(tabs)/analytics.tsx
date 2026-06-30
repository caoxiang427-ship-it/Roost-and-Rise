import { StyleSheet, Text, View } from 'react-native';

export default function analytics() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics page</Text>
      <Text style={styles.subtitle}>placeholder.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#383838',
    marginTop: 8,
  },
});