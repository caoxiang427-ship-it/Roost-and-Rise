/* 
 * Sign-in screen.
 * Allows an existing user to log in the account with email and password.
 * If users successfully logged into their account, they are redirected to home screen.
*/

import { signIn } from '@/lib/auth';
import { styles } from '@/styles/auth_styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

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

    const result = await signIn(email, password);

    setLoading(false);

    if (result.error) {
      if (result.locked) {
        Alert.alert('Locked out', result.error);
      } else {
        Alert.alert('Sign in failed', result.error);
      }
      return;
    }

    router.replace('/');
  }

  async function handleGoogleSignIn() {
    setLoading(true);

    const result = await signInWithGoogle();

    setLoading(false);

    if (result.error) {
      const errorMessage =
        typeof result.error === 'string' ? result.error : result.error?.message ?? 'Something went wrong';
      Alert.alert('Google sign-in failed', errorMessage);
      return;
    }

    router.replace('/');
  }
  

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Image
            source={require('@/assets/images/auth/header.png')}
            style={styles.headerImg}
            resizeMode="cover"
          />

          <View style={styles.cardBody}>
            <View style={styles.welcomeBlock}>
              <Text style={styles.title}>Join Us</Text>
              <Text style={styles.subtitle}>Roost and Rise, one day at a time</Text>
            </View>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={17} color="#B08C3E" />
              <TextInput
                style={styles.inputFlex}
                onChangeText={setEmail}
                value={email}
                placeholder="name@email.com"
                placeholderTextColor="#C4B58E"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={17} color="#B08C3E" />
              <TextInput
                style={styles.inputFlex}
                onChangeText={setPassword}
                value={password}
                placeholder="Password"
                placeholderTextColor="#C4B58E"
                secureTextEntry
              />
            </View>

            <View style={ { height : 20 } } />

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Coming home 🪺...' : 'Sign in'}
              </Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={styles.googleButton} onPress={handleGoogleSignIn}>
              <Ionicons name="logo-google" size={17} color="#3D2914" />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </Pressable>

            <Text style={styles.footerText}>
              No account?{' '}
              <Link href="/(auth)/sign-up" style={styles.footerLink}>
                Create one now
              </Link>
            </Text>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}
