import Onboarding from 'react-native-onboarding-swiper';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useProfileStore } from '@/store/useProfileStore';
import { Ionicons } from "@expo/vector-icons";
import { useState } from 'react';

export default function OnboardingScreen() {

  const {
    chickName,
    setChickName,
  } = useProfileStore();

  const router = useRouter();

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    router.replace('/(tabs)');
  };

  const [tempChickName, setTempChickName] = useState<string>('');

  return (
    <Onboarding
      onSkip={finishOnboarding}
      onDone={finishOnboarding}
      bottomBarColor="#FAF9F6"
      titleStyles={{fontFamily: 'InterBold', color: '#5E4833'}}
      subTitleStyles={{fontFamily: 'InterSemiBold', color: '#937254'}}
      SkipButtonComponent={(props) => (
        <TouchableOpacity {...props} style={{ paddingHorizontal: 40, paddingVertical: 20 }}>
          <Text style={{ fontFamily: 'InterBold', fontSize: 16, color: '#5E4833' }}>
            Skip
          </Text>
        </TouchableOpacity>
      )}
      NextButtonComponent={(props) => (
        <TouchableOpacity {...props} style={{ marginHorizontal: 40, paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#5E4833', borderRadius: 20 }}>
          <Text style={{ fontFamily: 'InterBold', fontSize: 16, color: '#ffffff' }}>
            Next
          </Text>
        </TouchableOpacity>
      )}
      DoneButtonComponent={(props) => (
        <TouchableOpacity {...props} style={{ marginHorizontal: 20, padding: 10, backgroundColor: '#5E4833', borderRadius: 20 }}>
          <Text style={{ fontFamily: 'InterBold', fontSize: 16, color: '#fff' }}>
            Get Started
          </Text>
        </TouchableOpacity>
      )}
      pages={[
        {
          backgroundColor: '#FAF9F6',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          ),
          title: `Welcome to Roost&Rise`,
          subtitle: 'A productivity app that puts your mental wellbeing first',
        },
        {
          backgroundColor: '#FAF9F6',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/chicken.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          ),
          title: 'Meet your virtual pet chicken',
          subtitle: (
            <>
            <Text style={{ fontFamily: "InterSemiBold", paddingHorizontal: 10, textAlign: 'center', fontSize: 16, color: '#937254' }}>
                From now on, they'll be your lifelong friend, here to support you through both your highs and lows
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20}}>
              <TextInput
                  value={tempChickName}
                  onChangeText={(val) => setTempChickName(val)}
                  placeholder="Give your chicken a name!"
                  placeholderTextColor={'#bcab9c'}
                  style={{
                  width: 220,
                  borderWidth: 2,
                  borderRadius: 20,
                  borderColor: '#5E4833',
                  paddingVertical: 8,
                  fontSize: 16,
                  textAlign: 'center',
                  fontFamily: 'InterBold',
                  color: '#5E4833'
                  }}
              />
              <TouchableOpacity 
                style={{
                  backgroundColor: '#5E4833',
                  borderRadius: 20,
                  padding: 5
                }}
                onPress={() => setChickName(tempChickName)}>
                <Ionicons name="checkmark-sharp" size={25} color="#ffffff"/>
              </TouchableOpacity>
            </View>
            </>
  ),
        },
        {
          backgroundColor: '#FAF9F6',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/chicken_xp.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          ),
          title: 'The XP system',
          subtitle: 'Notice how your chicken is currently an egg? Well Roost&Rise works on an XP system. Complete tasks, pomodoro sessions and self care activities to earn XP. Upon levelling up, your chicken will grow with you',
        },
        {
          backgroundColor: '#FAF9F6',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/pomodoro.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          ),
          title: 'The Pomodoro Timer',
          subtitle: 'Want to start focusing? Use the pomodoro timer to keep you on task! Customise your focus and break durations to your personal preferences',
        },
        {
          backgroundColor: '#FAF9F6',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/todo.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          ),
          title: 'To-do list',
          subtitle: 'Create, edit, and check off tasks for any day. Rank them by difficulty, flag the dreaded ones, and tackle what you can handle first.',
        },
        {
          backgroundColor: '#FAF9F6',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/study.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          ),
          title: 'AI Study Planner',
          subtitle: 'Featuring daily and weekly calendar views, easy drag to create or reschedule events. Tasks sync straight from your to-do list, and a familiar AI buddy to help you with any issues!'
        },
        {
          backgroundColor: '#FAF9F6',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/care.json')}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          ),
          title: 'Self Care Tab',
          subtitle: 'Productivity is not worth it if it’s at the expense of your mental wellbeing. Real-time burnout indicator, mood tracker, and daily self-care logs. Taking care of yourself is just as important as getting work done.'
        },
        {
          backgroundColor: '#FAF9F6',
          image: (
            <LottieView
              source={require('@/assets/images/onboarding/data.json')}
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