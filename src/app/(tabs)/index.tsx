/* 
 * Home screen. 
 * Only logged in users reach this page.
*/

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator} from 'react-native';
import { styles } from '../../styles/index_styles';
import { ImageBackground } from 'expo-image';
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Store from '@/components/home/Store';
import Inventory from '@/components/home/Inventory';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import SpeechBubble from '@/components/home/SpeechBubble';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { imageMap } from '@/constants/storeItems';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getTodaysMood } from '@/lib/self-care';
import LevelUp from '@/components/home/LevelUp';
import { useProfileStore, calculateXPLevel, totalXpRequiredForLevel } from '@/store/useProfileStore';

export default function HomeScreen() {

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isMute, setIsMute] = useState<boolean>(false);
  const [showSpeech, setShowSpeech] = useState<boolean>(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  // temp local copy of chickname while user is typing so it syncs with saved value
  const [chickNameDraft, setChickNameDraft] = useState<string>('');

  const {
    name,
    chickName,
    equippedItemId,
    xp,
    coins,
    isLoading,
    pendingLevelUp,
    clearLevelUp,
    init,
    setChickName,
  } = useProfileStore();

  // ref for store and inventory. bottom sheet
  const storeRef = useRef<BottomSheet>(null);
  const inventoryRef = useRef<BottomSheet>(null);

  useEffect(() => {
    init();
  }, []);
  
  useEffect(() => {
    setChickNameDraft(chickName);
  }, [chickName]);

  useFocusEffect(
    useCallback(() => {
      loadCurrentMood();
    }, [])
  );

  async function loadCurrentMood() {
    const mood = await getTodaysMood();
    setCurrentMood(mood);
  }

  function getMoodEmoji(mood: string | null) {
    switch (mood) {
      case 'exhausted': return '😩 Exhausted';
      case 'stressed':  return '😣 Stressed';
      case 'okay':      return '😐 Okay';
      case 'good':      return '🙂 Good';
      case 'great':     return '😄 Great';
      default:          return 'Log mood 🤔';
    }
  }

  const getDailyGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) return 'Good\nMorning!';
    else if (hour >= 6 && hour < 18) return 'Good\nAfternoon!';
    else if (hour >= 6 && hour < 24) return 'Good\nEvening!';
    return 'Time to rest 💤';
  };

  const getDate = () => {
    const today = new Date();
    const day = today.toLocaleDateString('en-GB', { weekday: 'long' });
    const date = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return `${day} ${date}`;
  };
  

  // functions to open/ close store and inventory bottom sheets
  const openStoreSheet = () => storeRef.current?.expand();
  const openInventorySheet = () => inventoryRef.current?.expand();

  const closeStoreSheet = () => storeRef.current?.close();
  const closeInventorySheet = () => inventoryRef.current?.close();

  const petMsg = [
    "You're doing amazing!",
    "Keep it up, you've got this!",
    "Time to lock in? or rest! both are great",
    "Another day, another win!",
    "Take it one day at a time",
    "YAY keep going!",
    "Please don't eat chicken for dinner",
    "Keep pecking!",
    "I hate going for lectures",
    "I'm so sleepy, what about you?",
    "Take care of yourself <3",
    "How are you feeling today?"
  ]

  // function to show speech bubble temporarily when being pet
  const showMessage = () => {
    setShowSpeech(true);
    setTimeout(() => setShowSpeech(false), 3000); // hides after 3 seconds
  };

  // function to detect "petting motion" -> just swiping
  const pet = Gesture.Pan()
    .onStart((e) => {
      console.log('petted!');
      runOnJS(showMessage)();
  });

  const calculateXpProgress = (xp: number) => {
    const level = calculateXPLevel(xp);
    const currentLevelXP = totalXpRequiredForLevel(level);
    const nextLevelXP = totalXpRequiredForLevel(level + 1);
    return (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
  };

  if (isLoading) {
    return (
     <ImageBackground
      source={require("../../../assets/images/home/home_background.png")}
      style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
      <ActivityIndicator size="large" color="#FFF" />
    </ImageBackground>
    )
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/home/home_background.png")}
        style={styles.container}>
          <View style={[styles.header, {paddingTop: insets.top + 12, paddingLeft: insets.left + 25, paddingRight: insets.right + 30}]}>
            <Link href="../profile" asChild>
            <TouchableOpacity style={styles.profile}>
              <Ionicons name="person-outline" size={30} color="#5E90A1"/>
            </TouchableOpacity>
            </Link>

            <View style={styles.headerBtns}>
              <TouchableOpacity style={styles.volume} onPress={() => setIsMute(!isMute)}>
                <Ionicons name={isMute ? "volume-mute" : "volume-high"} size={30} color="#FFF"/>
              </TouchableOpacity>

              <Link href="../settings" asChild>
                <TouchableOpacity onPress={() => console.log('settings')}>
                  <Ionicons name="settings-sharp" size={30} color="#FFF"/>
                </TouchableOpacity>
              </Link>
            </View>

          </View>

          <View>
            <View style={[styles.topDisplay, {paddingHorizontal: insets.left}]}>
              <View style={styles.topDisplayLeft}>
                <Text 
                  style={[styles.InterBold, {color: 'rgba(255, 255, 255, 0.6)', fontSize: 16}]}>{getDate()}</Text>

                <Text 
                  style={[styles.InterBold, {color: '#FFF', fontSize: 34}]}>{getDailyGreeting()}</Text>

                <Text 
                  style={[styles.InterBold, {color: '#FFF0B2', fontSize: 30}]}>{name}</Text>

                <View style={styles.coin}>
                  <View style={styles.coinBar}>
                    <Text style={[styles.InterBold, {color: '#937254', fontSize: 13}]}>{coins}</Text>
                  </View>

                  <Image
                    source={require('../../../assets/images/home/coin.png')}
                    style={[styles.coinImage]}
                  ></Image>
                </View>
              </View>

              <View style={styles.topDisplayRight}>
                <Text
                  style={[styles.InterBold, {color: '#FFF', fontSize: 12}]}>I'm feeling:</Text>
                <TouchableOpacity style={styles.moodTrackerBtn} onPress={() => router.push('/(tabs)/care')}>
                  <Text 
                    style={[styles.InterBold, {color: "#FFF", fontSize: 15}]}>{getMoodEmoji(currentMood)}</Text>
                </TouchableOpacity>

                <View style={styles.xp}>
                  <View style={styles.xpBarOuter}>
                    <View style={styles.xpBarInner}>
                      <LinearGradient
                        colors={['#3F6D38', '#00BC22']}
                        style={{
                        width: '100%',
                        height: `${calculateXpProgress(xp) * 100}%`,       // progress value
                        position: 'absolute',
                        top: 0,
                        borderRadius: 10,
                      }}
                      />
                    </View>
                  </View>
                  <View style={styles.xpTop}>
                    <Text style={[styles.InterBold, {fontSize: 10, color: '#5E4833'}]}>LVL</Text>
                    <Text style={[styles.InterBold, {fontSize: 26, color: '#5E4833'}]}>{calculateXPLevel(xp)}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.pet}>
              <View style={styles.petName}>
                <TextInput 
                  placeholder={'enter name'} 
                  style={[styles.InterBold, {fontSize: 20, color: "#025673"}]}
                  value={chickNameDraft}
                  onChangeText={name => setChickNameDraft(name)} // update local state after every keystroke
                  onSubmitEditing={() => setChickName(chickNameDraft)} // save to DB only when done
                  ></TextInput>
              </View>
              <GestureDetector gesture={pet}>
                <Image
                  source={ equippedItemId === null ? require('../../../assets/images/home/chicken.png')
                    : imageMap[equippedItemId]
                  }
                  style={{width: 206, height: 225 }}
                ></Image>
              </GestureDetector>
            </View>
            
            {chickName === '' &&
            <SpeechBubble text='Please give me a name!'></SpeechBubble>
            }
            {showSpeech && <SpeechBubble text={petMsg[Math.floor(Math.random() * (petMsg.length))]}></SpeechBubble>}

          </View>


          <View style={styles.bottomDisplay}>
            <View style={styles.gameBtnsColumn}>
              <TouchableOpacity style={styles.gameBtns} onPress={openStoreSheet}>
                <Ionicons name="bag-handle" size={30} color="#5E4833"/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.gameBtns} onPress={openInventorySheet}>
                <Ionicons name="color-palette" size={30} color="#5E4833"/>
              </TouchableOpacity>
            </View>

          <TouchableOpacity 
            style={styles.focusContainer}
            onPress={() => router.push('/(tabs)/pomodoro_timer')}
          >
            <View style={styles.focusSession}>
              <Text style={[styles.InterBold, {color: '#FFF', fontSize: 15}]}>
                Start focus session!
              </Text>
            </View>
            <View style={styles.timer}>
              <Text style={[styles.InterBold, {color: '#127FA7', fontSize: 60}]}>25:00</Text>
            </View>
          </TouchableOpacity>

            <View style={styles.gameBtnsColumn} />
          </View>

          <Store 
            ref={storeRef} 
            close={closeStoreSheet}
            ></Store>

          <Inventory 
            ref={inventoryRef} 
            close={closeInventorySheet}></Inventory>

          <LevelUp 
            visible={pendingLevelUp !== null} 
            onClose={clearLevelUp}
            level={pendingLevelUp?.level ?? 1}
            coinsEarned={pendingLevelUp?.coinsEarned ?? 0}
          />
          
      </ImageBackground>
    </View>
  );
}
