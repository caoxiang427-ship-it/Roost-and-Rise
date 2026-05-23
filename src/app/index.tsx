/* 
 * Home screen. 
 * Only logged in users reach this page.
 * Handle log out.
*/

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth'; 
import { StyleSheet, View, Text, Pressable } from 'react-native';

export default function HomeScreen() {
  const[name, setName] = useState('');

  useEffect(() => {
    async function getUserProfile() {
      const { data: {user} } = await supabase.auth.getUser();

      if (user) {
        const metadataName = user.user_metadata?.display_name;

        if (metadataName) {
          setName(metadataName);
        } else {
          const { data } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();

          if (data) setName(data.display_name ?? '');
        }
      }
    }
    getUserProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roost & Rise</Text>
      <Text style={styles.welcome}>Welcome, {name || 'friend'}!</Text>
      
      <Pressable style={styles.button} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 24,
    gap: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFF9E6'
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#5C4A1A' 
  },
  welcome: {
    fontSize: 18,
    color: '#A67C2E'
  },
  button: {
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: '#E8A33D'
  },
  buttonText: { 
    fontSize: 16,
    fontWeight: '600', 
    color: '#fff' 
  },
});
