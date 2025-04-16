import React, { useEffect, useState } from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { getItem } from '../utils/AsyncStorage';
import { decrypt_challenge, get_challenge, regist_token, verify_challenge } from '../utils/DIDAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// 25.03.26 추가
// Deep Link를 통한 AuhtScreen 접근 개선
type AuthScreenRouteParams = {
  authRequestId?: string;
};

// Root Stack (RootNavigator)
type RootStackParamList = {
  MainTabs: undefined | { screen: keyof MainTabParamList };
  Auth: { authRequestId?: string };
};

// Bottom Tabs (BottomTabsNavigator)
type MainTabParamList = {
  Home: undefined;
  Ticket: undefined;
  Profile: undefined;
};


function AuthScreen() {
  //25.03.26 추가
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
  const [authRequestId, setAuthRequestId] = useState<string | undefined>(undefined);
  
  const [did, setDid] = useState<any>(null);
  const [edverkey, setEdVerkey] = useState<string | null>(null);
  const [edsecretkey, setEdSecretkey] = useState<string | null>(null);
  const [Xverkey, setXVerkey] = useState<string | null>(null);
  const [Xsecretkey, setXSecretkey] = useState<string | null>(null);
  //for test
  const [token, setToken] = useState<any>(null);
  //for test 
  const [challenge, setChallenge] = useState<any>(null);
  const [decryptedchallenge, setDecryptedCahllenge] = useState<any>(null);
  const [screenKey, setScreenKey] = useState(0);

  const loadDid = async () => {
      try {
        //for test
        const storedToken = await getItem('fcmToken');
        console.log(`저장된 fcmToken: ${token}`);
        setToken(storedToken);
        //for test
        const storedDid = await getItem('DID');
        console.log(`저장된 DID: ${storedDid}`);
        setDid(storedDid);
        const storededVerkey = await getItem('edVerkey');
        console.log(`저장된 DID의 edVerkey : ${storededVerkey}`);
        setEdVerkey(storededVerkey);
        const storededSecretKey = await getItem('Secretkey');
        console.log(`저장된 DID의 edSecretKey : ${storededSecretKey}`);
        setEdSecretkey(storededSecretKey);
        const storedxVerkey = await getItem('xVerkey');
        console.log(`저장된 DID의 xVerkey : ${storedxVerkey}`);
        setXVerkey(storedxVerkey);
        const storedxSecretkey = await getItem('xSecretkey');
        console.log(`저장된 DID의 xSecretkey : ${storedxSecretkey}`);
        setXSecretkey(storedxSecretkey);
      } catch (error) {
        console.error('DID 로드 실패:', error);
      }
    };

  // 화면 로드시 로딩
  useEffect(() => {
    console.log('[DEBUG] route:', route);
    setAuthRequestId(route.params?.authRequestId);
    loadDid();
  }, [route]);
  
  // 25.03.05 Mediator에 토큰 등록
  const registtoken = async () => {
    if (!did) {
      console.error("DID가 존재하지 않습니다.");
      return;
    }
    const result = await regist_token(
      did,
      token
    );
    
    if (result) {
      console.log("Mediator 토큰 등록 성공:", result);
    } else {
      console.error("Mediator 토큰 등록 실패");
    }
  };

  // 25.03.12 Get Challenge 
  const getchallenge = async () => {
    if(!did || !authRequestId) {
      console.error("DID가 존재하지 않습니다.");
      return;
    }
    const result = await get_challenge(
      authRequestId,
      did,
      token
    );
    setChallenge(result);
    setScreenKey(prevKey => prevKey + 1);
    if (result) {
      console.log("Challenge:", result);
    } else {
      console.error("Challenge 생성 실패");
    }
  }
  
  // 25.03.20 추가
  // challenge 검증
  const decrpytchallenge = async () => {
    if(!did || !Xverkey){
      console.error("DID가 존재하지 않습니다.");
      return;
    }
    const result = await decrypt_challenge(challenge);
    console.log(result);
    setDecryptedCahllenge(result);
  }

  // 25.03.27 수정
  // 검증 후 모달 -> 페이지 이동 // reload
  const verifychallenge = async () => {
    if (!did || !decryptedchallenge || !authRequestId) {
      console.error('did 또는 challenge가 존재하지 않습니다.');
      return;
    }
  
    const result = await verify_challenge(authRequestId,did, decryptedchallenge);
    console.log(result);
  
    if (result === true) {
      Alert.alert('성공', 'Auth에 성공했습니다', [
        {
          text: '확인',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }),
        },
      ]);
    } else {
      Alert.alert('실패', 'Auth에 실패했습니다', [
        {
          text: '다시 시도',
          onPress: () => {
            // 상태 초기화
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
        <Text style={styles.title}>
          this is Auth Screen
        </Text>
        <Text>Auth Request ID: {authRequestId}</Text>
        <Text>Selected DID</Text>
        <Text style={styles.didText}>{did}</Text>
        {/* fot tets */}
        {/* <Text>Your FCM Token</Text>
        <Text style={styles.didText}>{token}</Text> */}
        {/* fot tets */}
        </View>
        {/* fot tets */}
        <Text>Your Challenge</Text>
        <Text style={styles.didText}>{challenge}</Text>
        <Text>Your Decrypted Challenge</Text>
        <Text style={styles.didText}>{decryptedchallenge}</Text>
        {/* fot tets */}
      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity
          style={styles.button}
          onPress={registtoken}
          >
          <Text style={styles.buttonText}>FCM 토큰 등록</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.button}
          onPress={getchallenge}
        >
          <Text style={styles.buttonText}>DID Auth -Challenge-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={decrpytchallenge}
        >
          <Text style={styles.buttonText}>DID Auth -decrypt-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={verifychallenge}
        >
          <Text style={styles.buttonText}>DID Auth -verify-</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  didText: {
    fontSize: 16,
    color: 'blue',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: '20%',
    alignSelf: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#3b82f6',
    width: '90%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom : 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AuthScreen;