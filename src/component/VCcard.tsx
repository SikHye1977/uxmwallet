// import React from 'react';
// import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

// type RootStackParamList = {
//   TicketDetail: {vc: any};
// };

// interface VCProps {
//   vc: any;
//   index?: number;
//   isDeleteMode?: boolean;
//   onDeletePress?: (ticketNumber: string) => void;
// }

// const VCcard = ({vc, index, isDeleteMode = false, onDeletePress}: VCProps) => {
//   const navigation =
//     useNavigation<NativeStackNavigationProp<RootStackParamList>>();

//   const subject = vc?.credential?.credentialSubject;
//   const ticketNumber = subject?.ticketNumber;

//   const handlePress = () => {
//     if (isDeleteMode && onDeletePress) {
//       onDeletePress(ticketNumber);
//     } else {
//       navigation.navigate('TicketDetail', {vc});
//     }
//   };

//   return (
//     <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
//       <View style={styles.container}>
//         {index !== undefined && (
//           <Text style={styles.index}>Ticket #{index + 1}</Text>
//         )}
//         <Text style={styles.text}>▸ 이벤트: {subject?.issuedBy?.name}</Text>
//         <Text style={styles.text}>▸ 소유자: {subject?.underName?.name}</Text>
//         <Text style={styles.text}>▸ 티켓 번호: {ticketNumber}</Text>
//         <Text style={styles.tapHint}>
//           {isDeleteMode ? '🗑️ 탭하여 삭제하기' : '탭하여 상세보기'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#4D8AFF',
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 10,
//     width: '100%',
//   },
//   index: {
//     fontWeight: 'bold',
//     marginBottom: 5,
//     fontSize: 16,
//     color: '#fff',
//   },
//   text: {
//     fontSize: 14,
//     marginBottom: 4,
//     color: '#fff',
//   },
//   tapHint: {
//     marginTop: 8,
//     fontSize: 12,
//     fontStyle: 'italic',
//     color: '#e0e0e0',
//   },
// });

// export default VCcard;
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {TicketDetail: {vc: any}};

interface VCProps {
  vc: any;
  index?: number;
  isDeleteMode?: boolean;
  onDeletePress?: (ticketNumber: string) => void;
}

const VCcard = ({vc, index, isDeleteMode = false, onDeletePress}: VCProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const subject = vc?.credentialSubject;
  const ticketNumber = subject?.ticketNumber;

  const ownerIds = Array.isArray(subject?.underName)
    ? subject.underName.map((u: any) => u?.name ?? u?.id).filter(Boolean)
    : subject?.underName?.name ?? subject?.underName?.id
    ? [subject?.underName?.name ?? subject?.underName?.id]
    : [];

  const ownerLabel =
    ownerIds.length === 0
      ? ''
      : ownerIds.length === 1
      ? ownerIds[0]
      : `${ownerIds[0]} 외 ${ownerIds.length - 1}명`;

  const handlePress = () => {
    if (isDeleteMode && onDeletePress && ticketNumber) {
      onDeletePress(ticketNumber);
    } else {
      navigation.navigate('TicketDetail', {vc});
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.container}>
        {index !== undefined && (
          <Text style={styles.index}>Ticket #{index + 1}</Text>
        )}
        <Text style={styles.text}>
          ▸ 이벤트: {subject?.issuedBy?.name ?? '-'}
        </Text>
        <Text style={styles.text}>▸ 소유자: {ownerLabel || '-'}</Text>
        <Text style={styles.text}>▸ 티켓 번호: {ticketNumber || '-'}</Text>
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
  index: {fontWeight: 'bold', marginBottom: 5, fontSize: 16, color: '#fff'},
  text: {fontSize: 14, marginBottom: 4, color: '#fff'},
  tapHint: {marginTop: 8, fontSize: 12, fontStyle: 'italic', color: '#e0e0e0'},
});

export default VCcard;
