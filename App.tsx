import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged, User } from "firebase/auth";
import Login from './app/screens/Login';
import { TabNavigation } from './components/TabNavigation';
import { FIREBASE_AUTH } from './FirebaseConfig';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <NavigationContainer>
      {user ? <TabNavigation /> : <Login />}
    </NavigationContainer>
  );
}