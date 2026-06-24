/* 
 * Home screen. 
 * Only logged in users reach this page.
 * Handle log out.
*/

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/index_styles';
import { ImageBackground } from 'expo-image';
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';


export default function HomeScreen() {

  const insets = useSafeAreaInsets();
  const[name, setName] = useState('');

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


  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/home/home_background.png")}
        style={styles.container}>
          <View style={[styles.header, {paddingTop: insets.top + 20, paddingLeft: insets.left + 20, paddingRight: insets.right + 30}]}>
            <Link href="../profile" asChild>
            <TouchableOpacity style={styles.profile}>
              <Ionicons name="person-outline" size={40} color="#5E90A1"/>
            </TouchableOpacity>
            </Link>

            <View style={styles.headerBtns}>
              <TouchableOpacity style={styles.volume}>
                <Ionicons name="volume-high" size={30} color="#FFF"/>
              </TouchableOpacity>

              <TouchableOpacity>
                <Ionicons name="settings-sharp" size={30} color="#FFF"/>
              </TouchableOpacity>
            </View>

          </View>
          <View style={styles.topDisplay}>
              <Text>Wednesday 24/06/26</Text>
            </View>
      </ImageBackground>
    </View>
  );
}
