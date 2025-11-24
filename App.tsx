import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet} from 'react-native';
import {
  getMessaging,
  onMessage,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';

import {setItem} from './src/utils/AsyncStorage';
import {get_VC} from './src/utils/GetVC'; // ✅ VC 발급 요청 함수 import
import RootNavigator from './src/navigation/RootNavigator';
import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from './src/navigation/types';
// 25.08.20 추가
import {updateStatusListCid} from './src/utils/AsyncStorage';

const FCM_TOKEN_KEY = 'fcmToken';

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

const messaging = getMessaging(getApp());

setBackgroundMessageHandler(messaging, async remoteMessage => {
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

    const handleNotification = async (remoteMessage: any) => {
      // 25.08.20 추가
      const ticketId = remoteMessage?.data?.ticketId;
      const cid = remoteMessage?.data?.cid;

      if (ticketId && cid) {
        try {
          const res = await updateStatusListCid(ticketId, cid);
          console.log('[VC] status cid update result:', res);
        } catch (e) {
          console.error('[VC] status cid update failed:', e);
        }

        if (navigationRef.isReady()) {
          navigationRef.navigate('MainTabs', {screen: 'Ticket'});
        }
        return; // 여기서 종료
      }

      const targetUrl = remoteMessage?.data?.target_url;

      if (targetUrl) {
        // try {
        //   const result = await get_VC(targetUrl);
        //   console.log(
        //     '🧾 [FCM 클릭 → VC 발급 결과]:',
        //     JSON.stringify(result, null, 2),
        //   );
        // } catch (err) {
        //   console.error('❌ VC 가져오기 실패:', err);
        // }

        if (navigationRef.isReady()) {
          navigationRef.navigate('MainTabs', {
            screen: 'Ticket',
            params: {targetUrl},
          });
        }
      }
    };

    const unsubscribeOnMessage = onMessage(messaging, async remoteMessage => {
      console.log('[Foreground Message]', remoteMessage);
    });

    const unsubscribeOnNotificationOpened = onNotificationOpenedApp(
      messaging,
      remoteMessage => {
        console.log('[Background 클릭 → 앱 열림]', remoteMessage);
        handleNotification(remoteMessage);
      },
    );

    getInitialNotification(messaging).then(remoteMessage => {
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
