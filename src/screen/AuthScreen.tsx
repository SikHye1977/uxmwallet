import React, { useEffect, useState } from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { getItem } from '../utils/AsyncStorage';
import { DidAuth } from '../utils/DIDAuth';

function AuthScreen() {
  const [did, setDid] = useState<any>(null);
    
  const loadDid = async () => {
      try {
        const storedDid = await getItem('DID');
        console.log(`저장된 DID: ${storedDid}`);
        setDid(storedDid);
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
    <View>
      <Text>
        this is Auth Screen
      </Text>
      <Text>My DID: {did}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={didauth}
        >
        <Text style={styles.buttonText}>DID로 로그인</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
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