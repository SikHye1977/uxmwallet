import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createVP } from '../utils/VPGenerator';
import QRCode from 'react-native-qrcode-svg'; // ✅ 추가

type RootStackParamList = {
  TicketDetail: { vc: any };
  Ticket: undefined;
};

function TicketDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TicketDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const vc = route.params.vc;
  const [vp, setVp] = React.useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [showQR, setShowQR] = React.useState(false); // ✅ QR 표시 상태

  const create_vp = async () => {
    const result = await createVP(vc);
    console.log(JSON.stringify(result, null, 2));
    setVp(result);
    setIsModalVisible(true);
    setShowQR(false); // 초기엔 QR 숨김
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setShowQR(false); // 닫을 때 QR도 초기화
  };

  const toggleQR = () => {
    setShowQR((prev) => !prev); // ✅ QR 보기/숨기기 토글
  };

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>티켓 상세 정보</Text>
        <Text style={styles.json}>{JSON.stringify(vc, null, 2)}</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← 목록으로 돌아가기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.Button} onPress={create_vp}>
          <Text style={styles.backButtonText}>VP 생성</Text>
        </TouchableOpacity>
      </ScrollView>

      {vp && (
        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>VP (VerifiablePresentation)</Text>

              {/* ✅ QR 표시 조건 */}
              {showQR ? (
                <View style={styles.qrContainer}>
                  <QRCode value={JSON.stringify(vp)} size={200} />
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.modalContent}>
                  <Text style={styles.json}>{JSON.stringify(vp, null, 2)}</Text>
                </ScrollView>
              )}

              {/* ✅ QR / JSON 보기 토글 버튼 */}
              <TouchableOpacity style={styles.closeButton} onPress={toggleQR}>
                <Text style={styles.closeButtonText}>{showQR ? 'JSON 보기' : 'QR 표시'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  json: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: '#333',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4D8AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  Button: {
    marginTop: 10,
    backgroundColor: '#4D8AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '85%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  qrContainer: {
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#4D8AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: 100,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TicketDetailScreen;
