// import React, { useEffect, useState } from 'react';
// import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
// import { getItem } from '../utils/AsyncStorage';
// import { decrypt_challenge, get_challenge, regist_token, verify_challenge } from '../utils/DIDAuth';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { RouteProp, useRoute } from '@react-navigation/native';
// import { Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';

// // 25.03.26 추가
// // Deep Link를 통한 AuhtScreen 접근 개선
// type AuthScreenRouteParams = {
//   authRequestId?: string;
// };

// // Root Stack (RootNavigator)
// type RootStackParamList = {
//   MainTabs: undefined | { screen: keyof MainTabParamList };
//   Auth: { authRequestId?: string };
// };

// // Bottom Tabs (BottomTabsNavigator)
// type MainTabParamList = {
//   Home: undefined;
//   Ticket: undefined;
//   Profile: undefined;
// };

// function AuthScreen() {
//   //25.03.26 추가
//   const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
//   const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
//   const [authRequestId, setAuthRequestId] = useState<string | undefined>(undefined);

//   const [did, setDid] = useState<any>(null);
//   const [edverkey, setEdVerkey] = useState<string | null>(null);
//   const [edsecretkey, setEdSecretkey] = useState<string | null>(null);
//   const [Xverkey, setXVerkey] = useState<string | null>(null);
//   const [Xsecretkey, setXSecretkey] = useState<string | null>(null);
//   //for test
//   const [token, setToken] = useState<any>(null);
//   //for test
//   const [challenge, setChallenge] = useState<any>(null);
//   const [decryptedchallenge, setDecryptedCahllenge] = useState<any>(null);
//   const [screenKey, setScreenKey] = useState(0);

//   const loadDid = async () => {
//       try {
//         //for test
//         const storedToken = await getItem('fcmToken');
//         console.log(`저장된 fcmToken: ${token}`);
//         setToken(storedToken);
//         //for test
//         const storedDid = await getItem('DID');
//         console.log(`저장된 DID: ${storedDid}`);
//         setDid(storedDid);
//         const storededVerkey = await getItem('edVerkey');
//         console.log(`저장된 DID의 edVerkey : ${storededVerkey}`);
//         setEdVerkey(storededVerkey);
//         const storededSecretKey = await getItem('Secretkey');
//         console.log(`저장된 DID의 edSecretKey : ${storededSecretKey}`);
//         setEdSecretkey(storededSecretKey);
//         const storedxVerkey = await getItem('xVerkey');
//         console.log(`저장된 DID의 xVerkey : ${storedxVerkey}`);
//         setXVerkey(storedxVerkey);
//         const storedxSecretkey = await getItem('xSecretkey');
//         console.log(`저장된 DID의 xSecretkey : ${storedxSecretkey}`);
//         setXSecretkey(storedxSecretkey);
//       } catch (error) {
//         console.error('DID 로드 실패:', error);
//       }
//     };

//   // 화면 로드시 로딩
//   useEffect(() => {
//     console.log('[DEBUG] route:', route);
//     setAuthRequestId(route.params?.authRequestId);
//     loadDid();
//   }, [route]);

//   // 25.03.05 Mediator에 토큰 등록
//   const registtoken = async () => {
//     if (!did) {
//       console.error("DID가 존재하지 않습니다.");
//       return;
//     }
//     const result = await regist_token(
//       did,
//       token
//     );

//     if (result) {
//       console.log("Mediator 토큰 등록 성공:", result);
//     } else {
//       console.error("Mediator 토큰 등록 실패");
//     }
//   };

//   // 25.03.12 Get Challenge
//   const getchallenge = async () => {
//     if(!did || !authRequestId) {
//       console.error("DID가 존재하지 않습니다.");
//       return;
//     }
//     const result = await get_challenge(
//       authRequestId,
//       did,
//       token
//     );
//     setChallenge(result);
//     setScreenKey(prevKey => prevKey + 1);
//     if (result) {
//       console.log("Challenge:", result);
//     } else {
//       console.error("Challenge 생성 실패");
//     }
//   }

//   // 25.03.20 추가
//   // challenge 검증
//   const decrpytchallenge = async () => {
//     if(!did || !Xverkey){
//       console.error("DID가 존재하지 않습니다.");
//       return;
//     }
//     const result = await decrypt_challenge(challenge);
//     console.log(result);
//     setDecryptedCahllenge(result);
//   }

//   // 25.03.27 수정
//   // 검증 후 모달 -> 페이지 이동 // reload
//   const verifychallenge = async () => {
//     if (!did || !decryptedchallenge || !authRequestId) {
//       console.error('did 또는 challenge가 존재하지 않습니다.');
//       return;
//     }

//     const result = await verify_challenge(authRequestId,did, decryptedchallenge);
//     console.log(result);

//     if (result === true) {
//       Alert.alert('성공', 'Auth에 성공했습니다', [
//         {
//           text: '확인',
//           onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }),
//         },
//       ]);
//     } else {
//       Alert.alert('실패', 'Auth에 실패했습니다', [
//         {
//           text: '다시 시도',
//           onPress: () => {
//             // 상태 초기화
//             setChallenge(null);
//             setDecryptedCahllenge(null);
//           },
//         },
//       ]);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>
//           this is Auth Screen
//         </Text>
//         <Text>Auth Request ID: {authRequestId}</Text>
//         <Text>Selected DID</Text>
//         <Text style={styles.didText}>{did}</Text>
//         {/* fot tets */}
//         {/* <Text>Your FCM Token</Text>
//         <Text style={styles.didText}>{token}</Text> */}
//         {/* fot tets */}
//         </View>
//         {/* fot tets */}
//         <Text>Your Challenge</Text>
//         <Text style={styles.didText}>{challenge}</Text>
//         <Text>Your Decrypted Challenge</Text>
//         <Text style={styles.didText}>{decryptedchallenge}</Text>
//         {/* fot tets */}
//       <View style={styles.buttonContainer}>
//         {/* <TouchableOpacity
//           style={styles.button}
//           onPress={registtoken}
//           >
//           <Text style={styles.buttonText}>FCM 토큰 등록</Text>
//         </TouchableOpacity> */}
//         <TouchableOpacity
//           style={styles.button}
//           onPress={getchallenge}
//         >
//           <Text style={styles.buttonText}>DID Auth -Challenge-</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.button}
//           onPress={decrpytchallenge}
//         >
//           <Text style={styles.buttonText}>DID Auth -decrypt-</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.button}
//           onPress={verifychallenge}
//         >
//           <Text style={styles.buttonText}>DID Auth -verify-</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   header: {
//     alignItems: 'center',
//     marginTop: 40,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   didText: {
//     fontSize: 16,
//     color: 'blue',
//   },
//   buttonContainer: {
//     position: 'absolute',
//     bottom: '20%',
//     alignSelf: 'center',
//     width: '100%',
//   },
//   button: {
//     backgroundColor: '#3b82f6',
//     width: '90%',
//     paddingVertical: 15,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     alignSelf: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     marginBottom : 5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default AuthScreen;

import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import {getItem} from '../utils/AsyncStorage';
import {
  decrypt_challenge,
  get_challenge,
  regist_token,
  verify_challenge,
} from '../utils/DIDAuth';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

// Root Stack 등 타입 정의는 기존 유지
type AuthScreenRouteParams = {
  authRequestId?: string;
};

type RootStackParamList = {
  MainTabs: undefined | {screen: keyof MainTabParamList};
  Auth: {authRequestId?: string};
};

type MainTabParamList = {
  Home: undefined;
  Ticket: undefined;
  Profile: undefined;
};

// ✅ ProfileScreen과 동일한 DID 데이터 인터페이스 정의
interface DidData {
  did: string;
  edVerkey: string;
  edSecretkey: string;
  xVerkey: string;
  xSecretkey: string;
  alias?: string;
}

function AuthScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
  const [authRequestId, setAuthRequestId] = useState<string | undefined>(
    undefined,
  );

  // ✅ 다중 DID 관리를 위한 상태
  const [didList, setDidList] = useState<DidData[]>([]);
  const [selectedDid, setSelectedDid] = useState<DidData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // DID 선택 모달 표시 여부

  // Auth 관련 상태
  const [token, setToken] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [decryptedchallenge, setDecryptedCahllenge] = useState<any>(null);

  // ✅ DID 목록 불러오기
  const loadDidList = async () => {
    try {
      const storedToken = await getItem('fcmToken');
      setToken(storedToken);

      // 1. DID 리스트 로드
      const listJson = await getItem('DID_LIST');
      if (listJson) {
        const list: DidData[] = JSON.parse(listJson);
        setDidList(list);

        // 2. 기본 선택 (저장된 선택값이 있으면 그것을, 없으면 첫 번째)
        const storedSelected = await getItem('SELECTED_DID');
        if (storedSelected) {
          setSelectedDid(JSON.parse(storedSelected));
        } else if (list.length > 0) {
          setSelectedDid(list[0]);
        }
      }
    } catch (error) {
      console.error('DID 로드 실패:', error);
    }
  };

  useEffect(() => {
    console.log('[DEBUG] route:', route);
    setAuthRequestId(route.params?.authRequestId);
    loadDidList();
  }, [route]);

  // ✅ DID 선택 핸들러
  const handleSelectDid = (item: DidData) => {
    setSelectedDid(item);
    setIsModalVisible(false);
    // 상태 초기화 (DID가 바뀌면 이전 인증 과정은 무효화)
    setChallenge(null);
    setDecryptedCahllenge(null);
  };

  // 1. Mediator 토큰 등록
  const registtoken = async () => {
    if (!selectedDid) {
      Alert.alert('오류', 'DID를 선택해주세요.');
      return;
    }
    const result = await regist_token(
      selectedDid.did, // ✅ 선택된 DID 사용
      token,
    );

    if (result) {
      console.log('Mediator 토큰 등록 성공:', result);
      Alert.alert('성공', 'Mediator 토큰이 등록되었습니다.');
    } else {
      console.error('Mediator 토큰 등록 실패');
    }
  };

  // 2. Challenge 요청
  const getchallenge = async () => {
    if (!selectedDid || !authRequestId) {
      Alert.alert('오류', 'DID 또는 Auth Request ID가 없습니다.');
      return;
    }
    const result = await get_challenge(
      authRequestId,
      selectedDid.did, // ✅ 선택된 DID 사용
      token,
    );
    setChallenge(result);

    if (result) {
      console.log('Challenge:', result);
    } else {
      console.error('Challenge 생성 실패');
      Alert.alert('오류', 'Challenge 생성에 실패했습니다.');
    }
  };

  // 3. Challenge 복호화
  const decrpytchallenge = async () => {
    if (!selectedDid) {
      Alert.alert('오류', 'DID를 선택해주세요.');
      return;
    }

    // ⚠️ 주의: decrypt_challenge 함수가 인자로 key를 받도록 구현되어 있어야 합니다.
    // 기존에는 AsyncStorage에서 직접 꺼내 썼다면, 이제는 selectedDid.xSecretkey를 넘겨줘야 합니다.
    // 만약 utils 함수가 인자를 안 받으면 utils/DIDAuth.ts 수정이 필요합니다.
    try {
      // 예시: decrypt_challenge(challenge, selectedDid.xSecretkey) 형태로 호출 권장
      const result = await decrypt_challenge(challenge);
      console.log('Decrypted:', result);
      setDecryptedCahllenge(result);
    } catch (e) {
      console.error(e);
      Alert.alert('복호화 실패');
    }
  };

  // 4. 검증 및 이동
  const verifychallenge = async () => {
    if (!selectedDid || !decryptedchallenge || !authRequestId) {
      Alert.alert('오류', '인증 정보가 부족합니다.');
      return;
    }

    const result = await verify_challenge(
      authRequestId,
      selectedDid.did, // ✅ 선택된 DID 사용
      decryptedchallenge,
    );
    console.log('Verify Result:', result);

    if (result === true) {
      Alert.alert('성공', 'Auth에 성공했습니다', [
        {
          text: '확인',
          onPress: () => navigation.navigate('MainTabs', {screen: 'Home'}),
        },
      ]);
    } else {
      Alert.alert('실패', 'Auth에 실패했습니다', [
        {
          text: '다시 시도',
          onPress: () => {
            setChallenge(null);
            setDecryptedCahllenge(null);
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DID Auth Screen</Text>
        <Text style={styles.subText}>
          Request ID: {authRequestId || '없음'}
        </Text>

        {/* ✅ DID 선택 영역 */}
        <View style={styles.selectorContainer}>
          <Text style={styles.label}>인증에 사용할 DID:</Text>
          {selectedDid ? (
            <View style={styles.selectedInfo}>
              <Text style={styles.didAlias}>{selectedDid.alias}</Text>
              <Text style={styles.didString}>{selectedDid.did}</Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>DID를 선택해주세요</Text>
          )}

          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setIsModalVisible(true)}>
            <Text style={styles.changeButtonText}>DID 변경</Text>
          </TouchableOpacity>
        </View>

        {/* 디버그용 정보 표시 (필요 시 주석 해제) */}
        {/* <Text>Challenge: {challenge ? 'Received' : 'None'}</Text>
        <Text>Decrypted: {decryptedchallenge ? 'Success' : 'None'}</Text> */}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={getchallenge}>
          <Text style={styles.buttonText}>1. Challenge 요청</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={decrpytchallenge}>
          <Text style={styles.buttonText}>2. Challenge 복호화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={verifychallenge}>
          <Text style={styles.buttonText}>3. 최종 인증 (Verify)</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ DID 선택 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>DID 선택</Text>
            <FlatList
              data={didList}
              keyExtractor={item => item.did}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedDid?.did === item.did && styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelectDid(item)}>
                  <Text style={styles.itemAlias}>{item.alias}</Text>
                  <Text style={styles.itemDid} numberOfLines={1}>
                    {item.did}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{padding: 20, textAlign: 'center'}}>
                  저장된 DID가 없습니다.
                </Text>
              }
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },

  // DID 선택기 스타일
  selectorContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  didAlias: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  didString: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  placeholder: {
    color: '#999',
    marginBottom: 10,
  },
  changeButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // 메인 버튼 스타일
  buttonContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  button: {
    backgroundColor: '#3b82f6',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemSelected: {
    backgroundColor: '#eff6ff',
  },
  itemAlias: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDid: {
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AuthScreen;
