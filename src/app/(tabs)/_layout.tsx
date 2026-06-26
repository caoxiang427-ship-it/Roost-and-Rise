import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          height: 60,
          marginBottom: 15,
          marginHorizontal: 20,
          borderRadius: 20,
          backgroundColor: '#FFF',
          elevation: 8, // Android shadow
          shadowColor: '#000', // IOS shadow
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: {
            width: 0,
            height: 4,},
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 15,
          marginVertical: 0,
        }}}>
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 55,
                height: 45,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: focused ? '#3B99B9' : 'transparent',
              }}
            >
              <Ionicons name="bar-chart" color={focused ? '#FFF' : '#5E90A1'} size={22} />
              <Text style={{fontFamily: 'InterBold', color: focused ? '#FFF' : '#5E90A1', fontSize: 8}}>Analytics</Text>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="care"
        options={{
          title: 'Self-Care',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 55,
                height: 45,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: focused ? '#3B99B9' : 'transparent',
              }}
            >
              <Ionicons name="heart" color={focused ? '#FFF' : '#5E90A1'} size={22} />
              <Text style={{fontFamily: 'InterBold', color: focused ? '#FFF' : '#5E90A1', fontSize: 8}}>Self-Care</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{alignItems: "center"}}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 50,
                  backgroundColor: '#86C2D8',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: -35, // makes it float above tab bar
                  shadowColor: '#000',
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
              <Ionicons name="home" color='#FFF' size={28} />
              </View>
              <Text style={{fontFamily: 'InterBold', color: focused ? '#4ec1e8' : '#5E90A1', fontSize: 9}}>Home</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="todo_list"
        options={{
          title: 'Todo',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 55,
                height: 45,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: focused ? '#3B99B9' : 'transparent',
              }}
            >
              <Ionicons name="list-circle-outline" color={focused ? '#FFF' : '#5E90A1'} size={22} />
              <Text style={{fontFamily: 'InterBold', color: focused ? '#FFF' : '#5E90A1', fontSize: 8}}>Todo</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 55,
                height: 45,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: focused ? '#3B99B9' : 'transparent',
              }}
            >
              <Ionicons name="book" color={focused ? '#FFF' : '#5E90A1'} size={22} />
              <Text style={{fontFamily: 'InterBold', color: focused ? '#FFF' : '#5E90A1', fontSize: 8}}>Planner</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="edit_categories"
        options={{
        href: null,    
        headerShown: true,
        title: 'Edit Categories',
        }}
      />
    </Tabs>
  );
}
