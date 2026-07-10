/*
 * Reset Password screen.
*/

import { useState } from 'react';
import { router } from 'expo-router';
import { updatePassword } from '@/lib/auth';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setLoading] = useState(false);

  function checkInput() {
    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirm) {
      Alert.alert('Error:', 'Both password fields are required');
      return false;
    }
    
    if (trimmedPassword.length < 6) {
      Alert.alert('Error:', 'Your new password must be at least 6 characters long.');
      return false;
    }

    if (trimmedPassword !== trimmedConfirm) {
      Alert.alert('Error:', 'Passwords do not match. Please try again.');
      return false;
    }

    return true;
  }

  async function handlePasswordReset() {
    const isValid = checkInput();

    if (!isValid) return;

    setLoading(true);

    const { error } = await updatePassword(newPassword);

    setLoading(false);

    if (error) {
      Alert.alert('Error:', error.message);
    } else {
      Alert.alert('Password successfully reset!');
      router.replace('/(auth)/sign-in');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a new password 🔑</Text>

      <TextInput
        style={styles.input}
        onChangeText={setNewPassword}
        value={newPassword}
        placeholder="New password (min 6 characters)"
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm password"
        secureTextEntry
      />

      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handlePasswordReset}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Updating...' : 'Update password'}
        </Text>
      </Pressable>
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
