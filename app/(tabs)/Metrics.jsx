import { View, Text, StyleSheet, ScrollView, DeviceEventEmitter, Modal, Button } from 'react-native'
import React, { useEffect, useMemo, useCallback } from 'react'
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { getAuth } from 'firebase/auth';
import { FIREBASE_APP } from '../../FirebaseConfig';

import MetricsGraphElement from '../../components/MetricsGraphElement';
import { calculateAwards } from '../../functions/awardCalculations';
import { useAppTheme, subscribeToTheme } from '../../hooks/colorScheme';
import { assembleMetricsHistory } from '../../functions/assembleMetricsHistory';

export default function Metrics() {
  const [colors, setColors] = useState(useAppTheme());

  const smartTruncate = (text, limit) => {
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  };

  const [metrics, setMetrics] = useState([]);
  const [awards, setAwards] = useState({
    streak: 0,
    totalDays: 0,
    averageAccuracy: 0,
    perfectDays: 0
  });
  const [displayConfig, setDisplayConfig] = useState({
    maxValues: {
      protein: 200,
      calories: 2100,
      fats: 70,
      carbs: 250
    },
    maxItems: 7,
    barWidth: 30,
    tracking: "calories",
    spacing: 10
  });
  
  const [stat, setStat] = useState('calories');
  const [time, setTime] = useState(1);

  const auth = getAuth(FIREBASE_APP);

  // Memoize static data
  const statSelectorData = useMemo(() => ([
    { value: 'calories', label: 'Calories' }, // Calories first
    { value: 'protein', label: 'Protein' },
    { value: 'fat', label: 'Fat' },
    { value: 'carbs', label: 'Carbs' }
  ]), []);

  const timeSelectorData = useMemo(() => [
    {value: 1, label: 'Week'},
    ...(metrics.length >= 12 ? [{value: 2, label: 'Month'}] : []),
    ...(metrics.length >= 40 ? [{value: 3, label: 'Year'}] : []),
    ...(metrics.length >= 365 ? [{value: 4, label: 'All Time'}] : [])
  ], [metrics.length]);

  const getUnitForNutrient = useCallback((nutrient) => {
    const units = {
      protein: 'g',
      fats: 'g',
      carbs: 'g',
      calories: ''
    };
    return units[nutrient] || '';
  }, []);

  const findMax = useCallback((array) => {
    return Math.max(
      ...array.map(element => Math.max(
        element.actual[displayConfig.tracking], 
        element.goals[displayConfig.tracking]
      ))
    );
  }, [displayConfig.tracking]);

  const getData = useCallback(async () => {
    try {
      if (!auth.currentUser) {
        console.warn('No user logged in');
        return;
      }

      const metricsData = await assembleMetricsHistory(auth.currentUser.uid);
      if (!Array.isArray(metricsData) || metricsData.length === 0) {
        console.warn('No metrics data returned');
        setMetrics([]);
        return;
      }

      setMetrics(metricsData);
      
      const reversedData = [...metricsData].reverse();
      const currentMaxItems = Math.min(displayConfig.maxItems, metricsData.length);
      const relevantData = reversedData.slice(0, currentMaxItems);
      
      if (relevantData.length > 0) {
        const maxValues = {};
        Object.keys(relevantData[0].actual).forEach(nutrient => {
          maxValues[nutrient] = findMax(relevantData);
        });

        setDisplayConfig(prev => ({
          ...prev,
          maxValues
        }));
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setMetrics([]);
    }
  }, [displayConfig.maxItems, findMax, auth.currentUser]);
  const getDisplayData = useMemo(() => {
    const maxForDisplay = 120;
    if (!metrics.length) return [];
    const allData = [...metrics].reverse();
    if(displayConfig.maxItems > maxForDisplay) {
      const divisor = Math.ceil(displayConfig.maxItems / maxForDisplay);
      const temp = [];
      allData.slice(0, displayConfig.maxItems).reverse().forEach((item, index) => {
        if(index % divisor === 0) {
          temp.push(item);
        }
      });
      return temp;
    }
    return allData.slice(0, displayConfig.maxItems).reverse();
  }, [metrics, displayConfig.maxItems]);

  const handleStatChange = useCallback((item) => {
    setStat(item.value);
    setDisplayConfig(prev => ({
      ...prev,
      tracking: item.value
    }));
  }, []);

  const handleTimeChange = useCallback((item) => {
    let newBarWidth;
    let newMaxItems;
    
    switch(item.value) {
      case 1: // Week
        newMaxItems = 7;
        newBarWidth = 30;
        break;
      case 2: // Month
        newMaxItems = 30;
        newBarWidth = 8;
        break;
      case 3: // Year
        newMaxItems = 365;
        newBarWidth = 2.5;
        break;
      case 4: // All Time
        newMaxItems = metrics.length;
        newBarWidth = 2;
        break;
      default:
        newMaxItems = 7;
        newBarWidth = 30;
    }
    
    setTime(item.value);
    setDisplayConfig(prev => ({
      ...prev,
      maxItems: newMaxItems,
      barWidth: newBarWidth,
      spacing: item.value === 4 ? 2 : 10
    }));
  }, [metrics.length]);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      await getData();
    };

    const subscription = DeviceEventEmitter.addListener('foodHistoryChanged', loadData);

    loadData();

    return () => {
      mounted = false;
      subscription.remove();
      setMetrics([]);
      setAwards({
        streak: 0,
        totalDays: 0,
        averageAccuracy: 0,
        perfectDays: 0
      });
    };
  }, [getData]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        setMetrics([]);
        setAwards({
          streak: 0,
          totalDays: 0,
          averageAccuracy: 0,
          perfectDays: 0
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const calculatedAwards = calculateAwards(metrics);
    setAwards(calculatedAwards);
  }, [metrics]);

  useEffect(() => {
    const unsubscribe = subscribeToTheme(newColors => {
      setColors(newColors);
    });
    return () => unsubscribe();
  }, []);

  const [streakDetailsVisible, setStreakDetailsVisible] = useState(false);
  const toggleStreakDetails = () => setStreakDetailsVisible(!streakDetailsVisible);

  const [perfectDetailsVisible, setPerfectDetailsVisible] = useState(false);
  const togglePerfectDetails = () => setPerfectDetailsVisible(!perfectDetailsVisible);

  const [totalDetailsVisible, setTotalDetailsVisible] = useState(false);
  const toggleTotalDetails = () => setTotalDetailsVisible(!totalDetailsVisible);

  const [accuracyDetailsVisible, setAccuracyDetailsVisible] = useState(false);
  const toggleAccuracyDetails = () => setAccuracyDetailsVisible(!accuracyDetailsVisible);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentWrapper}>
        <View style={[styles.card, styles.graphCard, { backgroundColor: colors.boxes }]}>
          <View style={styles.graphTitleContainer}>
            <View style={[styles.dropdownWrapper, styles.statWrapper]}>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.dropdownButton, { backgroundColor: colors.boxes }]}
              >
                <Dropdown
                  containerStyle={[styles.dropdownContainer, {backgroundColor: colors.boxes}]}
                  style={styles.titleDropdown}
                  selectedTextStyle={[styles.titleDropdownText, {color: colors.text}]}
                  placeholderStyle={[styles.titleDropdownText, {color: colors.text}]}
                  itemTextStyle={[styles.dropdownText, {color: colors.text}]}
                  activeColor={colors.innerBoxes}
                  iconColor={colors.accent}
                  iconStyle={styles.dropdownIcon}
                  valueField="value"
                  labelField="label"
                  data={statSelectorData}
                  value={stat}
                  onChange={handleStatChange}
                  showsVerticalScrollIndicator={false}
                  renderLeftIcon={() => (
                    <AntDesign name="barschart" size={20} color={colors.accent} style={{marginRight: 8}} />
                  )}
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.dropdownWrapper, styles.timeWrapper]}>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.dropdownButton, { backgroundColor: colors.boxes }]}
              >
                <Dropdown
                  containerStyle={[styles.dropdownContainer, {backgroundColor: colors.boxes}]}
                  style={styles.timeDropdown}
                  selectedTextStyle={[styles.titleDropdownText, {color: colors.text}]}
                  placeholderStyle={[styles.titleDropdownText, {color: colors.text}]}
                  itemTextStyle={[styles.dropdownText, {color: colors.text}]}
                  activeColor={colors.innerBoxes}
                  iconColor={colors.accent}
                  iconStyle={styles.dropdownIcon}
                  valueField="value"
                  labelField="label"
                  data={timeSelectorData}
                  value={time}
                  onChange={handleTimeChange}
                  showsVerticalScrollIndicator={false}
                  renderLeftIcon={() => (
                    <AntDesign name="calendar" size={20} color={colors.accent} style={{marginRight: 8}} />
                  )}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[{flexDirection: "row", marginTop: 10, width: '100%'}]}>
          <View style={[{backgroundColor: colors.text, width: 2, height: 190, marginRight: 5}]}>
            <Text 
              numberOfLines={1} 
              style={[{
                fontSize: 8, 
                backgroundColor: colors.boxes, 
                color: colors.text, 
                alignSelf: 'center',
                width: 30,
                height: 12,
                zIndex: 10,
                textAlign: 'center'
              }]}
            >
              {smartTruncate(
                Math.round(displayConfig.maxValues[displayConfig.tracking]) + 
                getUnitForNutrient(displayConfig.tracking),
                5
              )}
            </Text>
            <View style={[{backgroundColor: colors.text, width: 10, height: 2, alignSelf: 'center'}]}></View>
          </View>

            <View style={styles.graphWrapper}>
              <ScrollView
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {getDisplayData.map((item) => (
                  <MetricsGraphElement 
                    key={item.date}
                    values={[
                      item.actual[displayConfig.tracking],
                      item.goals[displayConfig.tracking],
                      colors.greenColor,
                      displayConfig.barWidth,
                      displayConfig.maxValues[displayConfig.tracking],
                    ]}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={[{backgroundColor: colors.text, width: '100%', height: 2, justifyContent: 'center'}]}>
          <View style={[{backgroundColor: colors.text, width: 2, height: 10, alignSelf: 'flex-end'}]}></View>

          </View>
          <View style={[{width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 5}]}>
            <Text style={{color: colors.text}}>
              {getDisplayData.length > 0 
                ? `${new Date(getDisplayData[0].date).toDateString().split(' ')[1]} ${new Date(getDisplayData[0].date).toDateString().split(' ')[2]}${time >= 3 ? ' ' + new Date(getDisplayData[0].date).toDateString().split(' ')[3] : ''}`
                : ''
              }
            </Text>
            <Text style={{color: colors.text}}>
              {getDisplayData.length > 0
                ? `${new Date().toDateString().split(' ')[1]} ${new Date().toDateString().split(' ')[2]}${time >= 3 ? ' ' + new Date(getDisplayData[getDisplayData.length - 1].date).toDateString().split(' ')[3] : ''}`
                : ''
              }
            </Text>
          </View>
        </View>

        <View style={[ styles.awardsCard, {  }]}>
          <View style={[styles.awardRowConatiner, {}]}>
            <TouchableOpacity
            onPress={toggleStreakDetails}
            activeOpacity={0.7}
            >
            <View style={[styles.award, styles.card, {backgroundColor: colors.boxes}]}>
              <View style={styles.awardContent}>
                <MaterialCommunityIcons name="fire" size={40} color={colors.accent} />
                <Text style={[styles.awardTitle, {color: colors.text}]}>Daily Streak</Text>
                <Text style={[styles.awardValue, {color: colors.text}]}>{awards.streak} days</Text>
              </View>
            </View>
            </TouchableOpacity>
            <TouchableOpacity
            onPress={togglePerfectDetails}
            activeOpacity={0.7}
            >
            <View style={[styles.award, styles.card, {backgroundColor: colors.boxes}]}>
              <View style={styles.awardContent}>
                <MaterialCommunityIcons name="star-circle" size={35} color={colors.blueColor} />
                <Text style={[styles.awardTitle, {color: colors.text}]}>Perfect Days</Text>
                <Text style={[styles.awardValue, {color: colors.text}]}>{awards.perfectDays}</Text>
              </View>
            </View>
            </TouchableOpacity>
          </View> 
          <View style={[styles.awardRowConatiner, {}]}>
          <TouchableOpacity
            onPress={toggleTotalDetails}
            activeOpacity={0.7}
            >
            <View style={[styles.award, styles.card, {backgroundColor: colors.boxes}]}>
              <View style={styles.awardContent}>
                <Ionicons name="calendar" size={35} color={colors.greenColor} />
                <Text style={[styles.awardTitle, {color: colors.text}]}>Total Days</Text>
                <Text style={[styles.awardValue, {color: colors.text}]}>{awards.totalDays}</Text>
              </View>
            </View>
            </TouchableOpacity>
            <TouchableOpacity
            onPress={toggleAccuracyDetails}
            activeOpacity={0.7}
            >
            <View style={[styles.award, styles.card, {backgroundColor: colors.boxes}]}>
              <View style={styles.awardContent}>
                <MaterialCommunityIcons name="target" size={40} color={colors.yellowColor} />
                <Text style={[styles.awardTitle, {color: colors.text}]}>Goal Accuracy</Text>
                <Text style={[styles.awardValue, {color: colors.text}]}>{awards.averageAccuracy}%</Text>
              </View>
            </View>
            </TouchableOpacity>
          </View> 
        </View>
      </View>



      <Modal
        animationType="fade"
        transparent={true}
        visible={streakDetailsVisible}
        onRequestClose={toggleStreakDetails}
      >
        <View style={[styles.modalView, styles.card, { backgroundColor: colors.boxes }]}>
          <MaterialCommunityIcons name="fire" size={60} color={colors.accent} />
          <Text style={[styles.awardValue, {color: colors.text}]}>{awards.streak} days</Text>
          <Text style={[styles.modalText, {color: colors.text}]}>{'\n'}Get back to work</Text>

          <Button
            style={[styles.modalText]}
            color={colors.accent} 
            title="Close"
            onPress={toggleStreakDetails}
          />
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={perfectDetailsVisible}
        onRequestClose={togglePerfectDetails}
      >
        <View style={[styles.modalView, styles.card, { backgroundColor: colors.boxes }]}>
          <MaterialCommunityIcons name="star-circle" size={60} color={colors.blueColor} />
          <Text style={[styles.awardValue, {color: colors.text}]}>{awards.perfectDays} days</Text>
          <Text style={[styles.modalText, {color: colors.text}]}>{'\n'}You should try harder</Text>

          <Button
            style={[styles.modalText]}
            color={colors.accent} 
            title="Close"
            onPress={togglePerfectDetails}
          />
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={totalDetailsVisible}
        onRequestClose={toggleTotalDetails}
      >
        <View style={[styles.modalView, styles.card, { backgroundColor: colors.boxes }]}>
          <Ionicons name="calendar" size={60} color={colors.greenColor} />
          <Text style={[styles.awardValue, {color: colors.text}]}>{awards.totalDays} days</Text>
          <Text style={[styles.modalText, {color: colors.text}]}>{'\n'}Thats not very good</Text>

          <Button
            style={[styles.modalText]}
            color={colors.accent} 
            title="Close"
            onPress={toggleTotalDetails}
          />
          </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={accuracyDetailsVisible}
        onRequestClose={toggleAccuracyDetails}
      >
        <View style={[styles.modalView, styles.card, { backgroundColor: colors.boxes }]}>
          <MaterialCommunityIcons name="target" size={60} color={colors.yellowColor} />
          <Text style={[styles.awardValue, {color: colors.text}]}>{awards.averageAccuracy}%</Text>
          <Text style={[styles.modalText, {color: colors.text}]}>{'\n'}You can do better</Text>

          <Button
            style={[styles.modalText]}
            color={colors.accent} 
            title="Close"
            onPress={toggleAccuracyDetails}
          />
          </View>
      </Modal>


    </View>
  )}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalText: {
    fontSize: 16,
  },
  modalView: {
    gap: 5,
    justifyContent: 'center',
    marginHorizontal: 'auto',
    marginVertical: 'auto',
    alignItems: 'center',
    width: '80%',
    height: '35%',
  },
  contentWrapper: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 20,
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
  graphCard: {
    marginTop: 65,
    flex: 0,
    minHeight: 350,
  },
  awardsCard: {
    flex: 1,
    gap: 16,
  },
  awardRowConatiner: {
    flex: 1, 
    gap: 16,
    justifyContent: 'space-evenly', 
    alignItems: 'center',
    flexDirection: 'row',
  },
  award: {
    borderRadius: 20,
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  awardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  awardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  awardValue: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  graphTitleContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  graphWrapper: {
    flex: 1,
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    width: '100%',
  },
  dropdownWrapper: {
    flex: 1,
    maxWidth: '49%', 
  },
  dropdownContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
  },
  dropdownButton: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
  },
  timeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
  },
  titleDropdownText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  timeDropdownText: {
    fontSize: 16,
    opacity: 0.7,
    fontWeight: '400',
    textAlign: 'center',
    flex: 1,
  },
});