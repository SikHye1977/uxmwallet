import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {removeItem, setItem, getItem} from '../utils/AsyncStorage';
import {
  generateSeparateKeyPairs,
  registerDID,
  addX25519PublicKey,
} from '../utils/DIDGenerator';

// DID 데이터 타입 정의
interface DidData {
  did: string;
  edVerkey: string;
  edSecretkey: string;
  xVerkey: string;
  xSecretkey: string;
  createdAt: number; // 생성 시간 (구분을 위해)
  alias?: string; // 별칭 (선택 사항)
  isRegistered?: boolean; // ledger 등록 상태 저장
}

function ProfileScreen() {
  const [didList, setDidList] = useState<DidData[]>([]); // 전체 DID 목록
  const [selectedDid, setSelectedDid] = useState<DidData | null>(null); // 현재 선택된 DID

  // ✅ 별칭 변경을 위한 상태 추가
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [tempAlias, setTempAlias] = useState('');

  // 1. DID 생성 및 목록에 추가
  const create_did = async () => {
    try {
      const result_did = await generateSeparateKeyPairs();

      const newDidData: DidData = {
        did: result_did.did,
        edVerkey: result_did.edPublicKey,
        edSecretkey: result_did.edPrivateKey,
        xVerkey: result_did.x25519PublicKey,
        xSecretkey: result_did.x25519PrivateKey,
        createdAt: Date.now(),
        alias: `DID #${didList.length + 1}`,
        isRegistered: false,
      };

      // 기존 목록에 추가
      const updatedList = [...didList, newDidData];
      setDidList(updatedList);
      setSelectedDid(newDidData); // 방금 만든 것을 선택 상태로

      // 저장소 업데이트 (전체 리스트 저장)
      await setItem('DID_LIST', JSON.stringify(updatedList));

      Alert.alert('생성 완료', '새로운 DID가 생성되었습니다.');
    } catch (e) {
      console.error(e);
      Alert.alert('생성 실패');
    }
  };

  // 2. DID 등록 (선택된 DID를 등록)
  const register_did = async () => {
    if (!selectedDid) {
      Alert.alert('등록 실패', '선택된 DID가 없습니다.');
      return;
    }

    try {
      // 1. NYM 트랜잭션
      const registerResponse = await registerDID(
        'J4BALc9uEa8F1GCy7uka7f',
        selectedDid.did,
        selectedDid.edVerkey,
      );
      if (!registerResponse) {
        Alert.alert('등록 실패', 'DID 등록에 실패했습니다.');
        return;
      }

      console.log('✅ NYM 트랜잭션 완료. X25519 등록 시작');

      // 2. ATTRIB 트랜잭션
      const attribResponse = await addX25519PublicKey(
        selectedDid.did,
        selectedDid.did,
        selectedDid.xVerkey,
        selectedDid.edSecretkey,
      );

      if (!attribResponse) {
        Alert.alert('실패', 'X25519 키 추가 실패');
        return;
      }
      // ✅ 모든 등록 절차가 성공했다면 상태 업데이트
      const updatedList = didList.map(item =>
        item.did === selectedDid.did ? {...item, isRegistered: true} : item,
      );

      setDidList(updatedList);
      setSelectedDid({...selectedDid, isRegistered: true}); // 현재 선택된 객체도 업데이트

      // 저장소에 반영 (앱 껐다 켜도 유지되게)
      await setItem('DID_LIST', JSON.stringify(updatedList));

      Alert.alert('등록 성공', `DID(${selectedDid.alias}) 등록 완료!`);
    } catch (error) {
      console.error('등록 실패:', error);
      Alert.alert('등록 실패');
    }
  };

  // 3. 특정 DID 삭제
  const remove_did = async () => {
    if (!selectedDid) return;

    try {
      const updatedList = didList.filter(item => item.did !== selectedDid.did);
      setDidList(updatedList);
      setSelectedDid(null); // 선택 해제

      await setItem('DID_LIST', JSON.stringify(updatedList));
      Alert.alert('삭제 성공', '선택한 DID가 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  // 4. 저장된 DID 목록 불러오기
  const loadDidList = async () => {
    try {
      const storedList = await getItem('DID_LIST');
      if (storedList) {
        const parsedList: DidData[] = JSON.parse(storedList);
        setDidList(parsedList);
        // 목록이 있으면 첫 번째 것을 기본 선택
        if (parsedList.length > 0) {
          setSelectedDid(parsedList[0]);
        }
      }
    } catch (error) {
      console.error('DID 로드 실패:', error);
    }
  };

  // 5. 초기화: 기존 단일 DID 데이터가 있다면 리스트로 마이그레이션 (옵션)
  const migrateOldData = async () => {
    const oldDid = await getItem('DID');
    if (oldDid) {
      // 기존 데이터가 있다면 리스트 형식으로 변환해서 저장하고 기존 키 삭제
      const oldEdVerkey = await getItem('edVerkey');
      const oldEdSecret = await getItem('edSecretkey');
      const oldXVerkey = await getItem('xVerkey');
      const oldXSecret = await getItem('xSecretkey');

      const migratedDid: DidData = {
        did: oldDid,
        edVerkey: oldEdVerkey,
        edSecretkey: oldEdSecret,
        xVerkey: oldXVerkey,
        xSecretkey: oldXSecret,
        createdAt: Date.now(),
        alias: '기존 DID',
      };

      const newList = [migratedDid];
      await setItem('DID_LIST', JSON.stringify(newList));
      setDidList(newList);
      setSelectedDid(migratedDid);

      // 기존 키 삭제 (선택 사항)
      await removeItem('DID');
      // ... 나머지 키들도 삭제
    } else {
      loadDidList();
    }
  };

  // ✅ 6. 별칭 수정 모달 열기
  const openRenameModal = () => {
    if (!selectedDid) return;
    setTempAlias(selectedDid.alias || ''); // 현재 별칭을 입력창에 미리 채워둠
    setIsRenameModalVisible(true);
  };

  // ✅ 7. 별칭 저장 로직
  const saveAlias = async () => {
    if (!selectedDid) return;
    if (!tempAlias.trim()) {
      Alert.alert('알림', '별칭을 입력해주세요.');
      return;
    }

    try {
      // 1. 리스트에서 해당 DID를 찾아 별칭 업데이트
      const updatedList = didList.map(item =>
        item.did === selectedDid.did ? {...item, alias: tempAlias} : item,
      );

      // 2. 상태 업데이트
      setDidList(updatedList);

      // 3. 현재 선택된 DID 객체도 업데이트 (화면에 바로 반영되도록)
      setSelectedDid({...selectedDid, alias: tempAlias});

      // 4. 저장소에 반영
      await setItem('DID_LIST', JSON.stringify(updatedList));

      setIsRenameModalVisible(false); // 모달 닫기
    } catch (e) {
      console.error('별칭 수정 실패:', e);
      Alert.alert('오류', '별칭 수정 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
    // loadDidList(); // 마이그레이션 필요 없으면 이거 사용
    migrateOldData(); // 기존 데이터 살리려면 이거 사용
  }, []);

  // UI 렌더링
  const renderItem = ({item}: {item: DidData}) => (
    <TouchableOpacity
      style={[
        styles.didItem,
        selectedDid?.did === item.did && styles.selectedDidItem,
      ]}
      onPress={() => setSelectedDid(item)}>
      <Text style={styles.didAlias}>{item.alias}</Text>
      <Text style={styles.didDetailText} numberOfLines={1}>
        {item.did}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>DID Wallet</Text>

      {/* DID 목록 영역 */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
          보유 DID 목록 ({didList.length})
        </Text>
        <FlatList
          data={didList}
          renderItem={renderItem}
          keyExtractor={item => item.did}
          style={styles.flatList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>생성된 DID가 없습니다.</Text>
          }
        />
      </View>

      {/* 선택된 DID 상세 정보 */}
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <Text style={styles.sectionTitle}>선택된 DID 정보</Text>
          {/* ✅ 별칭 수정 버튼 추가 */}
          {selectedDid && (
            <TouchableOpacity onPress={openRenameModal} style={styles.editIcon}>
              <Text style={styles.editText}>✏️ 이름 변경</Text>
            </TouchableOpacity>
          )}
        </View>
        {selectedDid ? (
          <ScrollView style={styles.scrollDetail}>
            <Text style={styles.detailLabel}>Alias:</Text>
            <Text style={styles.detailValue}>{selectedDid.alias}</Text>

            <Text style={styles.detailLabel}>DID:</Text>
            <Text style={styles.detailValue}>{selectedDid.did}</Text>

            <Text style={styles.detailLabel}>Ed Verkey:</Text>
            <Text style={styles.detailValue}>{selectedDid.edVerkey}</Text>

            <Text style={styles.detailLabel}>X25519 Verkey:</Text>
            <Text style={styles.detailValue}>{selectedDid.xVerkey}</Text>
          </ScrollView>
        ) : (
          <View style={styles.emptyDetail}>
            <Text style={styles.emptyText}>목록에서 DID를 선택해주세요.</Text>
          </View>
        )}
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={create_did}>
          <Text style={styles.buttonText}>+ 새 DID 생성</Text>
        </TouchableOpacity>

        {selectedDid && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              // ✅ 등록된 상태면 스타일 변경 및 클릭 방지
              style={[
                styles.registerButton,
                selectedDid.isRegistered && styles.disabledButton,
              ]}
              onPress={register_did}
              disabled={selectedDid.isRegistered} // ✅ 등록되었으면 클릭 불가
            >
              <Text style={styles.buttonText}>
                {selectedDid.isRegistered ? '등록됨' : '등록'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={remove_did}>
              <Text style={styles.buttonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* ✅ 별칭 수정 모달 추가 */}
      <Modal
        visible={isRenameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRenameModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>별칭 변경</Text>
            <TextInput
              style={styles.input}
              value={tempAlias}
              onChangeText={setTempAlias}
              placeholder="새로운 별칭을 입력하세요"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setIsRenameModalVisible(false)}>
                <Text style={styles.modalBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveAlias}>
                <Text style={styles.modalBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20, // ❌ 기존: 사방으로 20씩 여백이 있어서 위쪽이 뜸
    paddingHorizontal: 20, // ✅ 수정: 좌우 여백은 그대로 20 유지
    paddingTop: -30, // ✅ 수정: 위쪽 여백을 0으로 설정 (필요하면 10 정도로 조절)
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 0, // ✅ 추가: 타이틀 위쪽에 최소한의 숨통(10)만 줌 (원하면 0으로)
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  // 리스트 스타일
  listContainer: {
    flex: 1,
    marginBottom: 20,
  },
  flatList: {
    flexGrow: 0,
    maxHeight: 200, // 리스트 높이 제한
  },
  didItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedDidItem: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    borderWidth: 2,
  },
  didAlias: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  didDetailText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  // 상세 정보 스타일
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  scrollDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  emptyDetail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  // 버튼 스타일
  buttonContainer: {
    gap: 10,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  editIcon: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  editText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#9ca3af', // 회색
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#9ca3af',
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
  },
  modalBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
