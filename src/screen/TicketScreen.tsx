import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { get_VC } from '../utils/GetVC';

type TicketRouteParamList = {
  Ticket: {
    targetUrl?: string;
  };
};

function TicketScreen() {
  const route = useRoute<RouteProp<TicketRouteParamList, 'Ticket'>>();
  const targetUrl = route.params?.targetUrl;

  const [vcData, setVcData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVC = async () => {
      if (targetUrl) {
        setLoading(true);
        const result = await get_VC(targetUrl);
        if (result) {
          setVcData(result.vc);
        }
        setLoading(false);
      }
    };

    fetchVC();
  }, [targetUrl]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ticket Screen</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          {vcData && (
            <View style={styles.vcContainer}>
              <Text style={styles.vcText}>발급 받은 티켓 VC:</Text>
              <Text style={styles.vcText}>{JSON.stringify(vcData, null, 2)}</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  url: {
    marginTop: 20,
    fontSize: 14,
    color: 'blue',
  },
  vcContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  vcText: {
    fontSize: 14,
    textAlign: 'left',
  },
  scrollContent: {
    paddingBottom: 40,
  },  
});

export default TicketScreen;
