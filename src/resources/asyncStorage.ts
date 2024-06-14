import AsyncStorage from '@react-native-async-storage/async-storage';

export const setKeyInAsyncStorage = async (key: string, data: any) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

export const getKeyFromAsyncStorage = async (key: string) => {
  return await AsyncStorage.getItem(key);
};

export const removeKeyFromAsyncStorage = async (key: string) => {
  return await AsyncStorage.removeItem(key);
};
