import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StackParamList } from '../navigation/StackNavigator';

function HomeScreen() {
  const navigation = useNavigation<NavigationProp<StackParamList>>();
  
  return (
    <View style={styles.container}>
      <Text>HomeScreen</Text>
      <Button title="Go to DID Profile Screen" onPress={() => navigation.navigate('Profile')} />
      <Button title="Go to Ticket Screen" onPress={() => navigation.navigate('Ticket')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
});

export default HomeScreen;