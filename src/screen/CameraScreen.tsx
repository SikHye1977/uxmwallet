import React, {useRef, useState} from 'react';
import {RNCamera} from 'react-native-camera';
import {View, TouchableOpacity, Text, StyleSheet, Alert} from 'react-native';
// ✅ 네비게이션 훅 추가
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

// ✅ 네비게이션 타입 정의 (기존 RootStackParamList 참고)
type RootStackParamList = {
  MainTabs: {
    screen: 'Ticket';
    params: {targetUrl: string};
  };
  Auth: {authRequestId: string};
};

const CameraScreen = () => {
  const cameraRef = useRef<RNCamera | null>(null);
  const [scanned, setScanned] = useState(false);

  // ✅ 네비게이션 객체 가져오기
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = {quality: 0.5, base64: true, width: 800};
      const data = await cameraRef.current.takePictureAsync(options);
      console.log('촬영된 사진 URI:', data.uri);
    }
  };

  // ✅ 딥링크 파싱 및 이동 로직 함수
  const handleDeepLink = (url: string) => {
    const SCHEME = 'uxmwallet://';

    // 1. 내 앱의 딥링크인지 확인
    if (!url.startsWith(SCHEME)) {
      return false;
    }

    try {
      // 2. 파싱 로직 (uxmwallet://ticket?targetUrl=... 등)
      const pathAndQuery = url.replace(SCHEME, '');
      const [path, queryString] = pathAndQuery.split('?');

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

      // 3. 경로에 따라 이동
      if (path === 'ticket' || path.includes('ticket')) {
        if (params.targetUrl) {
          navigation.navigate('MainTabs', {
            screen: 'Ticket',
            params: {targetUrl: params.targetUrl},
          });
          return true; // 이동 성공
        }
      } else if (path === 'auth') {
        if (params.authRequestId) {
          navigation.navigate('Auth', {authRequestId: params.authRequestId});
          return true; // 이동 성공
        }
      }
      return false; // 경로는 맞지만 파라미터 부족 등으로 실패
    } catch (e) {
      console.error('딥링크 파싱 에러:', e);
      return false;
    }
  };

  // ✅ QR 코드 리더 핸들러 수정
  const handleBarCodeRead = ({data, type}: {data: string; type: string}) => {
    if (!scanned) {
      setScanned(true); // 중복 스캔 방지
      console.log(`QR Scanned (${type}):`, data);

      // 1. 딥링크 처리 시도
      const isHandled = handleDeepLink(data);

      if (isHandled) {
        // ✅ 성공 시: 자동으로 화면이 넘어가므로 별도 Alert 없음
        // 돌아왔을 때 다시 스캔 가능하도록 약간의 딜레이 후 초기화
        setTimeout(() => setScanned(false), 2000);
      } else {
        // ✅ 실패 시 (일반 QR이거나 처리 불가능): 기존처럼 Alert 표시
        Alert.alert('QR 코드 인식됨', data, [
          {
            text: '다시 스캔',
            onPress: () => setScanned(false),
          },
        ]);
      }
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

      {/* (선택 사항) 스캔 가이드 라인 UI */}
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
  button: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {fontSize: 16, fontWeight: 'bold', color: '#000'},

  // 가이드라인 스타일
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
