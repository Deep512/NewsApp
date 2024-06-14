// src/screens/SplashScreen.tsx
import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Entypo';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('Home');
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Icon name="news" size={50} />
      <Text style={styles.text}>NewsApp</Text>
    </View>
  );
};
export default SplashScreen;
