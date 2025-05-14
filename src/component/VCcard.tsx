import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  TicketDetail: { vc: any };
};

interface VCProps {
  vc: any;
  index?: number;
  isDeleteMode?: boolean;
  onDeletePress?: (ticketNumber: string) => void;
}

const VCcard = ({ vc, index, isDeleteMode = false, onDeletePress }: VCProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const ticket = vc?.credential?.credentialSubject?.reservedTicket ?? {};
  const event = vc?.credential?.credentialSubject?.reservationFor ?? {};
  const ticketNumber = ticket.ticketNumber;

  const handlePress = () => {
    if (isDeleteMode && onDeletePress) {
      // 삭제 모드: 삭제 콜백 호출
      onDeletePress(ticketNumber);
    } else {
      // 일반 모드: 상세 페이지 이동
      navigation.navigate('TicketDetail', { vc });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.container}>
        {index !== undefined && (
          <Text style={styles.index}>Ticket #{index + 1}</Text>
        )}
        <Text style={styles.text}>
          ▸ 이벤트: {event.name} @ {event.location?.name}
        </Text>
        <Text style={styles.text}>
          ▸ 좌석: {ticket.ticketedSeat?.seatSection}-
          {ticket.ticketedSeat?.seatRow}
          {ticket.ticketedSeat?.seatNumber} ({ticket.ticketedSeat?.seatingType})
        </Text>
        <Text style={styles.text}>▸ 티켓 번호: {ticket.ticketNumber}</Text>
        <Text style={styles.tapHint}>
          {isDeleteMode ? '🗑️ 탭하여 삭제하기' : '탭하여 상세보기'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4D8AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
  },
  index: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
    color: '#fff',
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: '#fff',
  },
  tapHint: {
    marginTop: 8,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#e0e0e0',
  },
});

export default VCcard;
