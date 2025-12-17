import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Verify: {vp: any};
};

function VerifyScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Verify'>>();

  const {vp} = route.params;

  const handleVerifyProcess = () => {
    console.log('검증 로직 시작:', vp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>검증 화면</Text>

        <View style={styles.vpContainer}>
          <Text style={styles.label}>선택 된 티켓 VP:</Text>
          <ScrollView style={styles.jsonBox}>
            <Text style={styles.jsonText}>{JSON.stringify(vp, null, 2)}</Text>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyProcess}>
          <Text style={styles.buttonText}>티켓 VP 검증 진행</Text>
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
