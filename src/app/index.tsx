/* 
 * Temporary home screen.
 * Currently links to the auth screens for testing purpose.
*/

import { Link } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roost & Rise</Text>
      {/* Temporary navigation links for testing */}
      <Link href="/(auth)/sign-up" style={styles.link}>Sign Up</Link>
      <Link href="/(auth)/sign-in" style={styles.link}>Sign In</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  link: { fontSize: 16, color: '#0066cc' },
});
