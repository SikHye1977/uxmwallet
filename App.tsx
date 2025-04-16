import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import {
  getMessaging,
  onMessage,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

import { setItem, getItem } from './src/utils/AsyncStorage';
import RootNavigator from './src/navigation/RootNavigator';
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './src/navigation/types';

const FCM_TOKEN_KEY = 'fcmToken';

// ✅ navigationRef에 타입 지정
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

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
          Ticket: {
            path: 'ticket',
            parse: {
              targetUrl: (url: string) => `${url}`,
            },
          },
          Profile: 'profile',
        },
      },
    },
  },
};

// ✅ FCM 메시징 인스턴스
const messaging = getMessaging(getApp());

setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  console.log('[Background Message]', remoteMessage);
});

const requestUserPermission = async () => {
  const authStatus = await messaging.requestPermission();
  if (authStatus) {
    const token = await messaging.getToken();
    console.log('Authorization Status:', authStatus);
    console.log('FCM Token:', token);
    await setItem(FCM_TOKEN_KEY, token);
  }
};

const App = () => {
  useEffect(() => {
    requestUserPermission();

    const handleNotification = (remoteMessage: any) => {
      const targetUrl = remoteMessage?.data?.target_url;
      if (targetUrl && navigationRef.isReady()) {
        console.log('🔗 Navigating with target_url:', targetUrl);
        navigationRef.navigate('MainTabs', {
          screen: 'Ticket',
          params: { targetUrl },
        });
      }
    };

    const unsubscribeOnMessage = onMessage(messaging, async (remoteMessage) => {
      console.log('[Foreground Message]', remoteMessage);
    });

    const unsubscribeOnNotificationOpened = onNotificationOpenedApp(messaging, (remoteMessage) => {
      console.log('[Background 클릭 → 앱 열림]', remoteMessage);
      handleNotification(remoteMessage);
    });

    getInitialNotification(messaging).then((remoteMessage) => {
      if (remoteMessage) {
        console.log('[앱 종료 상태에서 알림 클릭 → 첫 실행]', remoteMessage);
        handleNotification(remoteMessage);
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpened();
    };
  }, []);

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({});

export default App;
