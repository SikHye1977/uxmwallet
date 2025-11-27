import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute, useFocusEffect} from '@react-navigation/native';
import {get_VC} from '../utils/GetVC';
import {getItem, setItem, removeItem} from '../utils/AsyncStorage';
import VCcard from '../component/VCcard';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TicketRouteParamList = {
  Ticket: {targetUrl?: string};
};

interface DidData {
  did: string;
  alias?: string;
}

function TicketScreen() {
  const route = useRoute<RouteProp<TicketRouteParamList, 'Ticket'>>();
  const targetUrl = route.params?.targetUrl;

  const [vcList, setVcList] = useState<any[]>([]);
  const [currentDid, setCurrentDid] = useState<DidData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // 1️⃣ 데이터 로드 및 필터링
  const loadStoredVCs = useCallback(async () => {
    try {
      // 1. 현재 선택된 DID 가져오기
      const selectedDidJson = await getItem('SELECTED_DID');

      // 선택된 DID가 없으면 초기화
      if (!selectedDidJson) {
        setVcList([]);
        setCurrentDid(null);
        return;
      }

      const selectedDidData: DidData = JSON.parse(selectedDidJson);
      setCurrentDid(selectedDidData);

      // 2. 저장된 모든 티켓 데이터 가져오기
      const keys = await AsyncStorage.getAllKeys();
      // 키가 'vc:'로 시작하는 것들 찾기
      const vcKeys = keys.filter(k => k.startsWith('vc:'));

      const vcData = await Promise.all(
        vcKeys.map(async key => {
          try {
            const stored = await getItem(key);
            return stored ? JSON.parse(stored) : null;
          } catch {
            return null;
          }
        }),
      );

      // 3. ✅ 필터링: "이 티켓의 주인이 현재 선택된 DID인가?"
      const filtered = vcData.filter(v => {
        if (!v) return false;

        const subject = v.credentialSubject || v.credential?.credentialSubject;
        const ticketOwnerDid = subject?.id; // 티켓 주인 DID

        // 디버깅용 로그 (확인 후 삭제 가능)
        // console.log(`티켓주인: ${ticketOwnerDid} vs 내DID: ${selectedDidData.did}`);

        // 정확히 일치하는 것만 리턴
        return ticketOwnerDid === selectedDidData.did;
      });

      setVcList(filtered);
    } catch (e) {
      console.error('스토리지 로드 오류:', e);
    }
  }, []);

  // 화면이 포커스될 때마다 데이터 갱신
  useFocusEffect(
    useCallback(() => {
      loadStoredVCs();
      setIsDeleteMode(false);
    }, [loadStoredVCs]),
  );

  // 2️⃣ VC 발급 및 저장 (FCM/딥링크 처리)
  useEffect(() => {
    const fetchAndSaveVC = async () => {
      if (!targetUrl) return;
      setLoading(true);
      try {
        const result = await get_VC(targetUrl);
        const vc = result?.vc;
        if (!vc) return;

        const subject =
          vc.credentialSubject || vc.credential?.credentialSubject;
        const ticketNumber = subject?.ticketNumber;
        const ownerDid = subject?.id; // 티켓 주인 DID

        if (!ticketNumber || !ownerDid) {
          console.warn('티켓 번호나 소유자 ID가 없습니다.');
          return;
        }

        // ✅ 중요: 키 생성 시 DID를 포함시켜 중복 덮어쓰기 방지
        const storageKey = `vc:${ticketNumber}_${ownerDid}`;

        // 저장
        await setItem(storageKey, JSON.stringify(vc));
        Alert.alert('알림', '새로운 티켓이 저장되었습니다.');

        // 저장 후 목록 갱신
        await loadStoredVCs();
      } catch (e) {
        console.error('VC 처리 중 오류:', e);
        Alert.alert('오류', '티켓 발급 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndSaveVC();
  }, [targetUrl, loadStoredVCs]);

  // 3️⃣ 티켓 삭제
  const handleDeleteTicket = async (ticketNumber: string) => {
    if (!ticketNumber || !currentDid) return;
    try {
      // 삭제할 때도 DID를 포함한 키를 찾아야 함
      const storageKey = `vc:${ticketNumber}_${currentDid.did}`;
      await removeItem(storageKey);

      // 리스트 갱신
      await loadStoredVCs();

      if (vcList.length <= 1) setIsDeleteMode(false);
    } catch (e) {
      console.error('삭제 실패', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {currentDid ? `${currentDid.alias || 'My'} Tickets` : 'Ticket Screen'}
      </Text>

      {currentDid && (
        <Text style={styles.subTitle} numberOfLines={1} ellipsizeMode="middle">
          Account: {currentDid.did}
        </Text>
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{marginTop: 10}}
        />
      )}

      {!currentDid ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.vcText}>프로필에서 DID를 선택해주세요.</Text>
        </View>
      ) : !loading && vcList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.vcText}>보유한 티켓이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={vcList}
          // 키 추출 시에도 ticketNumber만으로는 중복될 수 있으므로 index 조합 권장
          keyExtractor={(item, index) =>
            `${item?.credentialSubject?.ticketNumber}_${index}`
          }
          renderItem={({item, index}) => (
            <VCcard
              key={index}
              vc={item}
              index={index}
              isDeleteMode={isDeleteMode}
              // 삭제 함수에 ticketNumber만 넘기면 꼬일 수 있으니 주의 (위의 handleDeleteTicket 수정함)
              onDeletePress={tNum => handleDeleteTicket(tNum)}
            />
          )}
          contentContainerStyle={styles.scrollContent}
          ListFooterComponent={
            <View style={{alignItems: 'center', marginTop: 20}}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setIsDeleteMode(!isDeleteMode)}>
                <Text style={styles.deleteButtonText}>
                  {isDeleteMode ? '완료' : '티켓 삭제하기'}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
  },
  subTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vcText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
  deleteButton: {
    backgroundColor: '#FF5C5C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default TicketScreen;
