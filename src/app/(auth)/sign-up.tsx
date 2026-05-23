/*
* Sign-up screen.
* Allow a new user to create account with name, email and password.
* After the user is successfully signed up, will redirect to sign-in screen to log in. 
*/

import { useState } from 'react';
import { signUp } from '@/lib/auth';
import { Link, router } from 'expo-router';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setLoading] = useState(false);

  function checkInputs() {
    if (!email || !password || !name) {
      Alert.alert('Please fill in all fields');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Password must be at least 6 characters');
      return false;
    }

    return true;
  }


  async function handleSignUp() {
    const isValid = checkInputs();
    
    if (!isValid) return;

    setLoading(true);

    const { error } = await signUp(email, password, name);

    setLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert('Account created! 🎉', 'Sign in and start your journey 🐣.');
      // replace so the back button won't return to sign up
      router.replace('/(auth)/sign-in');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hatch your account 🥚</Text>

      <TextInput
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholder="What should we call you?"
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        placeholder="Password (min 6 characters)"
        value={password}
        secureTextEntry
      />
      
      <Pressable 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleSignUp} 
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Hatching...' : 'Sign Up'}</Text>
      </Pressable>

      <Link href="/(auth)/sign-in" style={styles.link}>
        Already have an account? Sign in now
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 24,
    gap: 12, 
    justifyContent: 'center',
    backgroundColor: '#FFF9E6' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold',
    textAlign: 'center', 
    marginBottom: 16,
    color: '#5C4A1A' 
  },
  input: { 
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    borderColor: '#E0D4A8',
    backgroundColor: '#FFFFFF', 
    color: '#3D3220'
  },
  button: { 
    padding: 14,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#E8A33D'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF'
  }, 
  link: { 
    textAlign: 'center', 
    marginTop: 16, 
    color: '#A67C2E' 
  },
  buttonDisabled: { opacity: 0.6 },
});
