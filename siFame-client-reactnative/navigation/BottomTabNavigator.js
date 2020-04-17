import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = "Home";

export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}
    tabBarOptions={{
      activeTintColor: '#414757',
    }}
    >
      <BottomTab.Screen
      
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Fame AI',
          tabBarIcon: ({ focused }) =>  <MaterialCommunityIcons name="home"  color={focused ? "#F6820D" : "#414757"} size={30}  style={{ marginBottom: -3 }} />,
          
        }}
      />
      <BottomTab.Screen
        name="Links"
        component={LinksScreen}
        options={{
          title: 'Instagram AI',
          tabBarIcon: ({ focused }) => <MaterialCommunityIcons name="instagram"  color={focused ? "#F6820D" : "#414757"} size={30}  style={{ marginBottom: -3 }} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

function getHeaderTitle(route) {
  const routeName = route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case 'Home':
      return 'How to get started';
    case 'Links':
      return 'Links to learn more';
  }
}
