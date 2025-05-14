import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createVP } from '../utils/VPGenerator';

type RootStackParamList = {
  TicketDetail: { vc: any };
  Ticket: undefined; // 돌아갈 스크린 타입 명시 (선택)
};

function TicketDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TicketDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const vc = route.params.vc;
  const [vp, setVp] = React.useState<any | null>(null); // VP 객체 타입으로 변경
  const [isModalVisible, setIsModalVisible] = React.useState(false); // 모달 표시 상태 관리

  const create_vp = async () => {
    const result = await createVP(vc);
    setVp(result); // result는 VerifiablePresentation 객체
    setIsModalVisible(true); // VP 생성 후 모달 표시
  };

  const closeModal = () => {
    setIsModalVisible(false); // 모달 닫기
  };

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>티켓 상세 정보</Text>
        <Text style={styles.json}>{JSON.stringify(vc, null, 2)}</Text>

        {/* 🔙 돌아가기 버튼 */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← 목록으로 돌아가기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.Button} onPress={create_vp}>
          <Text style={styles.backButtonText}>VP 생성</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 모달 추가 */}
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
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.json}>{JSON.stringify(vp, null, 2)}</Text>
              </ScrollView>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>QR 표시</Text>
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
  // 모달 스타일 추가
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 투명 배경
  },
  modalContainer: {
    width: '80%',
    maxHeight: '80%', // 최대 높이 설정 (화면 크기 제한)
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
    flexGrow: 1, // 컨텐츠가 길어지면 스크롤 가능하도록 설정
    paddingBottom: 20, // 여유 공간을 줘서 스크롤이 되도록
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4D8AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    width : 100
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TicketDetailScreen;
