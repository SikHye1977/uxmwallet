import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute} from '@react-navigation/native';
import {get_VC} from '../utils/GetVC';
import {getItem, setItem, removeItem} from '../utils/AsyncStorage';
import VCcard from '../component/VCcard';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 25.08.20 추가
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';

type TicketRouteParamList = {
  Ticket: {targetUrl?: string};
};

function TicketScreen() {
  const route = useRoute<RouteProp<TicketRouteParamList, 'Ticket'>>();
  const targetUrl = route.params?.targetUrl;

  const [vcList, setVcList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // 25.08.20 추가
  useFocusEffect(
    useCallback(() => {
      const loadStoredVCs = async () => {
        try {
          const keys = await AsyncStorage.getAllKeys();
          const vcKeys = keys.filter(k => k.startsWith('vc:'));
          const vcData = await Promise.all(
            vcKeys.map(async key => {
              const stored = await getItem(key);
              return stored ? JSON.parse(stored) : null;
            }),
          );
          const filtered = vcData.filter(
            v =>
              v?.credentialSubject?.ticketNumber ||
              v?.credential?.credentialSubject?.ticketNumber, // 과거 스키마도 안전 처리
          );
          setVcList(filtered);
        } catch (e) {
          console.error('스토리지 로드 오류:', e);
        }
      };
      loadStoredVCs();
    }, []),
  );
  // FCM/딥링크로 들어온 VC 저장 + 목록 반영
  useEffect(() => {
    const fetchOrLoadVC = async () => {
      if (!targetUrl) return;
      setLoading(true);
      try {
        const result = await get_VC(targetUrl);
        console.log('🧾 VC 응답 전체:', JSON.stringify(result, null, 2));

        const vc = result?.vc;
        if (!vc) return;

        const ticketNumber = vc?.credentialSubject?.ticketNumber;
        if (!ticketNumber) {
          console.warn('❗ ticketNumber 없음 (응답 구조 확인 필요)');
          return;
        }

        const storageKey = `vc:${ticketNumber}`;
        const stored = await getItem(storageKey);

        const newVC = stored ? JSON.parse(stored) : vc;
        if (!stored) {
          await setItem(storageKey, JSON.stringify(newVC));
          console.log(`setItem... ${storageKey} : ${JSON.stringify(newVC)}`);
        }

        setVcList(prev => {
          const exists = prev.some(
            item => item?.credentialSubject?.ticketNumber === ticketNumber,
          );
          return exists ? prev : [...prev, newVC];
        });
      } catch (e) {
        console.error('VC 처리 중 오류:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrLoadVC();
  }, [targetUrl]);

  // 앱 시작 시 저장된 VC 로드
  useEffect(() => {
    const loadStoredVCs = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const vcKeys = keys.filter(k => k.startsWith('vc:'));
        const vcData = await Promise.all(
          vcKeys.map(async key => {
            const stored = await getItem(key);
            return stored ? JSON.parse(stored) : null;
          }),
        );
        const filtered = vcData.filter(v => v?.credentialSubject?.ticketNumber);
        setVcList(filtered);
      } catch (e) {
        console.error('스토리지 로드 오류:', e);
      }
    };
    loadStoredVCs();
  }, []);

  const handleDeleteTicket = async (ticketNumber: string) => {
    if (!ticketNumber) return;
    const storageKey = `vc:${ticketNumber}`;
    await removeItem(storageKey);
    setVcList(prev =>
      prev.filter(v => v?.credentialSubject?.ticketNumber !== ticketNumber),
    );
    setIsDeleteMode(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ticket Screen</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          {!loading && vcList.length === 0 && (
            <Text style={styles.vcText}>티켓이 없습니다.</Text>
          )}

          {vcList.map((vc, index) => {
            const tn = vc?.credentialSubject?.ticketNumber;
            const key = tn ?? vc?.id ?? String(index);
            return (
              <VCcard
                key={key}
                vc={vc}
                index={index}
                isDeleteMode={isDeleteMode}
                onDeletePress={handleDeleteTicket}
              />
            );
          })}

          {vcList.length > 0 && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setIsDeleteMode(!isDeleteMode)}>
              <Text style={styles.deleteButtonText}>
                {isDeleteMode ? '삭제 취소' : '티켓 삭제하기'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {paddingBottom: 40},
  header: {width: '100%', alignItems: 'center', paddingHorizontal: 8},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  vcText: {fontSize: 14, textAlign: 'center', marginTop: 20, color: '#888'},
  deleteButton: {
    backgroundColor: '#FF5C5C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 30,
  },
  deleteButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 15},
});

export default TicketScreen;
