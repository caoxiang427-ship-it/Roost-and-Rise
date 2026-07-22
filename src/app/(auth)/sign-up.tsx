/*
* Sign-up screen.
* Allow a new user to create account with name, email and password.
* After the user is successfully signed up, will redirect to sign-in screen to log in. 
*/

import { signInWithGoogle, signUp } from '@/lib/auth';
import { styles } from '@/styles/auth_styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

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
      Alert.alert('Sign up failed', String(error.message));
    } else {
      Alert.alert('Account created! 🎉', 'Sign in and start your journey 🐣.');
      router.replace('/(auth)/sign-in');
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);

    const result = await signInWithGoogle();

    setLoading(false);

    if (result.error) {
      const errorMessage =
        typeof result.error === 'string'
          ? result.error
          : (result.error?.message ?? 'Something went wrong');
      Alert.alert('Google sign-up failed', errorMessage);
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
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sunny has been waiting for you</Text>
            </View>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={17} color="#B08C3E" />
              <TextInput
                style={styles.inputFlex}
                onChangeText={setName}
                value={name}
                placeholder="What should we call you?"
                placeholderTextColor="#C4B58E"
                autoCapitalize="words"
              />
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
                placeholder="Min 6 characters"
                placeholderTextColor="#C4B58E"
                secureTextEntry
              />
            </View>

            <View style={ { height : 20 } } />

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Hatching...' : 'Create account'}
              </Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={styles.googleButton} onPress={handleGoogleSignIn}>
              <Ionicons name="logo-google" size={17} color="#3D2914" />
              <Text style={styles.googleButtonText}>Sign up with Google</Text>
            </Pressable>

            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Link href="/(auth)/sign-in" style={styles.footerLink}>
                Log in now
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
