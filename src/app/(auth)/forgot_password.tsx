/*
 * Forget password screen.
 * Entering email, will send a password reset link to the user.
*/

import { useState } from 'react';
import { Link, router } from 'expo-router';
import { resetPasswordRequest } from '@/lib/auth';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setLoading] = useState(false);

  function checkInput() {
    if (!email.trim()) {
      Alert.alert('Error:', 'Please enter your email address');
      return false;
    }
    return true;
  }

  async function handleRequestForReset() {
    const isValid = checkInput();

    if (!isValid) return;

    setLoading(true);

    const { error } = await resetPasswordRequest(email);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setIsEmailSent(true);
    }
  }

  // email entry (email hasen't sent) OR confirmation (sent)
  return (
    <View style={styles.container}>
      {!isEmailSent ? (
        <View>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we will send you a reset link.
          </Text>
          
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRequestForReset}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Text>
          </Pressable>

          <Link href="/(auth)/sign-in" style={styles.link}>
            Back to sign in
          </Link>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Check your email inbox 📧</Text>
          <Text style={styles.successMessage}>
            We sent a reset link to {email}. Tap the link to set a new password.
          </Text>
          <Link href="/(auth)/sign-in" style={styles.link}>
            Back to sign in
          </Link>
        </View>
      )}
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
    marginBottom: 8,
    color: '#5C4A1A'
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    color: '#A67C2E'
  },
  successMessage: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
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
    alignItems: 'center',
    backgroundColor: '#E8A33D'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF'
  },
  link: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    color: '#A67C2E' 
  },
  buttonDisabled: { opacity: 0.6 },
});
