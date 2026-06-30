import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { signOut } from '@/lib/auth'; 


export default function care() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Profile</Text>

      <Text style={styles.subtitle}>just a placeholder for now</Text>

      <Link href="/(tabs)" asChild>
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.txt}>Go back home</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity style={styles.btn} onPress={() => signOut()}>
         <Text style={styles.txt}>Log Out</Text>
       </TouchableOpacity>

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
  btn: {
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#3B99B9',
    borderRadius: 10,
  },
  txt: {
    fontFamily: 'InterBold',
     fontSize: 15,
      color: '#FFF'
  },
});