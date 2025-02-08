import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from "firebase/auth";
import { SQLiteProvider, SQLiteDatabase } from 'expo-sqlite';

import Login from './app/Login';
import { TabNavigation } from './app/(tabs)/TabNavigation';
import { FIREBASE_AUTH } from './FirebaseConfig';

const Stack = createNativeStackNavigator();

export default function App() {
  const createDB = async (db:SQLiteDatabase) => {
    // DROP TABLE IF EXISTS foodhistory;
    // DROP TABLE IF EXISTS customfoods;
    // DROP TABLE IF EXISTS metrics;
      try {
          await db.execAsync(`      
            CREATE TABLE IF NOT EXISTS 
              foodhistory(
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  qty INTEGER,
                  baseQty INTEGER,
                  cal INTEGER,
                  protein INTEGER,
                  carb INTEGER,
                  fat INTEGER,
                  iscustom INTEGER DEFAULT 0,
                  day TEXT
              );

              CREATE TABLE IF NOT EXISTS 
              customfoods(
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT UNIQUE,
                  qty INTEGER,
                  cal INTEGER,
                  protein INTEGER,
                  carb INTEGER,
                  fat INTEGER
              );

              CREATE TABLE IF NOT EXISTS 
              metrics(
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  date TEXT UNIQUE,
                  calories INTEGER,
                  protein INTEGER,
                  caloriesgoal INTEGER,
                  proteingoal INTEGER
              );
          `);
      } catch (error) {
          console.error("Error creating database: ", error);
      }
  }
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <SQLiteProvider databaseName="foodhistory.db" onInit={createDB}>
    <NavigationContainer>
      <TabNavigation />
    </NavigationContainer>
    </SQLiteProvider>
  );
}