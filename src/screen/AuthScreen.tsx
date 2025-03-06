import React, { useEffect, useState } from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { getItem } from '../utils/AsyncStorage';
import { DidAuth } from '../utils/DIDAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

function AuthScreen() {
  const [did, setDid] = useState<any>(null);
  //for test
  const [token, setToken] = useState<any>(null);
  //for test 
  
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
      } catch (error) {
        console.error('DID 로드 실패:', error);
      }
  };

  // 화면 로드시 로딩
    useEffect(() => {
      loadDid();
    }, []);
  
    const didauth = async () => {
      if (!did) {
        console.error("DID가 존재하지 않습니다.");
        return;
      }
      const result = await DidAuth(
        did,
        "cd4I5RzpG0Mjv-QPbF-QQ1:APA91bE5Cfi3e3-bXDl5Os4uPTVvqkjj61IWPIwvCeQucIQ21RsTpA7PoLYENsl0EG-m5Z4RishNO08Ctt4ZksXBQ7GmGTuAAyK-tQx0TTwHoJcEbjC2GLs"
      );
    
      if (result) {
        console.log("DID 인증 성공:", result);
      } else {
        console.error("DID 인증 실패");
      }
    };
    

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
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={didauth}
          >
          <Text style={styles.buttonText}>DID로 로그인</Text>
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