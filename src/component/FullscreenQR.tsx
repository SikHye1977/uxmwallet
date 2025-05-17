import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  SafeAreaView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

type ParamList = {
  FullscreenQR: { value: string };
};

const FullscreenQR = () => {
  const route = useRoute<RouteProp<ParamList, 'FullscreenQR'>>();
  const value = route.params?.value;
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.fullscreenContainer}>
      {/* 닫기 버튼 */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>닫기</Text>
      </TouchableOpacity>

      {/* QR 코드 */}
      <View style={styles.qrBackground}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <QRCode
            value={value}
            size={300}
            backgroundColor="white"  // QR 코드 배경색
            color="black"             // QR 코드 패턴 색
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000', // 전체 배경은 검정
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
  },
  closeText: {
    color: 'white',
    fontSize: 16,
  },
  qrBackground: {
    backgroundColor: 'white', // QR코드 배경 따로 흰색 설정
    padding: 20,
    borderRadius: 12,
  },
});

export default FullscreenQR;
