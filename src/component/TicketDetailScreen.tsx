import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createVP } from '../utils/VPGenerator';

type RootStackParamList = {
  TicketDetail: { vc: any };
  Ticket: undefined; // 돌아갈 스크린 타입 명시 (선택)
};

function TicketDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TicketDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const vc = route.params.vc;
  const [vp, setVp] = React.useState<string | null>(null);

  const create_vp = async () => {
    const result = await createVP(vc)
    setVp(result);
  }

  return (
    <SafeAreaView>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>티켓 상세 정보</Text>
      <Text style={styles.json}>{JSON.stringify(vc, null, 2)}</Text>

      {/* 🔙 돌아가기 버튼 */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← 목록으로 돌아가기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.Button} onPress={create_vp}>
        <Text style={styles.backButtonText}>VP 생성</Text>
      </TouchableOpacity>
      {vp && (
          <View>
            <Text style={styles.title}>VP (JWS)</Text>
            <Text style={styles.json}>{vp}</Text>
          </View>
        )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  json: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: '#333',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4D8AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  Button : {
    marginTop : 10,
    backgroundColor: '#4D8AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  }
});

export default TicketDetailScreen;
