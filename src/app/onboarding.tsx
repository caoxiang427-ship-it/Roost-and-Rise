import Onboarding from 'react-native-onboarding-swiper';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TextInput } from 'react-native';
import { useProfileStore } from '@/store/useProfileStore';

export default function OnboardingScreen() {

  const {
    name,
    chickName,
    setChickName,
  } = useProfileStore();

  const router = useRouter();

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    router.replace('/(tabs)');
  };

  return (
    <Onboarding
      onSkip={finishOnboarding}
      onDone={finishOnboarding}
      pages={[
        {
          backgroundColor: '#FAF9F6',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          ),
          title: `Welcome ${name} to Roost&Rise`,
          subtitle: 'A productivity app that puts your mental wellbeing first',
        },
        {
          backgroundColor: '#FAF9F6',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          ),
          title: 'Meet your virtual pet chicken',
          subtitle: (
            <>
            <Text style={{ textAlign: 'center', fontSize: 16, color: '#666' }}>
                From now on, they'll be your lifelong friend, here to support you through both your highs and lows
            </Text>
            <TextInput
                value={chickName}
                onChangeText={(val) => setChickName(val)}
                placeholder="Give your chicken a name!"
                style={{
                marginTop: 20,
                width: 220,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
                paddingVertical: 8,
                fontSize: 16,
                textAlign: 'center',
                }}
            />
            </>
  ),
        },
        {
          backgroundColor: '#fff',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          ),
          title: 'The XP system',
          subtitle: 'Notice how your chicken is currently an egg? Well Roost&Rise works on an XP system. Complete tasks, pomodoro sessions and self care activities to earn XP. Upon levelling up, your chicken will grow with you',
        },
        {
          backgroundColor: '#fff',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          ),
          title: 'The Pomodoro Timer',
          subtitle: 'Want to start focusing? Use the pomodoro timer to keep you on task! Customise your focus and break durations to your personal preferences',
        },
        {
          backgroundColor: '#fff',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          ),
          title: 'To-do list',
          subtitle: 'Create, edit, and check off tasks for any day. Rank them by difficulty, flag the dreaded ones, and tackle what you can handle first.',
        },
        {
          backgroundColor: '#fff',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          ),
          title: 'AI Study Planner',
          subtitle: 'Featuring daily and weekly calendar views, easy drag to create or events rescheduling.. Tasks sync straight from your to-do list — and you have a familiar AI buddy to help you with any issues you arise.'
        },
        {
          backgroundColor: '#fff',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          ),
          title: 'Self Care Tab',
          subtitle: 'Productivity is not worth it if it’s at the expense of your mental wellness. Recharge and take some time for yourself here! Real-time burnout indicator, mood tracker, and daily self-care logs — Taking care of yourself is just as important as getting work done.'
        },
        {
          backgroundColor: '#fff',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          ),
          title: 'Data Analytics',
          subtitle: 'Weekly view for a quick check-in, calendar view for the big picture. Track study habits, self-care, and mood in one place — plus habit predictions to help you stay ahead.'
        },
        
      ]}
    />
  );
}