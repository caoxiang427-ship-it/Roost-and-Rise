/*
* Sign-up screen.
* Allow a new user to create account with display name, email and password.
* On success, redirects to sign-in screen.
*/

import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { signUp } from '@/lib/auth';

export default function SignUpScreen() {
  // Tracks what the user types into each field with a loading flag for the button
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  // Runs when the user taps "Sign Up"
  async function handleSignUp() {
    // Block submission if any of the three fields is empty
    if (!email || !password || !displayName) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    setLoading(false);

    // Show the results to the users
    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert('Account created!', 'You can now sign in.');
      router.replace('/(auth)/sign-in');
    }
  }

  return (
    // Main container wrapper that groups all the elements
    <View style={styles.container}>
      {/* Screen title */}
      <Text style={styles.title}>Create Account</Text>

      {/* Display name input */}
      <TextInput
        style={styles.input}
        placeholder="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
      />
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
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {/* Submit button; shows loading text while waiting on Supabase */}
      <Pressable style={styles.button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
      </Pressable>

      {/* Navigation link for users who already have an account */}
      <Link href="/(auth)/sign-in" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </View>
  );
}

// Visual styling for the sign-up screen
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 8, marginTop: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, color: '#555' },
});
