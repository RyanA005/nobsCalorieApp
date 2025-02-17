import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, Switch, StyleSheet, Appearance } from 'react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppTheme, updateApp, getCurrentScheme } from '../../hooks/colorScheme';

export default function Settings() {
  const colors = useAppTheme();
  const [userEmail, setUserEmail] = useState('');
  const [isEnabled, setIsEnabled] = useState(getCurrentScheme() === 'dark');

  useEffect(() => {
    // Load user email
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      setUserEmail(user.email);
    }

    // Initialize switch state from stored theme
    AsyncStorage.getItem('@app_theme')
      .then(savedTheme => {
        if (savedTheme) {
          setIsEnabled(savedTheme === 'dark');
        }
      })
      .catch(error => console.error('Error loading theme state:', error));
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

  const doTest = async () => {
    console.log('test! ');
  };

  const flipColorScheme = () => {
    const newScheme = !isEnabled ? 'dark' : 'light';
    setIsEnabled(!isEnabled);
    updateApp(newScheme);
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
      <Switch
        value={isEnabled}
        onValueChange={flipColorScheme}
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
