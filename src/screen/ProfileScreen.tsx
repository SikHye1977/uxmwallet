import React, { useState, useEffect } from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { removeItem, setItem, getItem } from '../utils/AsyncStorage';
import { generateDID, registerDID } from '../utils/DIDGenerator';

function ProfileScreen() {
  const [did, setDid] = useState<any>(null);
  const [verkey, setVerkey] = useState<string | null>(null);
  const [secretkey, setSecretkey] = useState<string | null>(null);

  // 25.02.10 indy vdr 활용해서 DID 등록하게 변경
  const create_did = async () => {
    const result_did = await generateDID();

    setDid(result_did.did);
    setVerkey(result_did.publicKey);
    setSecretkey(result_did.privateKey);

    await setItem('DID', result_did.did);
    await setItem('Verkey',result_did.publicKey);
    await setItem('Secretkey',result_did.privateKey);
  }

  const register_did = async () => {
    if (!did || !verkey) {
      Alert.alert('등록 실패', 'DID 또는 Verkey가 존재하지 않습니다.');
      return;
    }
    try {
      await registerDID('J4BALc9uEa8F1GCy7uka7f', did, verkey);
      Alert.alert('등록 성공', 'Ledger에 DID가 등록되었습니다.');
    } catch (error) {
      console.error('등록 실패:', error);
      Alert.alert('등록 실패');
    }
  };
  
  //-------------------------------------------------------------//
  // 테스트 용 DID 데이터 삭제
  const remove_did = async() => {
    if (!did) {
      Alert.alert('삭제 실패', 'DID 또는 Verkey가 존재하지 않습니다.');
      return;
    }
    try {
      await removeItem('DID');
      await removeItem('Verkey');
      await removeItem('Secretkey');
      Alert.alert('삭제 성공', '디바이스에 저장된 DID를 삭제했습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      Alert.alert('삭제 실패');
    }
  }
  //-------------------------------------------------------------//

  // 디바이스에 저장된 DID를 불러옴
  const loadDid = async () => {
    try {
      const storedDid = await getItem('DID');
      console.log(`저장된 DID: ${storedDid}`);
      setDid(storedDid);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Page</Text>
        {did ? (
          <View>
            <Text style={styles.didText}>My DID: {did}</Text>
            <Text style={styles.didText}>My DID's Verkey: {verkey}</Text>
            <Text style={styles.didText}>My DID's SecretKey: {secretkey}</Text>
          </View>
        ) : (
          <Text style={styles.didText}>No DID Found</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        {!did && (
          <TouchableOpacity
            style={styles.button}
            onPress={create_did}
          >
            <Text style={styles.buttonText}>DID 생성</Text>
          </TouchableOpacity>
        )}
        {did && (
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={register_did}
              >
              <Text style={styles.buttonText}>DID 등록</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={remove_did}
              >
              <Text style={styles.buttonText}>DID 삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
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

export default ProfileScreen;