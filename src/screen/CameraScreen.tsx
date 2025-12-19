import React, {useRef, useState} from 'react';
import {RNCamera} from 'react-native-camera';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

type RootStackParamList = {
  MainTabs: {
    screen: 'Ticket';
    params: {targetUrl: string};
  };
  Auth: {authRequestId: string};
  Camera: {vp: any};
  Verify: {vp: any; requestUri?: string};
};

const CameraScreen = () => {
  const cameraRef = useRef<RNCamera | null>(null);
  const [scanned, setScanned] = useState(false);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Camera'>>();

  // TicketDetailScreen에서 넘어온 vp 데이터
  const {vp} = route.params || {};

  // ✅ 딥링크 핸들러 수정 (verify 로직 추가)
  const handleDeepLink = (url: string) => {
    const SCHEME = 'uxmwallet://';

    if (!url.startsWith(SCHEME)) {
      return false;
    }

    try {
      // 스키마 제거 (uxmwallet:// 제거)
      const pathAndQuery = url.replace(SCHEME, '');
      const [path, queryString] = pathAndQuery.split('?');

      // 파라미터 파싱
      const params: {[key: string]: string} = {};
      if (queryString) {
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value) {
            params[key] = decodeURIComponent(value);
          }
        });
      }

      console.log(`[DeepLink] Path: ${path}, Params:`, params);

      // 1. 티켓 관련 딥링크
      if (path === 'ticket' || path.includes('ticket')) {
        if (params.targetUrl) {
          navigation.navigate('MainTabs', {
            screen: 'Ticket',
            params: {targetUrl: params.targetUrl},
          });
          return true;
        }
      }
      // 2. Auth 관련 딥링크
      else if (path === 'auth') {
        if (params.authRequestId) {
          navigation.navigate('Auth', {authRequestId: params.authRequestId});
          return true;
        }
      }
      // ✅ 3. Verify (검증) 관련 딥링크 추가
      else if (path === 'verify') {
        // 프론트엔드에서 request_uri로 보냈으므로 이를 체크
        if (params.request_uri) {
          console.log('✅ Verify DeepLink 감지:', params.request_uri);

          // Verify 화면으로 이동 (기존 vp + QR에서 읽은 requestUri 전달)
          navigation.replace('Verify', {
            vp: vp,
            requestUri: params.request_uri,
          });
          return true;
        }
      }

      return false;
    } catch (e) {
      console.error('딥링크 파싱 에러:', e);
      return false;
    }
  };

  const handleBarCodeRead = ({data, type}: {data: string; type: string}) => {
    if (scanned) return;

    console.log(`QR Scanned (${type}):`, data);

    // 1. OID4VP 표준 스키마 처리 (기존 코드 유지)
    if (data.startsWith('openid-vc://')) {
      setScanned(true);
      try {
        const regex = /[?&]request_uri=([^&]+)/;
        const match = data.match(regex);
        if (match && match[1]) {
          const requestUri = decodeURIComponent(match[1]);
          navigation.replace('Verify', {
            vp: vp,
            requestUri: requestUri,
          });
          return;
        }
      } catch (error) {
        console.error('OID4VP 파싱 에러:', error);
      }
    }

    // 2. 커스텀 딥링크 (uxmwallet://) 처리
    // handleDeepLink 내부에서 'verify'를 처리하도록 수정됨
    const isHandled = handleDeepLink(data);

    if (isHandled) {
      setScanned(true);
      // 성공 시 별도 알림 없이 이동
      setTimeout(() => setScanned(false), 2000);
      return;
    }

    // 3. 처리 실패 시 알림
    if (!scanned) {
      setScanned(true);
      Alert.alert('알림', `지원하지 않는 QR 코드입니다.\n데이터: ${data}`, [
        {
          text: '다시 스캔',
          onPress: () => setScanned(false),
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
        captureAudio={false}
        onBarCodeRead={handleBarCodeRead}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.guideText}>QR 코드를 스캔하세요</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  camera: {flex: 1},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  guideText: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 5,
  },
});

export default CameraScreen;
