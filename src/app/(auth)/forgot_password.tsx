/*
 * Forget password screen.
 * Entering email, will send a password reset link to the user.
*/

import { resetPasswordRequest, verifyResetCode } from '@/lib/auth';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isLoading, setLoading] = useState(false);

  async function handleSendCode() {
    if (!email.trim()) {
      Alert.alert('Error:', 'Please enter your email address');
      return;
    }

    setLoading(true);
    const { error } = await resetPasswordRequest(email.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setStep('code');
  }

  async function handleVerifyCode() {
    if (code.trim().length !== 6) {
      Alert.alert('Error:', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    const { error } = await verifyResetCode(email.trim(), code.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Invalid code', error.message);
      return;
    }
    router.replace('/(auth)/reset_password');
  }

  return (
    <View style={styles.container}>
      {step === 'email' ? (
        <View>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we will send you a 6-digit code.
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
            onPress={handleSendCode}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Send code'}
            </Text>
          </Pressable>

          <Link href="/(auth)/sign-in" style={styles.link}>
            Back to sign in
          </Link>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Check your inbox 📧</Text>
          <Text style={styles.successMessage}>
            We sent a 6-digit code to {email}.
          </Text>

          <TextInput
            style={styles.input}
            onChangeText={setCode}
            value={code}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
          />

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyCode}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify code'}
            </Text>
          </Pressable>

          <Pressable onPress={() => setStep('email')}>
            <Text style={styles.link}>Use a different email</Text>
          </Pressable>
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
