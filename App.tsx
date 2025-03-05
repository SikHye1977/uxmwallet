import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';
import { StyleSheet, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';

const requestUserPermission = async () => {
  const authorizationStatus = await messaging().requestPermission();

  if (authorizationStatus) {
    // Generate FCM Token
    const token = await messaging().getToken();
    console.log('Authorization Status: ', authorizationStatus);
    console.log('FCM Token: ', token); // Firebase 콘솔에서 알림 보낼 때 사용
  }
};

// 앱이 background/quit(종료) 상태일 때 메시지를 처리
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('[Background Message] ', remoteMessage);
});

const App = () => {
  useEffect(() => {
    requestUserPermission();

    // 앱이 foreground(실행) 상태에서 메시지를 받을 때 처리
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('[Foreground Message] ', JSON.stringify(remoteMessage));
    });

    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 정리
  }, []);

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({});

export default App;
