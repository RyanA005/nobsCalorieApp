import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from 'expo-sqlite';

import PercentCompletionGraph from "../../components/PercentCompletionGraph";
import HorizontalBarChart from "../../components/HorizontalBarChart";
import DetailsModal from "../DetailsModal";
import LoggedFoodItem from '@/components/LoggedFoodItem';

import { useAppTheme } from '../../hooks/colorScheme';

import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { checkDayAndUpdate } from '../../functions/firebaseDB';

export default function Home({ navigation }) {  // Add navigation prop

  const colors = useAppTheme();
  
  const [foodData, setFoodData] = useState([]);  
  const [goals, setGoals] = useState({
    protein: '150',
    carbs: '150',
    fats: '100',
    dailyCalories: '2100'
  });
  const [totals, setTotals] = useState({
    totalCal: 0,
    totalProtein: 0,
    totalCarb: 0,
    totalFat: 0
  });
  const database = useSQLiteContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [day, setDay] = useState(today);

  const loadFoodData = async () => {
    try {
      const results = await database.getAllAsync(
        "SELECT id, name, qty, baseQty, cal, protein, carb, fat, iscustom, day FROM foodhistory"
      );
      //console.log('Loaded food data:', results);
      setFoodData(results || []);
    } catch (error) {
      console.error('Error loading food data:', error);
    }
  };

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const savedGoals = await AsyncStorage.getItem('userGoals');
        if (savedGoals) {
          setGoals(JSON.parse(savedGoals));
        }
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    };

    // Load goals initially
    loadGoals();

    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadGoals();
    });

    // Cleanup listener on component unmount
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadFoodData(); // Initial load
    const unsubscribe = navigation.addListener('focus', loadFoodData);
    return unsubscribe;
  }, [database, navigation]);


  // Update totals whenever foodData or day changes
  useEffect(() => {
    const newTotals = {
      totalCal: 0,
      totalProtein: 0,
      totalCarb: 0,
      totalFat: 0
    };
    
    if (Array.isArray(foodData) && foodData.length > 0) {
      // Filter foodData for the current day before calculating totals
      foodData
        .filter(item => item.day === day)
        .forEach(item => {
          const multiplier = item.qty / (item.baseQty || 100);
          newTotals.totalCal += Number(item.cal) * multiplier || 0;
          newTotals.totalProtein += Number(item.protein) * multiplier || 0;
          newTotals.totalCarb += Number(item.carb) * multiplier || 0;
          newTotals.totalFat += Number(item.fat) * multiplier || 0;
        });
        //console.log('New totals:', newTotals);
    }

    setTotals(newTotals);
  }, [foodData, day]); // Added day to dependencies

  const values = {
    calories: { name: "Calories", current: totals.totalCal, total: parseInt(goals.dailyCalories), color: colors.accent },
    protein: { name: "Protein", current: totals.totalProtein, total: parseInt(goals.protein), color: colors.greenColor },
    carbs: { name: "Carbs", current: totals.totalCarb, total: parseInt(goals.carbs), color: colors.blueColor },
    fats: { name: "Fats", current: totals.totalFat, total: parseInt(goals.fats), color: colors.yellowColor }
  };

  const goNextDay = () => {
    if (day === today) {
      setDay(tomorrow.toDateString());
    } else if (day === yesterday.toDateString()) {
      setDay(today);
    }
  };

  const goPrevDay = () => {
    if (day === today) {
      setDay(yesterday.toDateString());
    } else if (day === tomorrow.toDateString()) {
      setDay(today);
    }
  };

  useEffect(() => { 
    checkDayAndUpdate(FIREBASE_AUTH.currentUser, database, new Date());
   }, []);
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.banner, {backgroundColor: colors.boxes}]}>
        <TouchableOpacity 
          activeOpacity={day === yesterday.toDateString() ? 1 : 0.2}
          style={{padding: 10, marginTop: 45}}
          onPress={day === yesterday.toDateString() ? null : goPrevDay}>
          <AntDesign 
            name="left" 
            size={24}
            color={day === yesterday.toDateString() ? colors.text : colors.accent} 
          />
        </TouchableOpacity>

        {day === today && <Text style={{color: colors.text, fontSize: 18, marginTop: 45}}>Today</Text>}
        {day === tomorrow.toDateString() && <Text style={{color: colors.text, fontSize: 18, marginTop: 45}}>Tomorrow</Text>}
        {day === yesterday.toDateString() && <Text style={{color: colors.text, fontSize: 18, marginTop: 45}}>Yesterday</Text>}

        <TouchableOpacity
          activeOpacity={day === tomorrow.toDateString() ? 1 : 0.2}
          style={{padding: 10, marginTop: 45}}
          onPress={day === tomorrow.toDateString() ? null : goNextDay}>
          <AntDesign 
            name="right"
            size={24}
            color={day === tomorrow.toDateString() ? colors.text : colors.accent}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.macrosGraphic, {backgroundColor: colors.boxes}]}>
        <View style={[styles.graphics, {}]}>
          <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}> 
            <PercentCompletionGraph values={values.calories} />
            <TouchableOpacity onPress={() => navigation.navigate('Goals')} style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <AntDesign name="setting" size={14} color={colors.accent} />
              <Text style={{color: colors.accent}}> Goals</Text>
            </TouchableOpacity>
          </View>
          <View style={{gap: 10, justifyContent: 'center', alignItems: 'center'}}>
            <HorizontalBarChart values={values.protein} />
            <HorizontalBarChart values={values.carbs} />
            <HorizontalBarChart values={values.fats} />
          </View>
        </View>
      </View>
      
      <View style={[styles.card, {backgroundColor: colors.boxes}]}>
      <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => setIsDetailsModalVisible(true)}
          >
        <View style={styles.buttonContainer}>
          
            <AntDesign 
              name="infocirlceo" 
              size={24}
              color={colors.accent}
            />
            <Text style={{color: colors.accent, fontSize: 16}}>See Details</Text>
        </View>
        </TouchableOpacity>
      </View>

      <DetailsModal 
        isVisible={isDetailsModalVisible}
        currentValues={totals}
        multiplier={1}
        color={colors.text}
        onClose={() => setIsDetailsModalVisible(false)}
        day={day}  // Add this line
      />

      <View style={[styles.todaysFood]}>
        <FlatList
          ListEmptyComponent={() => (
            day === today ? (
              <Text style={{color: colors.text, textAlign: 'center'}}>Visit Track to Add Foods</Text>
            ) : null
          )}
          data={foodData.filter(item => item.day === day)}
          renderItem={({ item }) => (
            <LoggedFoodItem 
              item={item}
              iscustom={item.iscustom} 
            />
          )}
          keyExtractor={item => item.id?.toString()}
          contentContainerStyle={{gap: 5, flexGrow: 1}}
        />
      </View>

    </View>
    );
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
  },
  banner: {
    height: 110,
    marginTop: -10,
    width: '120%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: '-10%',
    alignItems: 'center', 
    marginBottom: 5,
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
  macrosGraphic: {
    justifyContent: 'center',
    width: '100%',
    margin: 5,
    borderRadius: 20,
    marginHorizontal: 'auto',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  graphics: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginHorizontal: 'auto',
    padding: 5,
    gap: 5,
  },
  card: {
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  todaysFood: {
    width: '100%',
    marginHorizontal: 'auto',
    marginTop: 5,
    flex: 1,
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
});