import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
import { getMessaging, onMessage, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import BottomTabsNavigator from './src/navigation/BottomTabsNavigator';
import { setItem, getItem } from './src/utils/AsyncStorage';
import RootNavigator from './src/navigation/RootNavigator';

const FCM_TOKEN_KEY = 'fcmToken';

const linking = {
  prefixes: ['uxmwallet://'],
  config: {
    screens: {
      Auth: {
        path: 'auth',
        parse: {
          authRequestId: (id: string) => `${id}`,
        },
      },
      MainTabs: {
        path: 'tabs',
        screens: {
          Home: 'home',
          Ticket: 'ticket',
          Profile: 'profile',
        },
      },
    },
  },
};


const requestUserPermission = async () => {
  // const authorizationStatus = await messaging().requestPermission();
  const messaging = getMessaging(getApp());
  const authorizationStatus = await messaging.requestPermission();

  if (authorizationStatus) {
    // Generate FCM Token
    // const token = await messaging().getToken();
    const token = await messaging.getToken();
    console.log('Authorization Status: ', authorizationStatus);
    console.log('FCM Token: ', token); // Firebase 콘솔에서 알림 보낼 때 사용

    await setItem(FCM_TOKEN_KEY, token);
  }
};

// 앱이 background/quit(종료) 상태일 때 메시지를 처리
// messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//   console.log('[Background Message] ', remoteMessage);
// });
setBackgroundMessageHandler(getMessaging(getApp()), async (remoteMessage) => {
  console.log('[Background Message] ', remoteMessage);
});

const App = () => {
  const [fcmToken, setFcmToken] = useState('');
  
  useEffect(() => {
    requestUserPermission();

    // 🔹 앱 실행 시 저장된 FCM 토큰 불러오기
    const loadStoredToken = async () => {
      const savedToken = await getItem(FCM_TOKEN_KEY);
      if (savedToken) {
        setFcmToken(savedToken);
        console.log('Stored FCM Token:', savedToken);
      }
    };

    loadStoredToken();

    // 앱이 foreground(실행) 상태에서 메시지를 받을 때 처리
    // const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    //   console.log('[Foreground Message] ', JSON.stringify(remoteMessage));
    // });
    const unsubscribe = onMessage(getMessaging(getApp()), async (remoteMessage) => {
      console.log('[Foreground Message] ', JSON.stringify(remoteMessage));
    });

    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 정리
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <RootNavigator />
    </NavigationContainer>

  );
};

const styles = StyleSheet.create({});

export default App;
