/* 
 * Home screen. 
 * Only logged in users reach this page.
 * Handle log out.
*/

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { View, Text, TouchableOpacity, Image, TextInput} from 'react-native';
import { styles } from '../../styles/index_styles';
import { ImageBackground } from 'expo-image';
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Store from '@/components/home/Store';
import Inventory from '@/components/home/Store';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import SpeechBubble from '@/components/home/SpeechBubble';

export default function HomeScreen() {

  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [chickName, setChickName] = useState('');

  // ref for store and inventory. bottom sheet
  const storeRef = useRef<BottomSheet>(null);
  const inventoryRef = useRef<BottomSheet>(null);

  useEffect(() => {
    async function getUserProfile() {
      const { data: {user} } = await supabase.auth.getUser();

      if (user) {
        const metadataName = user.user_metadata?.display_name;

        if (metadataName) {
          setName(metadataName);
        } else {
          const { data } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();

          if (data) setName(data.display_name ?? '');
        }
      }
    }
    getUserProfile();
  }, []);

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

  const openStoreSheet = () => storeRef.current?.expand();
  const openInventorySheet = () => storeRef.current?.expand();

  const closeStoreSheet = () => storeRef.current?.close();
  const closeInventorySheet = () => storeRef.current?.close();

  const encouragingMsg = [
    ""
  ]
  
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
              <TouchableOpacity style={styles.volume} onPress={() => console.log('toggle sound')}>
                <Ionicons name="volume-high" size={30} color="#FFF"/>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => console.log('settings')}>
                <Ionicons name="settings-sharp" size={30} color="#FFF"/>
              </TouchableOpacity>
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
                    <Text style={[styles.InterBold, {color: '#937254', fontSize: 13}]}>100</Text>
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
                <TouchableOpacity style={styles.moodTrackerBtn} onPress={() => console.log('Mood tracker')}>
                  <Text 
                    style={[styles.InterBold, {color: "#FFF", fontSize: 15}]}>Happy 😊</Text>
                </TouchableOpacity>

                <View style={styles.xp}>
                  <View style={styles.xpBarOuter}>
                    <View style={styles.xpBarInner}>
                      <LinearGradient
                        colors={['#3F6D38', '#00BC22']}
                        style={{
                        width: '100%',
                        height: '80%',       // progress value
                        position: 'absolute',
                        top: 0,
                        borderRadius: 10,
                      }}
                      />
                    </View>
                  </View>
                  <View style={styles.xpTop}>
                    <Text style={[styles.InterBold, {fontSize: 10, color: '#5E4833'}]}>LVL</Text>
                    <Text style={[styles.InterBold, {fontSize: 26, color: '#5E4833'}]}>10</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.pet}>
              <View style={styles.petName}>
                <TextInput 
                  placeholder={'enter name'} 
                  style={[styles.InterBold, {fontSize: 20, color: "#025673"}]}
                  value={chickName}
                  onChangeText={name => setChickName(name)}></TextInput>
              </View>
              <Image
                source={require('../../../assets/images/home/chicken.png')}
                style={{width: 206, height: 225 }}
              ></Image>
            </View>
            
            {chickName === '' &&
            <SpeechBubble text='Please give me a name!'></SpeechBubble>
            }

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

            <View style={styles.focusContainer}>
              <View style={styles.focusSession}>
                <Text style={[styles.InterBold, {color: '#FFF', fontSize: 15}]}>Start focus session!</Text>
              </View>
              <TouchableOpacity style={styles.timer}>
                <Text style={[styles.InterBold, {color: '#127FA7', fontSize: 60}]}>25:00</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.gameBtnsColumn} />
          </View>

          <Store ref={storeRef} close={closeStoreSheet}></Store>
          <Inventory ref={inventoryRef} close={closeInventorySheet}></Inventory>
          
      </ImageBackground>
    </View>
  );
}
