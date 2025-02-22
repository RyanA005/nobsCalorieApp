import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Switch, StyleSheet, Modal, Button, ScrollView, TouchableOpacity } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppTheme, updateApp, getCurrentScheme } from '../../hooks/colorScheme';

export default function Settings({ navigation }) {
  const colors = useAppTheme();
  const [userEmail, setUserEmail] = useState('');
  const [isEnabled, setIsEnabled] = useState(getCurrentScheme() === 'dark');
  const [isPolicyVisible, setIsPolicyVisible] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('21:00');

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
  const hangleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              //await FIREBASE_AUTH.currentUser.delete();
              await AsyncStorage.setItem('email', '');
              await AsyncStorage.setItem('isLoggedOut', 'true');
              await signOut(FIREBASE_AUTH);
              // The auth state change will automatically trigger navigation
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  }
  const privacyPolicyModal = () => {
    setIsPolicyVisible(true);
  };

  const closePrivacyPolicy = () => {
    setIsPolicyVisible(false);
  };

  const doTest = async () => {
    console.log('test! ');
  };

  const flipColorScheme = () => {
    const newScheme = !isEnabled ? 'dark' : 'light';
    setIsEnabled(!isEnabled);
    updateApp(newScheme);
  };

  const gotToPayments = () => {
    console.log('go to payments');
    navigation.navigate('Payments')
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.banner, {backgroundColor: colors.boxes}]}>
        <Text style={[styles.headerText, {color: colors.text}]}>Settings</Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, {color: colors.text}]}>Account</Text>
        <View style={[styles.card, {backgroundColor: colors.boxes}]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="person-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, {color: colors.text}]}>{userEmail}</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={handleLogout} style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="logout" size={24} color={colors.accent} />
              <Text style={[styles.settingText, {color: colors.accent}]}>Logout</Text>
            </View>
            <AntDesign name="right" size={20} color={colors.accent} />
          </TouchableOpacity>

          <TouchableOpacity onPress={hangleDeleteAccount} style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="delete-outline" size={24} color={colors.accent} />
              <Text style={[styles.settingText, {color: colors.accent}]}>Delete Account</Text>
            </View>
            <AntDesign name="right" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, {color: colors.text}]}>Preferences</Text>
        <View style={[styles.card, {backgroundColor: colors.boxes}]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, {color: colors.text}]}>Dark Mode</Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={flipColorScheme}
              trackColor={{ false: colors.text, true: colors.accent }}
              thumbColor={colors.boxes}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, {color: colors.text}]}>Notifications</Text>
            </View>
            <Switch
              disabled={true}
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.text, true: colors.accent }}
              thumbColor={colors.boxes}            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <AntDesign name="shake" size={24} color={colors.text} />
              <Text style={[styles.settingText, {color: colors.text}]}>Haptic Feedback</Text>
            </View>
            <Switch
              disabled={true}
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: colors.text, true: colors.accent }}
              thumbColor={colors.boxes}            />
          </View>
        </View>
      </View>

      {/* Help & Legal Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, {color: colors.text}]}>Help & Legal</Text>
        <View style={[styles.card, {backgroundColor: colors.boxes}]}>
          <TouchableOpacity onPress={privacyPolicyModal} style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="privacy-tip" size={24} color={colors.text} />
              <Text style={[styles.settingText, {color: colors.text}]}>Privacy Policy</Text>
            </View>
            <AntDesign name="right" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="help-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, {color: colors.text}]}>Help Center</Text>
            </View>
            <AntDesign name="right" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="feedback" size={24} color={colors.text} />
              <Text style={[styles.settingText, {color: colors.text}]}>Send Feedback</Text>
            </View>
            <AntDesign name="right" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isPolicyVisible}
        onRequestClose={closePrivacyPolicy}
      >
        <View style={[styles.modalView, { backgroundColor: colors.background }]}>
          <ScrollView style={styles.scrollView}>
            <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Data Collection</Text>
            <Text style={[styles.content, { color: colors.text }]}>We collect the following data:
              {'\n'}- Email address for authentication purposes
              {'\n'}- Food tracking data that you input into the app
              {'\n'}- Basic analytics data through Firebase Analytics
            </Text>
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Data Usage</Text>
            <Text style={[styles.content, { color: colors.text }]}>Your data is used for the following purposes:
              {'\n'}- Email: Used solely for account authentication via Firebase
              {'\n'}- Food tracking data: Used to display your personal metrics and progress
              {'\n'}- Analytics: Used to improve app performance and user experience
            </Text>
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Data Sharing</Text>
            <Text style={[styles.content, { color: colors.text }]}>We use the following third-party services:
              {'\n'}- Firebase Authentication: For secure user authentication
              {'\n'}- Firebase Analytics: For app performance monitoring
              {'\n\n'}These services are provided by Google and are subject to their respective privacy policies. We do not share your personal data with any other third parties.
            </Text>
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Data Retention</Text>
            <Text style={[styles.content, { color: colors.text }]}>- Your food tracking data is stored indefinitely to maintain your historical records
              {'\n'}- You can delete your account and all associated data at any time through the settings menu
              {'\n'}- Authentication data is stored securely by Firebase
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Your Rights</Text>
            <Text style={[styles.content, { color: colors.text }]}>You have the right to:
              {'\n'}- Access your personal data
              {'\n'}- Delete your account and associated data
              {'\n'}- Withdraw consent at any time
              {'\n\n'}To exercise these rights, use the available options in the Settings menu or contact us.
            </Text>
          </ScrollView>
          
          <Button
            title="Close"
            onPress={closePrivacyPolicy}
          />
        </View>
      </Modal>
      
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, {color: colors.text}]}>Payment</Text>
        <View style={[styles.card, {backgroundColor: colors.boxes}]}>
          
          <TouchableOpacity onPress={gotToPayments} style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="close" size={24} color={colors.text} />
              <Text style={[styles.settingText, {color: colors.text}]}>Update or Cancel</Text>
            </View>
            <AntDesign name="right" size={20} color={colors.text} />
          </TouchableOpacity>
          </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  banner: {
    height: 120,
    marginTop: -10,
    width: '120%',
    marginHorizontal: '-10%',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 70,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 5,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  card: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  settingText: {
    fontSize: 16,
  },
  modalView: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    padding: 35,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  scrollView: {
    flex: 1,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  content: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
  },
});
