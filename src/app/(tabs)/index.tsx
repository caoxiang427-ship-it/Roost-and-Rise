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
import Inventory from '@/components/home/Inventory';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import SpeechBubble from '@/components/home/SpeechBubble';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { imageMap } from '@/constants/storeItems';

export default function HomeScreen() {

  const insets = useSafeAreaInsets();
  const [name, setName] = useState<string>('');
  const [chickName, setChickName] = useState<string>('');
  const [xp, setXP] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [equippedItemID, setEquippedItemID] = useState<number | null>(null);
  const [showSpeech, setShowSpeech] = useState<boolean>(false);
  const [ownedItemsIds, setOwnedItemsIds] = useState<number[]>([]);

  // ref for store and inventory. bottom sheet
  const storeRef = useRef<BottomSheet>(null);
  const inventoryRef = useRef<BottomSheet>(null);

  useEffect(() => {
    async function getUserProfile() {
      const { data: {user} } = await supabase.auth.getUser();

      if (user) {
        const metadataName = user.user_metadata?.display_name;

        const { data } = await supabase
          .from('profiles')
          .select('display_name, chicken_name, xp, coins, equipped_item_id')
          .eq('id', user.id)
          .single();

        if (data) {
          setName(data.display_name ?? metadataName ?? '');
          setChickName(data.chicken_name ?? '');
          setXP(data.xp ?? 0);
          setCoins(data.coins ?? 0);
          setEquippedItemID(data.equipped_item_id);
        }

        const { data: inventoryData } = await supabase
        .from('inventory')
        .select('item_id')
        .eq('user_id', user.id);

        if (inventoryData) setOwnedItemsIds(inventoryData.map(row => row.item_id));
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

  const updateChickName = async (newName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ chicken_name: newName })
      .eq('id', user.id);

      if (error) console.error(error);
      else setChickName(newName);
      
  };

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

  // function to update supabase after buying items
  const buyItem = async (price: number, itemId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // update coin value
    const { error: coinsError } = await supabase
      .from('profiles')
      .update({ coins: coins - price })
      .eq('id', user.id);

    if (coinsError) {
      console.error(coinsError);
      return;
    }
    
    // update inventory
    const { error: inventoryError } = await supabase
      .from('inventory')
      .insert({ user_id: user.id, item_id: itemId });

    if (inventoryError) {
      console.error(inventoryError);
      return;
    }

    // set local state
    setCoins(coins - price);
    setOwnedItemsIds(prev => [...prev, itemId]);
  };
  
  // function to update supabase after equipping item
  const equipItem = async (itemId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ equipped_item_id: itemId })
      .eq('id', user.id);

    if (profileError) {
      console.error(profileError);
      return;
    }

    // update local state
    setEquippedItemID(itemId);
  };

  // function to update supabase after unequipping an item
  const unequipItem = async (itemId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ equipped_item_id: null })
      .eq('id', user.id);

    if (profileError) {
      console.error(profileError);
      return;
    }

    // update local state
    setEquippedItemID(null);
  };

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
                  onChangeText={name => setChickName(name)} // update local state after every keystroke
                  onSubmitEditing={name => updateChickName(chickName)} // save to DB only when done
                  ></TextInput>
              </View>
              <GestureDetector gesture={pet}>
                <Image
                  source={ equippedItemID === null ? require('../../../assets/images/home/chicken.png')
                    : imageMap[equippedItemID]
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

          <Store 
            ref={storeRef} 
            close={closeStoreSheet}
            chickName={chickName} 
            coins={coins} 
            onBuy={buyItem} 
            ownedItems={ownedItemsIds}></Store>

          <Inventory 
            ref={inventoryRef} 
            close={closeInventorySheet} 
            chickName={chickName} 
            ownedItems={ownedItemsIds} 
            equippedItemId={equippedItemID} 
            onEquip={equipItem}
            onUnequip={unequipItem}></Inventory>
          
      </ImageBackground>
    </View>
  );
}
