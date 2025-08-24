// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
// } from 'react-native';
// import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
// import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {createVP} from '../utils/VPGenerator';
// import QRCode from 'react-native-qrcode-svg'; // ✅ 추가
// import {compressVP} from '../utils/VPCompressor';

// type RootStackParamList = {
//   TicketDetail: {vc: any};
//   Ticket: undefined;
//   FullscreenQR: {value: string}; // 전체화면
// };

// function TicketDetailScreen() {
//   const route = useRoute<RouteProp<RootStackParamList, 'TicketDetail'>>();
//   const navigation =
//     useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//   const vc = route.params.vc;
//   const [vp, setVp] = React.useState<any | null>(null);
//   const [compressedQRData, setCompressedQRData] = React.useState<string | null>(
//     null,
//   ); // 압축된 VP
//   const [isModalVisible, setIsModalVisible] = React.useState(false);
//   const [showQR, setShowQR] = React.useState(false); // ✅ QR 표시 상태

//   const create_vp = async () => {
//     const result = await createVP(vc);
//     console.log(JSON.stringify(result, null, 2));
//     setVp(result);
//     setIsModalVisible(true);
//     setShowQR(false); // 초기엔 QR 숨김
//   };

//   const closeModal = () => {
//     setIsModalVisible(false);
//     setShowQR(false); // 닫을 때 QR도 초기화
//   };

//   const toggleQR = async () => {
//     if (!showQR && vp) {
//       // QR을 처음 표시할 때만 압축
//       try {
//         const compressed = await compressVP(vp);
//         setCompressedQRData(compressed); // 상태로 저장해서 QR 표시
//       } catch (err) {
//         console.error('압축 실패:', err);
//       }
//     }

//     setShowQR(prev => !prev);
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.contentWrapper}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           <Text style={styles.title}>티켓 상세 정보</Text>
//           {vc?.credential?.credentialSubject ? (
//             <View style={styles.ticketInfoBox}>
//               <Text style={styles.ticketInfoText}>
//                 티켓 번호 : {vc.credential.credentialSubject.ticketNumber}
//               </Text>
//               <Text style={styles.ticketInfoText}>
//                 발급자 : {vc.credential.credentialSubject.issuedBy.name}
//               </Text>
//               <Text style={styles.ticketInfoText}>
//                 소유자 : {vc.credential.credentialSubject.underName.name}
//               </Text>
//               <Text style={styles.ticketInfoText}>
//                 소유자 ID : {vc.credential.credentialSubject.underName.id}
//               </Text>

//               {/* 전체 JSON 보기 */}
//               <Text style={styles.jsonText}>{JSON.stringify(vc, null, 2)}</Text>
//             </View>
//           ) : (
//             <Text style={styles.ticketInfoText}>
//               VC 데이터를 불러오는 중입니다...
//             </Text>
//           )}
//         </ScrollView>

//         {/* ✅ 하단 고정 버튼 영역 */}
//         <View style={styles.bottomButtons}>
//           <TouchableOpacity style={styles.Button} onPress={create_vp}>
//             <Text style={styles.backButtonText}>VP 생성</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}>
//             <Text style={styles.backButtonText}>← 목록으로 돌아가기</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {vp && (
//         <Modal
//           transparent={true}
//           visible={isModalVisible}
//           animationType="slide"
//           onRequestClose={closeModal}>
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <Text style={styles.modalTitle}>VP (VerifiablePresentation)</Text>

//               {/* ✅ QR 표시 조건 */}
//               {showQR ? (
//                 <View style={styles.qrContainer}>
//                   {compressedQRData ? (
//                     <>
//                       <QRCode value={compressedQRData} size={200} />
//                       <TouchableOpacity
//                         style={styles.fullscreenButton}
//                         onPress={() => {
//                           setIsModalVisible(false);
//                           navigation.navigate('FullscreenQR', {
//                             value: compressedQRData,
//                           });
//                         }}>
//                         <Text style={styles.fullscreenButtonText}>
//                           전체화면 보기
//                         </Text>
//                       </TouchableOpacity>
//                     </>
//                   ) : (
//                     <Text>압축 중...</Text>
//                   )}
//                 </View>
//               ) : (
//                 <ScrollView contentContainerStyle={styles.modalContent}>
//                   <Text style={styles.json}>{JSON.stringify(vp, null, 2)}</Text>
//                 </ScrollView>
//               )}

//               {/* ✅ QR / JSON 보기 토글 버튼 */}
//               <TouchableOpacity style={styles.closeButton} onPress={toggleQR}>
//                 <Text style={styles.closeButtonText}>
//                   {showQR ? 'JSON 보기' : 'QR 표시'}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
//                 <Text style={styles.closeButtonText}>닫기</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   json: {
//     fontSize: 13,
//     fontFamily: 'Courier',
//     color: '#333',
//     marginBottom: 24,
//   },
//   backButton: {
//     marginTop: 10,
//     backgroundColor: '#4D8AFF',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   backButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   Button: {
//     backgroundColor: '#4D8AFF',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContainer: {
//     width: '85%',
//     maxHeight: '85%',
//     padding: 20,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   modalContent: {
//     flexGrow: 1,
//     paddingBottom: 20,
//   },
//   qrContainer: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   closeButton: {
//     marginTop: 10,
//     backgroundColor: '#4D8AFF',
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//     width: 100,
//   },
//   closeButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   fullscreenButton: {
//     marginTop: 10,
//     backgroundColor: '#333',
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//     width: 150,
//   },
//   fullscreenButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   ticketInfoBox: {
//     marginVertical: 12,
//     padding: 16,
//     backgroundColor: '#f1f5ff',
//     borderRadius: 10,
//   },
//   ticketInfoText: {
//     fontSize: 14,
//     marginBottom: 8,
//     color: '#333',
//   },
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   contentWrapper: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   scrollContent: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   bottomButtons: {
//     padding: 16,
//     borderTopWidth: 1,
//     borderColor: '#eee',
//     backgroundColor: '#fff',
//   },
//   jsonText: {
//     fontSize: 12,
//     fontFamily: 'Courier',
//     color: '#333',
//   },
// });

// export default TicketDetailScreen;

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

type RootStackParamList = {
  TicketDetail: {vc: any};
  Ticket: undefined;
  FullscreenQR: {value: string};
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
            <Text style={styles.backButtonText}>VP 생성</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← 목록으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {vp && (
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
