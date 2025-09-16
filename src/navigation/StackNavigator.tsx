import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screen/HomeScreen';
import ProfileScreen from '../screen/ProfileScreen';
import TicketScreen from '../screen/TicketScreen';
import AuthScreen from '../screen/AuthScreen';
import CameraScreen from '../screen/CameraScreen';

export type StackParamList = {
  Home: undefined;
  Profile: undefined;
  Ticket: undefined;
  Auth: undefined;
  camera: undefined;
};

const Stack = createStackNavigator<StackParamList>();

function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="camera" component={CameraScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Ticket" component={TicketScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

export default StackNavigator;
