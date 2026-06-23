/*
* Sign-up screen.
* Allow a new user to create account with name, email and password.
* After the user is successfully signed up, will redirect to sign-in screen to log in. 
*/

import { useState } from 'react';
import { Link, router } from 'expo-router';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { signUp, signInWithGoogle } from '@/lib/auth';

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

  // Does not work!
  async function handleGoogleSignIn() {
    setLoading(true);
    
    const result = await signInWithGoogle();
    
    setLoading(false);
  
    if (result.error) {
      Alert.alert('Google sign-up failed', result.error);
      return;
    }
  
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <View style={styles.formWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>We're glad you joined us 🐔</Text>
        </View>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          onChangeText={setName}
          value={name}
          placeholder="What should we call you?"
          autoCapitalize="words"
        />
      
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
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
          <Text style={styles.buttonText}>
            {isLoading ? 'Hatching...' : 'Create an Account'}
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
        >
          <Text style={styles.googleIcon}>G</Text>
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
  );
}      

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE8B8',
    justifyContent: 'center',
    padding: 24,
  },
  formWrapper: {
    gap: 8,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3D2914',
  },
  subtitle: {
    fontSize: 13,
    color: '#8B6F3F',
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D2914',
    marginTop: 4,
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0D4A8',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#3D2914',
  },
  forgotLink: {
    fontSize: 13,
    color: '#A67C2E',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#E8A33D',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0D4A8',
  },
  dividerText: {
    fontSize: 13,
    color: '#8B6F3F',
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E0D4A8',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D2914',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
  },
  googleButtonText: {
    color: '#3D2914',
    fontSize: 15,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    color: '#8B6F3F',
    textAlign: 'center',
    marginTop: 10,
  },
  footerLink: {
    color: '#A67C2E',
    fontWeight: 'bold',
  },
});

