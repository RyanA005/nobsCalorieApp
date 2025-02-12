import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, Switch, StyleSheet } from 'react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkDayAndUpdate } from '../../functions/firebaseDB';

import { useAppTheme } from '../../hooks/colorScheme';
import { storeMetrics } from '../../functions/firebaseDB';
import { useSQLiteContext } from 'expo-sqlite';

export default function Settings() {
  const colors = useAppTheme();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              await AsyncStorage.setItem('isLoggedOut', 'true');
              await signOut(FIREBASE_AUTH);
              // The auth state change will automatically trigger navigation
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const db = useSQLiteContext();
  const date = new Date();
  date.setDate(date.getDate() + 5);

  const doTest = async () => {
    console.log('test! ');
    await checkDayAndUpdate(FIREBASE_AUTH.currentUser, db, date);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, {color: colors.text}]}>Settings Screen</Text>
      <Text style={[styles.text, {color: colors.text}]}>Email: {userEmail}</Text>
      <Button
        style={styles.button}
        title="Logout"
        onPress={handleLogout}
      />
      <Button
        style={styles.button}
        title="test"
        onPress={doTest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'lightblue',
    padding: 20,
  },
  text: {
    fontSize: 20,
    margin: 10,
  },
});
