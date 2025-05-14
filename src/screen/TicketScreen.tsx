import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { get_VC } from '../utils/GetVC';
import { getItem, setItem, removeItem } from '../utils/AsyncStorage';
import VCcard from '../component/VCcard';

type TicketRouteParamList = {
  Ticket: {
    targetUrl?: string;
  };
};

function TicketScreen() {
  const route = useRoute<RouteProp<TicketRouteParamList, 'Ticket'>>();
  const targetUrl = route.params?.targetUrl;

  const [vcList, setVcList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  useEffect(() => {
    const fetchOrLoadVC = async () => {
      if (!targetUrl) return;

      setLoading(true);

      const result = await get_VC(targetUrl);
      console.log('🧾 VC 응답 전체:', JSON.stringify(result, null, 2));

      const ticketNumber =
        result?.vc?.credential?.credentialSubject?.reservedTicket?.ticketNumber;

      if (!ticketNumber) {
        console.warn('❗ ticketNumber 없음 (응답 구조 확인 필요)');
        setLoading(false);
        return;
      }

      const storageKey = `vc:${ticketNumber}`;
      const stored = await getItem(storageKey);

      let newVC = null;
      if (stored) {
        newVC = JSON.parse(stored);
      } else {
        newVC = result.vc;
        await setItem(storageKey, JSON.stringify(newVC));
      }

      const alreadyExists = vcList.some(
        (vc) =>
          vc?.credential?.credentialSubject?.reservedTicket?.ticketNumber ===
          ticketNumber
      );

      if (!alreadyExists) {
        setVcList((prevList) => [...prevList, newVC]);
      }

      setLoading(false);
    };

    fetchOrLoadVC();
  }, [targetUrl]);

  const handleDeleteTicket = async (ticketNumber: string) => {
    const storageKey = `vc:${ticketNumber}`;
    await removeItem(storageKey);
    setVcList((prevList) =>
      prevList.filter(
        (vc) =>
          vc?.credential?.credentialSubject?.reservedTicket?.ticketNumber !==
          ticketNumber
      )
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
          {vcList.map((vc, index) => (
            <VCcard
              key={index}
              vc={vc}
              index={index}
              isDeleteMode={isDeleteMode}
              onDeletePress={handleDeleteTicket}
            />
          ))}

          {vcList.length > 0 && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setIsDeleteMode(!isDeleteMode)}
            >
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  vcText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  deleteButton: {
    backgroundColor: '#FF5C5C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 30,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default TicketScreen;
