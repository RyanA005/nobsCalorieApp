import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {  // removed navigation prop as we won't need it
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

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings Screen</Text>
      <Button
        title="Logout"
        onPress={handleLogout}
      />
    </View>
  );
}
