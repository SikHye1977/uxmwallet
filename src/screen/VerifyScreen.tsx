import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {get_request_object, post_vp, verify_challenge} from '../utils/Verify';
import {getItem} from '../utils/AsyncStorage';
import {decrypt_challenge} from '../utils/Verify';

type RootStackParamList = {
  Verify: {vp: any; requestUri: string};
};

interface DidData {
  did: string;
  alias?: string;
  xSecretkey: string;
}

function VerifyScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Verify'>>();
  const [selectedDid, setSelectedDid] = useState<DidData | null>(null);
  const [SubmissionUrl, setSubmissionUrl] = useState('');
  const [didAuthUrl, setDidAuthUrl] = useState('');
  const [challenge, setChallenge] = useState('');
  const {vp, requestUri} = route.params;

  const SetDid = async () => {
    const selectedDidJson = await getItem('SELECTED_DID');
    const selectedDidData: DidData = JSON.parse(selectedDidJson);
    setSelectedDid(selectedDidData);
  };

  // 1. vp submission url 받아오기
  const handleVerifyProcess = async () => {
    const vc = vp.verifiableCredential[0];
    const subject = vc.credentialSubject;

    if (!selectedDid) {
      console.error('DID가 선택되지 않았습니다.');
      return;
    }

    try {
      const response = await get_request_object(
        requestUri,
        subject.ticketNumber,
        subject.id,
        selectedDid.did,
      );
      console.log(requestUri);
      console.log('서버 응답:', response);

      if (response && response.presentationSubmissionURL) {
        setSubmissionUrl(response.presentationSubmissionURL);

        console.log('URL 저장 완료:', response.presentationSubmissionURL);
      }
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error);
    }
  };

  // 2. submission url로 vp 제출
  const submitVP = async () => {
    if (!SubmissionUrl) {
      console.error('url이 없습니다.');
      return;
    }

    try {
      const response = await post_vp(SubmissionUrl, vp);
      console.log('서버 응답: ', response);
      setChallenge(response.challenge);
      setDidAuthUrl(response.DIDAuthURL);
    } catch (error) {
      console.error('vp검증 실패:', error);
    }
  };

  // 3. holder did auth 진행
  const did_auth = async () => {
    if (!(challenge && didAuthUrl)) {
      console.error('challenge가 없습니다.');
      return;
    }
    if (!selectedDid) {
      console.error('did가 없습니다.');
      return;
    }

    try {
      const decryptedRes = await decrypt_challenge(
        challenge,
        selectedDid.xSecretkey,
      );
      console.log('복호화된 원본 문자열: ', decryptedRes);
      if (!decryptedRes) {
        throw new Error('복호화 실패');
      }
      const response = await verify_challenge(
        didAuthUrl,
        selectedDid.did,
        decryptedRes,
      );
      console.log(response);
      if (response == true) {
        Alert.alert('검증 완료');
      }
    } catch (error) {
      console.error('did auth 실패:', error);
    }
  };

  useEffect(() => {
    SetDid();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>검증 화면</Text>

        <View style={styles.vpContainer}>
          <Text style={styles.label}>선택된 DID:</Text>
          <Text style={styles.label}>
            {selectedDid?.alias} ({selectedDid?.did})
          </Text>
          <Text style={styles.label}>선택 된 티켓 VP:</Text>
          <ScrollView style={styles.jsonBox}>
            <Text style={styles.jsonText}>{JSON.stringify(vp, null, 2)}</Text>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyProcess}>
          <Text style={styles.buttonText}>티켓 VP 검증 진행 - request url</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.verifyButton} onPress={submitVP}>
          <Text style={styles.buttonText}>티켓 VP 검증 진행 - submit vp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.verifyButton} onPress={did_auth}>
          <Text style={styles.buttonText}>티켓 VP 검증 진행 - did auth</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>뒤로가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {flex: 1, padding: 20},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  vpContainer: {flex: 1, marginBottom: 20},
  label: {fontSize: 16, fontWeight: '600', marginBottom: 10},
  jsonBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  jsonText: {fontSize: 12, fontFamily: 'Courier'},
  verifyButton: {
    backgroundColor: '#4D8AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {color: 'white', fontWeight: 'bold', fontSize: 16},
});

export default VerifyScreen;
