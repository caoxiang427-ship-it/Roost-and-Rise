/* 
 * Root layout for the app.
 * Set up the stack navigator that manages the screens.
 * Screens stack on top of each other and the "back" button pops the top screen off.
 * Every screen file is registered here.
*/

import { Stack } from 'expo-router';

// 
export default function RootLayout() {
  return (
    <Stack>
      {/* Home screen */}
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      {/* Auth screen */}
      <Stack.Screen name="(auth)/sign-up" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="(auth)/sign-in" options={{ title: 'Sign In' }} />
    </Stack>
  );
}


  
   
    
     
