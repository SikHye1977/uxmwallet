// import React, {useEffect, useState} from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   ActivityIndicator,
//   ScrollView,
//   TouchableOpacity,
// } from 'react-native';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {RouteProp, useRoute} from '@react-navigation/native';
// import {get_VC} from '../utils/GetVC';
// import {getItem, setItem, removeItem} from '../utils/AsyncStorage';
// import VCcard from '../component/VCcard';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// // 25.08.20 추가
// import {useFocusEffect} from '@react-navigation/native';
// import {useCallback} from 'react';

// type TicketRouteParamList = {
//   Ticket: {targetUrl?: string};
// };

// function TicketScreen() {
//   const route = useRoute<RouteProp<TicketRouteParamList, 'Ticket'>>();
//   const targetUrl = route.params?.targetUrl;

//   const [vcList, setVcList] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isDeleteMode, setIsDeleteMode] = useState(false);

//   // 25.08.20 추가
//   useFocusEffect(
//     useCallback(() => {
//       const loadStoredVCs = async () => {
//         try {
//           const keys = await AsyncStorage.getAllKeys();
//           const vcKeys = keys.filter(k => k.startsWith('vc:'));
//           const vcData = await Promise.all(
//             vcKeys.map(async key => {
//               const stored = await getItem(key);
//               return stored ? JSON.parse(stored) : null;
//             }),
//           );
//           const filtered = vcData.filter(
//             v =>
//               v?.credentialSubject?.ticketNumber ||
//               v?.credential?.credentialSubject?.ticketNumber, // 과거 스키마도 안전 처리
//           );
//           setVcList(filtered);
//         } catch (e) {
//           console.error('스토리지 로드 오류:', e);
//         }
//       };
//       loadStoredVCs();
//     }, []),
//   );
//   // FCM/딥링크로 들어온 VC 저장 + 목록 반영
//   useEffect(() => {
//     const fetchOrLoadVC = async () => {
//       if (!targetUrl) return;
//       setLoading(true);
//       try {
//         const result = await get_VC(targetUrl);
//         console.log('🧾 VC 응답 전체:', JSON.stringify(result, null, 2));

//         const vc = result?.vc;
//         if (!vc) return;

//         const ticketNumber = vc?.credentialSubject?.ticketNumber;
//         if (!ticketNumber) {
//           console.warn('❗ ticketNumber 없음 (응답 구조 확인 필요)');
//           return;
//         }

//         const storageKey = `vc:${ticketNumber}`;
//         const stored = await getItem(storageKey);

//         const newVC = stored ? JSON.parse(stored) : vc;
//         if (!stored) {
//           await setItem(storageKey, JSON.stringify(newVC));
//           console.log(`setItem... ${storageKey} : ${JSON.stringify(newVC)}`);
//         }

//         setVcList(prev => {
//           const exists = prev.some(
//             item => item?.credentialSubject?.ticketNumber === ticketNumber,
//           );
//           return exists ? prev : [...prev, newVC];
//         });
//       } catch (e) {
//         console.error('VC 처리 중 오류:', e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrLoadVC();
//   }, [targetUrl]);

//   // 앱 시작 시 저장된 VC 로드
//   useEffect(() => {
//     const loadStoredVCs = async () => {
//       try {
//         const keys = await AsyncStorage.getAllKeys();
//         const vcKeys = keys.filter(k => k.startsWith('vc:'));
//         const vcData = await Promise.all(
//           vcKeys.map(async key => {
//             const stored = await getItem(key);
//             return stored ? JSON.parse(stored) : null;
//           }),
//         );
//         const filtered = vcData.filter(v => v?.credentialSubject?.ticketNumber);
//         setVcList(filtered);
//       } catch (e) {
//         console.error('스토리지 로드 오류:', e);
//       }
//     };
//     loadStoredVCs();
//   }, []);

//   const handleDeleteTicket = async (ticketNumber: string) => {
//     if (!ticketNumber) return;
//     const storageKey = `vc:${ticketNumber}`;
//     await removeItem(storageKey);
//     setVcList(prev =>
//       prev.filter(v => v?.credentialSubject?.ticketNumber !== ticketNumber),
//     );
//     setIsDeleteMode(false);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Ticket Screen</Text>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.header}>
//           {loading && <ActivityIndicator size="large" color="#0000ff" />}
//           {!loading && vcList.length === 0 && (
//             <Text style={styles.vcText}>티켓이 없습니다.</Text>
//           )}

//           {vcList.map((vc, index) => {
//             const tn = vc?.credentialSubject?.ticketNumber;
//             const key = tn ?? vc?.id ?? String(index);
//             return (
//               <VCcard
//                 key={key}
//                 vc={vc}
//                 index={index}
//                 isDeleteMode={isDeleteMode}
//                 onDeletePress={handleDeleteTicket}
//               />
//             );
//           })}

//           {vcList.length > 0 && (
//             <TouchableOpacity
//               style={styles.deleteButton}
//               onPress={() => setIsDeleteMode(!isDeleteMode)}>
//               <Text style={styles.deleteButtonText}>
//                 {isDeleteMode ? '삭제 취소' : '티켓 삭제하기'}
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 20,
//     paddingHorizontal: 20,
//     backgroundColor: '#f9f9f9',
//   },
//   scrollContent: {paddingBottom: 40},
//   header: {width: '100%', alignItems: 'center', paddingHorizontal: 8},
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   vcText: {fontSize: 14, textAlign: 'center', marginTop: 20, color: '#888'},
//   deleteButton: {
//     backgroundColor: '#FF5C5C',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 10,
//     marginTop: 30,
//   },
//   deleteButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 15},
// });

// export default TicketScreen;

import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  FlatList, // ✅ 성능 최적화를 위해 변경
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute, useFocusEffect} from '@react-navigation/native';
import {get_VC} from '../utils/GetVC';
import {getItem, setItem, removeItem} from '../utils/AsyncStorage';
import VCcard from '../component/VCcard';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TicketRouteParamList = {
  Ticket: {targetUrl?: string};
};

// DID 데이터 타입 (ProfileScreen과 동일하게)
interface DidData {
  did: string;
  alias?: string;
}

function TicketScreen() {
  const route = useRoute<RouteProp<TicketRouteParamList, 'Ticket'>>();
  const targetUrl = route.params?.targetUrl;

  const [vcList, setVcList] = useState<any[]>([]);
  const [currentDid, setCurrentDid] = useState<DidData | null>(null); // ✅ 현재 선택된 DID 상태 추가
  const [loading, setLoading] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // ♻️ 데이터 로드 및 필터링 함수
  const loadStoredVCs = useCallback(async () => {
    try {
      // 1. 현재 선택된 DID 가져오기
      const selectedDidJson = await getItem('SELECTED_DID');

      if (!selectedDidJson) {
        setVcList([]);
        setCurrentDid(null);
        return; // 선택된 DID가 없으면 빈 목록 표시
      }

      const selectedDidData: DidData = JSON.parse(selectedDidJson);
      setCurrentDid(selectedDidData);

      // 2. 저장된 모든 티켓 키 가져오기
      const keys = await AsyncStorage.getAllKeys();
      const vcKeys = keys.filter(k => k.startsWith('vc:'));

      // 3. 티켓 데이터 파싱
      const vcData = await Promise.all(
        vcKeys.map(async key => {
          try {
            const stored = await getItem(key);
            return stored ? JSON.parse(stored) : null;
          } catch {
            return null;
          }
        }),
      );

      // 4. ✅ 필터링 로직 (핵심!)
      // - 데이터가 유효한지 확인
      // - VC의 소유자(credentialSubject.id)가 현재 선택된 DID와 일치하는지 확인
      const filtered = vcData.filter(v => {
        if (!v) return false;

        // VC 구조에 따라 id 위치 확인 (보통 credentialSubject.id 또는 credentialSubject.underName[0].id)
        const subject = v.credentialSubject || v.credential?.credentialSubject;
        const ticketOwnerDid = subject?.id || subject?.underName?.[0]?.id;

        // 소유자 DID와 선택된 DID가 같은 것만 통과
        return ticketOwnerDid === selectedDidData.did;
      });

      setVcList(filtered);
    } catch (e) {
      console.error('스토리지 로드 오류:', e);
    }
  }, []);

  // 1. 화면이 포커스될 때마다 데이터 갱신 (DID 변경 시 반영됨)
  useFocusEffect(
    useCallback(() => {
      loadStoredVCs();
      setIsDeleteMode(false); // 탭 이동 시 삭제 모드 초기화
    }, [loadStoredVCs]),
  );

  // 2. FCM/딥링크로 들어온 VC 처리
  useEffect(() => {
    const fetchAndSaveVC = async () => {
      if (!targetUrl) return;
      setLoading(true);
      try {
        const result = await get_VC(targetUrl);
        const vc = result?.vc;
        if (!vc) return;

        const ticketNumber = vc?.credentialSubject?.ticketNumber;
        if (!ticketNumber) return;

        const storageKey = `vc:${ticketNumber}`;
        const stored = await getItem(storageKey);

        // 새로운 티켓 저장
        if (!stored) {
          await setItem(storageKey, JSON.stringify(vc));

          // 저장 후 목록 갱신
          await loadStoredVCs();
          Alert.alert('알림', '새로운 티켓이 저장되었습니다.');
        }
      } catch (e) {
        console.error('VC 처리 중 오류:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSaveVC();
  }, [targetUrl, loadStoredVCs]);

  const handleDeleteTicket = async (ticketNumber: string) => {
    if (!ticketNumber) return;
    try {
      const storageKey = `vc:${ticketNumber}`;
      await removeItem(storageKey);

      // UI 즉시 반영
      setVcList(prev =>
        prev.filter(v => v?.credentialSubject?.ticketNumber !== ticketNumber),
      );

      if (vcList.length <= 1) setIsDeleteMode(false);
    } catch (e) {
      console.error('삭제 실패', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 타이틀 변경: 현재 어떤 DID의 지갑인지 표시 */}
      <Text style={styles.title}>
        {currentDid ? `${currentDid.alias || 'My'} Tickets` : 'Ticket Screen'}
      </Text>

      {/* 현재 DID 표시 (선택 사항) */}
      {currentDid && (
        <Text style={styles.subTitle} numberOfLines={1} ellipsizeMode="middle">
          Account: {currentDid.did}
        </Text>
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{marginTop: 10}}
        />
      )}

      {!currentDid ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.vcText}>프로필에서 DID를 선택해주세요.</Text>
        </View>
      ) : !loading && vcList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.vcText}>보유한 티켓이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={vcList}
          keyExtractor={(item, index) =>
            item?.credentialSubject?.ticketNumber ?? String(index)
          }
          renderItem={({item, index}) => (
            <VCcard
              key={item?.credentialSubject?.ticketNumber ?? index}
              vc={item}
              index={index}
              isDeleteMode={isDeleteMode}
              onDeletePress={handleDeleteTicket}
            />
          )}
          contentContainerStyle={styles.scrollContent}
          ListFooterComponent={
            <View style={{alignItems: 'center', marginTop: 20}}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setIsDeleteMode(!isDeleteMode)}>
                <Text style={styles.deleteButtonText}>
                  {isDeleteMode ? '완료' : '티켓 삭제하기'}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0, // 상단 여백 조절
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
  },
  subTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vcText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
  deleteButton: {
    backgroundColor: '#FF5C5C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default TicketScreen;
