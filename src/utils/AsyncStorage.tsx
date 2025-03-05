import AsyncStorage from '@react-native-async-storage/async-storage';

// 25.01.22
// 디바이스 저장소를 이용하기 위한 함수

export const setItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
    
    // 저장값 확인을 위한 console.log
    console.log(`setItem... ${key} : ${value}`);
  } catch (e) {
    throw e;
  }
};

export const getItem = async (key: string) => {
  try {
    const res = await AsyncStorage.getItem(key);
    return res || '';
  } catch (e) {
    throw e;
  }
};

export const removeItem = async (key: string) => {
  try{
    await AsyncStorage.removeItem(key);
    console.log(`${key} 삭제 완료`);
  } catch (error) {
    console.error(`${key} 삭제 실패`, error);
  }
};