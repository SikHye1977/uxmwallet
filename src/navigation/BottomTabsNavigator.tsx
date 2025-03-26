import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screen/HomeScreen';
import ProfileScreen from '../screen/ProfileScreen';
import TicketScreen from '../screen/TicketScreen';
import AuthScreen from '../screen/AuthScreen';

const Tab = createBottomTabNavigator();

function BottomTabsNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Ticket" component={TicketScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* <Tab.Screen name="Auth" component={AuthScreen} /> */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default BottomTabsNavigator;
