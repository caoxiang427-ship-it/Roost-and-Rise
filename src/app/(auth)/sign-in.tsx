/* 
 * Sign-in screen.
 * Allows an existing user to log in the account with email and password.
 * On success, redirects the user to home screen.
*/

import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { signIn } from '@/lib/auth';

export default function SignInScreen() {
  // Track input fields and the loading flag for the button
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Runs when the user taps "Sign In"
  async function handleSignIn() {
    // Block submission of any of the two fields is empty
    if (!email || !password) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    // Show the error to the users or send users to home screen on success
    if (error) {
      Alert.alert('Sign in failed', error.message);
    } else {
      router.replace('/');
    }
  }

  return (
    // Main container wrapper that groups all the elements
    <View style={styles.container}>
      {/* Screen title */}
      <Text style={styles.title}>Welcome Back</Text>

      {/* Email input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {/* Password input (hidden characters) */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Submit button; shows loading text while waiting on Supabase */}
      <Pressable style={styles.button} onPress={handleSignIn} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </Pressable>

      {/* Navigation link for users who don't have an account yet */}
      <Link href="/(auth)/sign-up" style={styles.link}>
        No account yet? Sign up
      </Link>
    </View>
  );
}

// Visual styling for the sign-in screen
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 8, marginTop: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, color: '#555' },
});
