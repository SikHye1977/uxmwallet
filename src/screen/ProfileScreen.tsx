import React, { useState, useEffect } from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { removeItem, setItem, getItem } from '../utils/AsyncStorage';
import { generateSeparateKeyPairs, registerDID, addX25519PublicKey } from '../utils/DIDGenerator';

function ProfileScreen() {
  const [did, setDid] = useState<any>(null);
  const [Edverkey, setEdVerkey] = useState<string | null>(null);
  const [Edsecretkey, setEdSecretkey] = useState<string | null>(null);
  const [Xverkey, setXVerkey] = useState<string | null>(null);
  const [Xsecretkey, setXSecretkey] = useState<string | null>(null);

  // 25.02.10 indy vdr 활용해서 DID 등록하게 변경
  // 25.03.18 x25519 키페어 추가
  const create_did = async () => {
    const result_did = await generateSeparateKeyPairs();

    setDid(result_did.did);
    setEdVerkey(result_did.edPublicKey);
    setEdSecretkey(result_did.edPrivateKey);
    setXVerkey(result_did.x25519PublicKey);
    setXSecretkey(result_did.x25519PrivateKey);

    await setItem('DID', result_did.did);
    await setItem('edVerkey',result_did.edPublicKey);
    await setItem('edSecretkey',result_did.edPrivateKey);
    await setItem('xVerkey', result_did.x25519PublicKey);
    await setItem('xSecretkey',result_did.x25519PrivateKey);
  }

  // const register_did = async () => {
  //   if (!did || !Edverkey) {
  //     Alert.alert('등록 실패', 'DID 또는 Verkey가 존재하지 않습니다.');
  //     return;
  //   }
  //   try {
  //     await registerDID('J4BALc9uEa8F1GCy7uka7f', did, Edverkey);
  //     Alert.alert('등록 성공', 'Ledger에 DID가 등록되었습니다.');
  //   } catch (error) {
  //     console.error('등록 실패:', error);
  //     Alert.alert('등록 실패');
  //   }
  // };
  // 25.03.18 수정
  const register_did = async () => {
    if (!did || !Edverkey || !Xverkey || !Edsecretkey) { // ✅ X25519 키도 확인해야 함
      Alert.alert('등록 실패', 'DID 또는 Verkey가 존재하지 않습니다.');
      return;
    }
    try {
      // ✅ 1. DID를 Ed25519 키로 등록 (NYM 트랜잭션)
      const registerResponse = await registerDID('J4BALc9uEa8F1GCy7uka7f', did, Edverkey);
      if (!registerResponse) {
        Alert.alert('등록 실패', 'DID 등록에 실패했습니다.');
        return;
      }
      
      console.log("✅ NYM 트랜잭션 완료. 이제 X25519 키를 등록합니다.");
  
      // ✅ 2. X25519 키를 포함한 DID Document를 Indy Ledger에 추가 (ATTRIB 트랜잭션)
      // const attribResponse = await addDIDDocument('J4BALc9uEa8F1GCy7uka7f', did, Edverkey, Xverkey);
      const attribResponse = await addX25519PublicKey(did, did, Xverkey, Edsecretkey);
      if (!attribResponse) {
        Alert.alert('DID Document 등록 실패', 'X25519 키 추가에 실패했습니다.');
        return;
      }
  
      Alert.alert('등록 성공', 'Ledger에 DID 및 X25519 키가 등록되었습니다.');
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
      await removeItem('edVerkey');
      await removeItem('edSecretkey');
      await removeItem('xVerkey');
      await removeItem('xSecretkey');

      setDid(null);
      setEdVerkey(null);
      setEdSecretkey(null);
      setXVerkey(null);
      setXSecretkey(null);
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
      const storededVerkey = await getItem('edVerkey');
      console.log(`저장된 DID의 edVerkey : ${storededVerkey}`);
      setEdVerkey(storededVerkey);
      const storededSecretKey = await getItem('edSecretkey');
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
    loadDid();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Page</Text>
        {did ? (
          <View>
            <Text style={styles.didText}>My DID: {did}</Text>
            <Text style={styles.didText}>My DID's edVerkey: {Edverkey}</Text>
            <Text style={styles.didText}>My DID's edSecretKey: {Edsecretkey}</Text>
            <Text style={styles.didText}>My DID's xVerkey: {Xverkey}</Text>
            <Text style={styles.didText}>My DID's xSecretKey: {Xsecretkey}</Text>
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