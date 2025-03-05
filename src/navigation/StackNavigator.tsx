import React from 'react';
import {StyleSheet, View} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screen/HomeScreen';
import ProfileScreen from '../screen/ProfileScreen';
import TicketScreen from '../screen/TicketScreen';

export type StackParamList = {
    Home : undefined;
    Profile : undefined;
    Ticket : undefined;
};

const Stack = createStackNavigator<StackParamList>();

function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Ticket" component={TicketScreen} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({});

export default StackNavigator;