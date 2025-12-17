import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BottomTabsNavigator from './BottomTabsNavigator';
import AuthScreen from '../screen/AuthScreen';
import TicketDetailScreen from '../component/TicketDetailScreen';
import FullscreenQR from '../component/FullscreenQR';
import CameraScreen from '../screen/CameraScreen';
import VerifyScreen from '../screen/VerifyScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MainTabs" component={BottomTabsNavigator} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="FullscreenQR" component={FullscreenQR} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
    </Stack.Navigator>
  );
}

export default RootNavigator;
