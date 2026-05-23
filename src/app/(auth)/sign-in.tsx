/* 
 * Sign-in screen.
 * Allows an existing user to log in the account with email and password.
 * If users successfully logged into their account, they are redirected to home screen.
*/

import { useState } from 'react';
import { Link, router } from 'expo-router';
import { signIn } from '@/lib/auth';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);

  function checkInputs() {
    if (!email || !password) {
      Alert.alert('Please fill in all fields');
      return false;
    }
    return true;
  }

  async function handleSignIn() {
    const isValid = checkInputs();

    if (!isValid) return;    

    setLoading(true);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      Alert.alert('Sign in failed', error.message);
    } else {
      // go to home screen
      router.replace('/');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome! 🐔</Text>

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
        value={password}
        placeholder="Password"
        secureTextEntry
      />

      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleSignIn} 
        disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Coming home 🪺...' : 'Sign In'}</Text>
      </Pressable>

      <Link href="/(auth)/sign-up" style={styles.link}>
        No account yet? Sign up now
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
