import React, {useRef, useState} from 'react';
import {RNCamera} from 'react-native-camera';
import {View, TouchableOpacity, Text, StyleSheet, Alert} from 'react-native';

const CameraScreen = () => {
  const cameraRef = useRef<RNCamera | null>(null);
  const [scanned, setScanned] = useState(false);

  // 사진 촬영
  const takePicture = async () => {
    if (cameraRef.current) {
      const options = {quality: 0.5, base64: true, width: 800};
      const data = await cameraRef.current.takePictureAsync(options);
      console.log('촬영된 사진 URI:', data.uri);
    }
  };

  // ✅ QR 코드 리더
  const handleBarCodeRead = ({data, type}: {data: string; type: string}) => {
    if (!scanned) {
      setScanned(true);
      console.log(`QR/Barcode (${type}):`, data);
      Alert.alert('QR 코드 인식됨', data, [
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
        onBarCodeRead={handleBarCodeRead} // ✅ QR/바코드 이벤트 추가
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]} // QR만 인식
      />
      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>사진 찍기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  camera: {flex: 1},
  button: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {fontSize: 18, color: '#000'},
});

export default CameraScreen;
