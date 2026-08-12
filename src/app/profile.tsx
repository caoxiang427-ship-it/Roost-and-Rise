import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ScrollView, TextInput } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'expo-router';
import { signOut } from '@/lib/auth';
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfileStore } from '@/store/useProfileStore';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import InfoModal from '@/components/home/InfoModal';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function profile() {

  const insets = useSafeAreaInsets();
  const {name, setDisplayName, focusXpCap, progressXpCap, workloadThreshold, setFocusXpCap, setProgressXpCap, setWorkloadThreshold} = useProfileStore();

  const [editingName, setEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(name ?? '');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [infoModalType, setInfoModalType] = useState<'xp' | 'workload'>('xp');
  const [focusSliderValue, setFocusSliderValue] = useState<number>(focusXpCap ?? 580);
  const [progressSliderValue, setProgressSliderValue] = useState<number>(progressXpCap ?? 180);
  const [thresholdSliderValue, setThresholdSliderValue] = useState<number>(workloadThreshold ?? 36);
  const { avatarUrl, setAvatarPicture } = useProfileStore();

  const router = useRouter();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to set a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      await setAvatarPicture(result.assets[0].uri);
    }
  };


  // calculate AVERAGE (estimate) no. of focus hours inclusive of XP and multipliers
  const xpCapToApproxHours = (xpCap: number) => {
    const avgMultiplier = 1.25; // rough midpoint of 1.0–1.5
    // assuming 25 mins of focus and 5 mins of break
    const avgXPPerMinute = 
      ((25 * 1 + 5 * 0.5) / (25 + 5)) 
      * avgMultiplier;
    return (xpCap / avgXPPerMinute / 60).toFixed(2);
  };

  const calculateTasksFrmXP = (XP: number) => {
    const easyTasks = Math.floor(XP/5);
    const moderateTasks = Math.floor(XP/10);
    const hardTasks = Math.floor(XP/15);
    return [easyTasks, moderateTasks, hardTasks]
  };

  const calculateTasksFrmThreshold = (threshold: number) => {
    const easyTasks = threshold;
    const moderateTasks = Math.floor(threshold/2);
    const hardTasks = Math.floor(threshold/3);
    return [easyTasks, moderateTasks, hardTasks]
  };

  const textInputRef = useRef<TextInput>(null);

  const handleNameSave = () => {
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== name) {
      setDisplayName(trimmed);
    } else {
      setTempName(name); // revert if empty or unchanged
    }
    setEditingName(false);
  };

  const replayOnboarding = async () => {
    await AsyncStorage.removeItem('hasOnboarded');
    router.replace('/onboarding');
  };

  useEffect(() => {
    if (editingName) {
      textInputRef.current?.focus();
    }
  }, [editingName]);

  return (
    <View style={styles.container}>

      <View style={{paddingTop: insets.top + 20, paddingHorizontal: insets.left + 20}}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="chevron-back" size={25} color="#FFF"/>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',paddingHorizontal: insets.left + 30, paddingVertical: 10,}}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.logoutBtn}
          onPress={() => {
            Alert.alert("Log out", "Are you sure you want to logout of your account?", [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: () => {
                signOut();
              },
              style: "destructive",
            },
          ])}}>
          <Ionicons name='log-out-outline' size={35} color='#025673'></Ionicons>
        </TouchableOpacity>
      </View>
      
      <View style={{flexDirection: 'row', paddingHorizontal: insets.left + 30}}>
        <TouchableOpacity style={styles.selectImg} onPress={pickImage}>
            <Ionicons name='camera-outline' size={23} color='#FFF'></Ionicons>
        </TouchableOpacity>

        <View style={styles.displayName}>
          {editingName ?
            <TextInput
              ref={textInputRef}
              value={tempName}
              onChangeText={setTempName}
              onSubmitEditing={handleNameSave}
              placeholder='Name'
              placeholderTextColor={'#FFF'}
              style={styles.name}
              selectTextOnFocus
              onBlur={handleNameSave}
            /> :
            <Text style={styles.name}>{name}</Text>
          }
          <TouchableOpacity
            onPress={() => setEditingName(true)}>
            <Ionicons name='pencil' size={22} color='#5E90A1'></Ionicons>
          </TouchableOpacity>
        </View>

        <View style={styles.profilePicContainer}>
          <Image
            source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/default_profile.png')}
            style={styles.profilePic}
          />
        </View>
        <View>
          <Text style={styles.displayNameTxt}>Display name:</Text>
        </View>
      </View>

      <ScrollView style={styles.preferencesContainer}>
          <View style={{paddingTop: 20, paddingHorizontal: insets.left + 30}}>
            <Text style={styles.preferencesTitle}>Adjust Preferences</Text>
            <TouchableOpacity
              onPress={() => setIsExpanded(!isExpanded)}>
              <View style={{flexDirection: 'row', paddingVertical: 5}}>
                <Ionicons name={isExpanded ? "chevron-down": "chevron-forward"} color='#68A0B3' size={20}/>
                  <Text style={{fontFamily: "InterBold", color: '#68A0B3', fontSize: 17}}>How Roost&Rise works</Text>
              </View>
            </TouchableOpacity>

            {isExpanded &&
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
                <Text style={{fontFamily: 'InterSemiBold', color: '#8a8a8a'}}>
                  Roost&Rise works primarily on an XP system. Complete pomodoro sessions, tasks and self-care activities to gain XP to level up.
                  Our app incorporates daily XP caps and hidden workload scores to discourage overwork.
                  While we've preset the limits, we understand that everyone works differently, so feel free to customise them here!
                </Text>
              </Animated.View>
            }

            <View style={{flexDirection: 'row', gap: 5, paddingVertical: 10}}>
              <Text style={{fontFamily: 'InterBold', fontSize: 22, color: '#025673'}}>Daily XP Caps</Text>
              <TouchableOpacity
                onPress={() => {setInfoModalType('xp'); setInfoModalOpen(true)}}>
                <Ionicons name='information-circle-outline' size={30} color='#68A0B3'/>
              </TouchableOpacity>
            </View>

            <View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5}}>
                <View style={styles.xpCap}>
                  <Text style={styles.nameTxt}>Focus XP Cap</Text>
                </View>
                <Text style={styles.xpText}>{focusSliderValue} XP</Text>
              </View>

              <Text style={{fontFamily: 'InterSemiBold', color: '#68A0B3', fontSize: 15}}>[Pomodoro Timer]</Text>

              <View style={styles.sliderContainer}>
                <Slider
                  style={{width: '90%', height: 40}}
                  minimumValue={0}
                  maximumValue={1000}
                  value={focusSliderValue}
                  step={10}
                  onValueChange={(val) => setFocusSliderValue(Math.round(val))}
                  onSlidingComplete={(val) => setFocusXpCap(Math.round(val))}
                  minimumTrackTintColor="#86C2D8"
                  maximumTrackTintColor="#BCBCBC"
                />
              </View>

              <View style={{flexDirection: 'row', marginBottom: 10}}>
                <Text style={styles.noteTxt}>Equivalent to about: </Text>
                <Text style={[styles.highlightedTxt, {paddingRight: insets.right + 5} ]}>{xpCapToApproxHours(focusSliderValue)} hours of focused work {'\n'} (estimated)</Text>
              </View>
            </View>

            <View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5}}>
                <View style={styles.xpCap}>
                  <Text style={styles.nameTxt}>Progress XP Cap</Text>
                </View>
                <Text style={styles.xpText}>{progressSliderValue} XP</Text>
              </View>

              <Text style={{fontFamily: 'InterSemiBold', color: '#68A0B3', fontSize: 15}}>[Todo list]</Text>

              <View style={styles.sliderContainer}>
                <Slider
                  style={{width: '90%', height: 40}}
                  minimumValue={0}
                  maximumValue={400}
                  value={progressSliderValue}
                  step={10}
                  onValueChange={(val) => setProgressSliderValue(Math.round(val))}
                  onSlidingComplete={(val) => setProgressXpCap(Math.round(val))}
                  minimumTrackTintColor="#86C2D8"
                  maximumTrackTintColor="#BCBCBC"
                />
              </View>

              <View style={{flexDirection: 'row', marginBottom: 10}}>
                <Text style={styles.noteTxt}>Equivalent to about: </Text>
                <Text style={[styles.highlightedTxt, {paddingRight: insets.right + 5}]}>
                  {calculateTasksFrmXP(progressSliderValue)[0]} easy tasks OR{'\n'}
                  {calculateTasksFrmXP(progressSliderValue)[1]} moderate tasks OR{'\n'}
                  {calculateTasksFrmXP(progressSliderValue)[2]} hard tasks
                </Text>
              </View>
            </View>

            <View style={{flexDirection: 'row', gap: 5, paddingVertical: 10}}>
              <Text style={{fontFamily: 'InterBold', fontSize: 22, color: '#025673'}}>Daily Workload Score</Text>
              <TouchableOpacity
                onPress={() => {setInfoModalType('workload'); setInfoModalOpen(true)}}>
                <Ionicons name='information-circle-outline' size={30} color='#68A0B3'/>
              </TouchableOpacity>
            </View>

            <View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5}}>
                <View style={styles.xpCap}>
                  <Text style={styles.nameTxt}>Threshold</Text>
                </View>
                <Text style={styles.xpText}>{thresholdSliderValue} XP</Text>
              </View>

              <Text style={{fontFamily: 'InterSemiBold', color: '#68A0B3', fontSize: 15}}>[Todo list]</Text>

              <View style={styles.sliderContainer}>
                <Slider
                  style={{width: '90%', height: 40}}
                  minimumValue={0}
                  maximumValue={100}
                  value={thresholdSliderValue}
                  step={1}
                  onValueChange={(val) => setThresholdSliderValue(Math.round(val))}
                  onSlidingComplete={(val) => setWorkloadThreshold(Math.round(val))}
                  minimumTrackTintColor="#86C2D8"
                  maximumTrackTintColor="#BCBCBC"
                />
              </View>

              <View style={{flexDirection: 'row', marginBottom: 60}}>
                <Text style={styles.noteTxt}>Equivalent to about: </Text>
                <Text style={[styles.highlightedTxt, {paddingRight: insets.right + 5}]}>
                  {calculateTasksFrmThreshold(thresholdSliderValue)[0]} easy tasks OR{'\n'}
                  {calculateTasksFrmThreshold(thresholdSliderValue)[1]} moderate tasks OR{'\n'}
                  {calculateTasksFrmThreshold(thresholdSliderValue)[2]} hard tasks
                </Text>
              </View>
            </View>

          </View>
      </ScrollView>

      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgb(255, 255, 255)']}
        style={styles.bottomFade}
        pointerEvents="none"/>
      
      <InfoModal 
        visible={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)}
        type={infoModalType}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#66A5B9',
  },
  backBtn: {
    backgroundColor: '#ffffff58',
    alignSelf: 'flex-start',
    padding: 2,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#FFF'
  },
  title: {
    fontSize: 36,
    color: '#FFF',
    fontFamily: 'InterBold',
  },
  logoutBtn: {
    backgroundColor: '#FFF',
    borderRadius: 50,
    padding: 7,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
  profilePicContainer: {
    zIndex: 2,
     // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
  profilePic: {
    borderRadius: 50,
    resizeMode: 'contain',
    width: 80,
    height: 80,
    borderWidth: 3,
    borderColor: '#025673',
  },
  displayNameTxt: {
    fontFamily: 'InterSemiBold',
    color: '#ffffffc0',
    fontSize: 18,
  },
  selectImg: {
    backgroundColor: '#025673',
    borderRadius: 50,
    position: 'absolute',
    padding: 7,
    left: 90,
    top: 55,
    zIndex: 3,
     // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 2,
  },
  displayName: {
    position: 'absolute',
    top: 25,
    left: 90,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#025673',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    paddingLeft: 40,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  name: {
    fontFamily: "InterBold",
    color: '#025673',
    fontSize: 25,
  },
  preferencesContainer: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    marginTop: 30,
    flex: 1,
  },
  preferencesTitle: {
    fontFamily: "InterBold",
    color: '#025673',
    fontSize: 25,
  },
  xpCap: {
    backgroundColor: '#025673',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  nameTxt: {
    color: '#FFF',
    fontFamily: 'InterBold',
    fontSize: 18,
  },
  xpText: {
    fontFamily: 'InterBold',
    color: '#025673',
    fontSize: 20
  },
  sliderContainer: {
    borderWidth: 3,
    borderRadius: 10,
    marginVertical: 15,
    borderColor: '#5E90A1',
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  noteTxt: {
    fontFamily: 'InterSemiBold',
    color: '#025673',
    fontSize: 15
  },
  highlightedTxt: {
    fontFamily: 'InterBold',
    color: '#3ea7ca',
    fontSize: 15,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
  },
});