import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {createVP} from '../utils/VPGenerator';
import QRCode from 'react-native-qrcode-svg';
import {compressVP} from '../utils/VPCompressor';
import {getItem} from '../utils/AsyncStorage';
// 25.09.07 추가
// FCM 인코딩용
import {Buffer} from 'buffer';

type RootStackParamList = {
  TicketDetail: {vc: any};
  Ticket: undefined;
  FullscreenQR: {value: string};
  Camera: {vp: any};
  Verify: {vp: any};
};

function TicketDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TicketDetail'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const vc = route.params.vc;

  const [vp, setVp] = React.useState<any | null>(null);
  const [compressedQRData, setCompressedQRData] = React.useState<string | null>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [showQR, setShowQR] = React.useState(false);

  const subject = vc?.credentialSubject;

  const create_vp = async () => {
    const result = await createVP(vc);
    console.log(JSON.stringify(result, null, 2));
    setVp(result);
    setIsModalVisible(true);
    setShowQR(false);
  };

  // 2025.09.07 추가
  // 검증방식 개선을 위한 데모
  // 2안은 보안상 문제로 삭제

  // 1안
  // 카메라를 켜서 OID4VP QR을 스캔하게 만들기
  const openCameraComponent = async () => {
    const vp = await createVP(vc);
    navigation.navigate('Camera', {vp});
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setShowQR(false);
  };

  const toggleQR = async () => {
    if (!showQR && vp) {
      try {
        const compressed = await compressVP(vp);
        setCompressedQRData(compressed);
      } catch (err) {
        console.error('압축 실패:', err);
      }
    }
    setShowQR(prev => !prev);
  };

  // 2025.12.17 추가
  // verify 개발을 위한 코드, 추후 통합 필요
  const moveToVerifyScreen = async () => {
    let targetVp = vp;
    if (!targetVp) {
      targetVp = await createVP(vc);
      setVp(targetVp);
    }

    navigation.navigate('Verify', {vp: targetVp});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>티켓 상세 정보</Text>

          {subject ? (
            <View style={styles.ticketInfoBox}>
              <Text style={styles.ticketInfoText}>
                티켓 번호 : {subject.ticketNumber}
              </Text>
              <Text style={styles.ticketInfoText}>
                발급자 : {subject.issuedBy?.name}
              </Text>
              <Text style={styles.ticketInfoText}>
                소유자(명) :{' '}
                {Array.isArray(subject.underName)
                  ? subject.underName.length
                  : subject.underName
                  ? 1
                  : 0}
              </Text>

              {/* 전체 JSON 보기 */}
              <Text style={styles.jsonText}>{JSON.stringify(vc, null, 2)}</Text>
            </View>
          ) : (
            <Text style={styles.ticketInfoText}>
              VC 데이터를 불러오는 중입니다...
            </Text>
          )}
        </ScrollView>

        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.Button} onPress={create_vp}>
            <Text style={styles.backButtonText}>🎫</Text>
          </TouchableOpacity>
          {/* 2025.09.07 추가 */}
          {/* 검증방식 개선을 위한 데모 */}
          <TouchableOpacity style={styles.Button} onPress={openCameraComponent}>
            <Text style={styles.backButtonText}>티켓 검증하기</Text>
          </TouchableOpacity>
          {/* 검증방식 개선을 위한 데모 */}
          {/* 2025.12.17 */}
          {/* 검증 구현을 위한 코드, 추후 통합 필요 */}
          <TouchableOpacity style={styles.Button} onPress={moveToVerifyScreen}>
            <Text style={styles.backButtonText}>검증화면 이동</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← 목록으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* {vp && ( */}
      {isModalVisible && (
        <Modal
          transparent
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>VP (VerifiablePresentation)</Text>

              {showQR ? (
                <View style={styles.qrContainer}>
                  {compressedQRData ? (
                    <>
                      <QRCode value={compressedQRData} size={200} />
                      <TouchableOpacity
                        style={styles.fullscreenButton}
                        onPress={() => {
                          setIsModalVisible(false);
                          navigation.navigate('FullscreenQR', {
                            value: compressedQRData,
                          });
                        }}>
                        <Text style={styles.fullscreenButtonText}>
                          전체화면 보기
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text>압축 중...</Text>
                  )}
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.modalContent}>
                  <Text style={styles.json}>{JSON.stringify(vp, null, 2)}</Text>
                </ScrollView>
              )}

              <TouchableOpacity style={styles.closeButton} onPress={toggleQR}>
                <Text style={styles.closeButtonText}>
                  {showQR ? 'JSON 보기' : 'QR 표시'}
                </Text>
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
  safeArea: {flex: 1, backgroundColor: '#fff'},
  contentWrapper: {flex: 1, justifyContent: 'space-between'},
  scrollContent: {padding: 20, paddingBottom: 40},
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 12},
  ticketInfoBox: {
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#f1f5ff',
    borderRadius: 10,
  },
  ticketInfoText: {fontSize: 14, marginBottom: 8, color: '#333'},
  jsonText: {fontSize: 12, fontFamily: 'Courier', color: '#333'},
  bottomButtons: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    marginTop: 10,
    backgroundColor: '#4D8AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {color: 'white', fontWeight: 'bold'},
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
  modalTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 12},
  modalContent: {flexGrow: 1, paddingBottom: 20},
  qrContainer: {padding: 20, alignItems: 'center'},
  closeButton: {
    marginTop: 10,
    backgroundColor: '#4D8AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: 100,
  },
  closeButtonText: {color: 'white', fontWeight: 'bold'},
  fullscreenButton: {
    marginTop: 10,
    backgroundColor: '#333',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: 150,
  },
  fullscreenButtonText: {color: 'white', fontWeight: 'bold'},
  json: {fontSize: 13, fontFamily: 'Courier', color: '#333', marginBottom: 24},
});

export default TicketDetailScreen;
