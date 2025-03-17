import React, { useEffect, useState } from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { getItem } from '../utils/AsyncStorage';
import { decrypt_challenge, get_challenge, regist_token } from '../utils/DIDAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

function AuthScreen() {
  const [did, setDid] = useState<any>(null);
  const [verkey, setVerkey] = useState<string | null>(null);
  const [secretkey, setSecretkey] = useState<string | null>(null);
  //for test
  const [token, setToken] = useState<any>(null);
  //for test 
  const [challenge, setChallenge] = useState<any>(null);
  const [decryptedchallenge, setDecryptedCahllenge] = useState<any>(null);
  const [screenKey, setScreenKey] = useState(0);

  const loadDid = async () => {
      try {
        const storedDid = await getItem('DID');
        console.log(`저장된 DID: ${storedDid}`);
        setDid(storedDid);
        //for test
        const storedToken = await getItem('fcmToken');
        console.log(`저장된 fcmToken: ${token}`);
        setToken(storedToken);
        //for test
        const storedVerkey = await getItem('Verkey');
        console.log(`저장된 DID의 Verkey : ${storedVerkey}`);
        setVerkey(storedVerkey);
        const storedSecretKey = await getItem('Secretkey');
        console.log(`저장된 DID의 SecretKey : ${storedSecretKey}`);
        setSecretkey(storedSecretKey);
      } catch (error) {
        console.error('DID 로드 실패:', error);
      }
  };

  // 화면 로드시 로딩
  useEffect(() => {
    loadDid();
  }, []);
  
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
    if(!did) {
      console.error("DID가 존재하지 않습니다.");
      return;
    }
    const result = await get_challenge(
      did
    );
    setChallenge(result);
    setScreenKey(prevKey => prevKey + 1);
    if (result) {
      console.log("Challenge:", result);
    } else {
      console.error("Challenge 생성 실패");
    }
  }
    
  const decrpytchallenge = async () => {
    if(!did || !verkey || !secretkey){
      console.error("DID가 존재하지 않습니다.");
      return;
    }
    const result = await decrypt_challenge(challenge,verkey,secretkey);
    console.log(result);
    setDecryptedCahllenge(result);
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          this is Auth Screen
        </Text>
        <Text>Selected DID</Text>
        <Text style={styles.didText}>{did}</Text>
        {/* fot tets */}
        <Text>Your FCM Token</Text>
        <Text style={styles.didText}>{token}</Text>
        {/* fot tets */}
        </View>
        {/* fot tets */}
        <Text>Your Challenge</Text>
        <Text>{challenge}</Text>
        {/* fot tets */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={registtoken}
          >
          <Text style={styles.buttonText}>FCM 토큰 등록</Text>
        </TouchableOpacity>
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