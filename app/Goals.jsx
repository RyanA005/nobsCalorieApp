import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLayoutEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

import { useAppTheme } from '../hooks/colorScheme';

import MacroSplitGraph from '../components/MacroSplitGraph';

const DEFAULT_VALUES = {
  protein: '150',
  carbs: '150',
  fats: '100',
  dailyCalories: '2100',

  transFat: '2',
  saturatedFat: '20',
  polyunsaturatedFat: '17',
  monounsaturatedFat: '44',

  netCarbs: '53',
  sugar: '25',
  fiber: '28',

  cholesterol: '300',
  sodium: '2300',
  calcium: '1000',
  magnesium: '400',
  phosphorus: '700',
  potassium: '3400',

  iron: '18',
  copper: '900',
  zinc: '11',
  manganese: '2.3',
  selenium: '55',

  vitaminA: '900',
  vitaminD: '20',
  vitaminE: '15',
  vitaminK: '120',
  
  vitaminC: '90',
  vitaminB1: '1.2',
  vitaminB12: '2.4',
  vitaminB2: '1.3',
  vitaminB3: '16',
  vitaminB5: '5',
  vitaminB6: '1.7',
  folate: '400',
};

export default function Goals() {
  const [goals, setGoals] = useState(DEFAULT_VALUES);

  const navigation = useNavigation();
  const colors = useAppTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      titleStyle: { fontSize: 20 },
      headerBackTitle: 'Home',
      headerTintColor: colors.accent,
    });
  }, [navigation]);

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    const proteinCals = parseFloat(goals.protein || '0') * 4;
    const carbsCals = parseFloat(goals.carbs || '0') * 4;
    const fatsCals = parseFloat(goals.fats || '0') * 9;
    const total = Math.round(proteinCals + carbsCals + fatsCals);
    
    setGoals(prev => ({
      ...prev,
      dailyCalories: total.toString()
    }));
  }, [goals.protein, goals.carbs, goals.fats]);

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

  const saveGoals = async () => {
    // Check for empty fields
    if (!goals.protein || !goals.carbs || !goals.fats) {
      alert('Please fill in all fields before saving');
      return;
    }

    try {
      await AsyncStorage.setItem('userGoals', JSON.stringify(goals));
      alert('Goals saved successfully!');
      router.back();
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const handleInputChange = (field, text) => {
    const filtered = text.replace(/[^0-9]/g, '');
    setGoals(prev => ({...prev, [field]: filtered}));
  };

  const resetToDefault = () => {
    Alert.alert(
          "Confirm Reset",
          "Are you sure you want to reset ALL preferences?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Reset",
              onPress: () => {
                setGoals(DEFAULT_VALUES);
              },
              style: "destructive"
            }
          ]
        );
      }

  const values = {
    calories: goals.dailyCalories,
    protein: goals.protein,
    carb: goals.carbs,
    fat: goals.fats,
  };

  const micronutrientGroups = [
    {
      title: 'Fats',
      items: [
        { key: 'transFat', label: 'Trans Fat', unit: 'g' },
        { key: 'saturatedFat', label: 'Saturated Fat', unit: 'g' },
        { key: 'polyunsaturatedFat', label: 'Polyunsaturated Fat', unit: 'g' },
        { key: 'monounsaturatedFat', label: 'Monounsaturated Fat', unit: 'g' },
      ]
    },
    {
      title: 'Carbohydrates',
      items: [
        //{ key: 'netCarbs', label: 'Net Carbs', unit: 'g' },
        { key: 'sugar', label: 'Sugar', unit: 'g' },
        { key: 'fiber', label: 'Fiber', unit: 'g' },
      ]
    },
    {
      title: 'Cholesterol',
      items: [
        { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' }
      ]
    },
    {
      title: 'Essential Minerals',
      items: [
        { key: 'sodium', label: 'Sodium', unit: 'mg' },
        { key: 'calcium', label: 'Calcium', unit: 'mg' },
        { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
        { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
        { key: 'potassium', label: 'Potassium', unit: 'mg' },
      ]
    },
    {
      title: 'Trace Minerals',
      items: [
        { key: 'iron', label: 'Iron', unit: 'mg' },
        { key: 'copper', label: 'Copper', unit: 'mcg' },
        { key: 'zinc', label: 'Zinc', unit: 'mg' },
        { key: 'manganese', label: 'Manganese', unit: 'mg' },
        { key: 'selenium', label: 'Selenium', unit: 'mcg' },
      ]
    },
    {
      title: 'Fat Soluble Vitamins',
      items: [
        { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg' },
        { key: 'vitaminD', label: 'Vitamin D', unit: 'mcg' },
        { key: 'vitaminE', label: 'Vitamin E', unit: 'mg' },
        { key: 'vitaminK', label: 'Vitamin K', unit: 'mcg' },
      ]
    },
    {
      title: 'Water Soluble Vitamins',
    items: [
        { key: 'vitaminC', label: 'Vitamin C', unit: 'mg' },
        { key: 'vitaminB1', label: 'Vitamin B1', unit: 'mg' },
        { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg' },
        { key: 'vitaminB2', label: 'Vitamin B2', unit: 'mg' },
        { key: 'vitaminB3', label: 'Vitamin B3', unit: 'mg' },
        { key: 'vitaminB5', label: 'Vitamin B5', unit: 'mg' },
        { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg' },
        { key: 'folate', label: 'Folate', unit: 'mcg' },
      ]
    },
  ];

  const renderItem = ({ item }) => (
    <View style={[styles.groupContainer, { backgroundColor: colors.boxes }]}>
      <Text style={[styles.groupTitle, { color: colors.accent }]}>{item.title}</Text>
      {item.items.map((nutrient) => (
        <View key={nutrient.key} style={styles.nutrientRow}>
          <Text style={[styles.nutrientLabel, { color: colors.text }]}>
            {nutrient.label} ({nutrient.unit}):
          </Text>
          <TextInput
            style={[styles.nutrientInput, { color: colors.text, backgroundColor: colors.innerBoxes }]}
            value={goals[nutrient.key]}
            onChangeText={(text) => handleInputChange(nutrient.key, text)}
            keyboardType="numeric"
            placeholder='0'
            placeholdercolor={colors.text-222222}
            returnKeyType="done"
            textAlign='center'
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
      <View style={[styles.card, { backgroundColor: colors.boxes }]}>
        <View style={styles.topGraphic}>
          <View style={styles.graphContainer}>
            <MacroSplitGraph values={values}/>
          </View>
          <View style={styles.macroInfoContainer}>
            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: colors.greenColor }]}>Protein</Text>
              <View style={[styles.qtyContainer, { backgroundColor: colors.innerBoxes }]}>
                <TextInput
                  style={[styles.qtyInput, {color: colors.text}]}
                  value={goals.protein}
                  onChangeText={(text) => handleInputChange('protein', text)}
                  keyboardType="numeric"
                  placeholder="0g"
                  placeholdercolor={colors.text+222222}
                  clearTextOnFocus={true}
                  returnKeyType="done"
                  textAlign='center'
                />
              </View>
            </View>

            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: colors.blueColor }]}>Carbs</Text>
              <View style={[styles.qtyContainer, { backgroundColor: colors.innerBoxes }]}>
                <TextInput
                  style={[styles.qtyInput, {color: colors.text}]}
                  value={goals.carbs}
                  onChangeText={(text) => handleInputChange('carbs', text)}
                  keyboardType="numeric"
                  placeholder="0g"
                  placeholdercolor={colors.text+222222}
                  clearTextOnFocus={true}
                  returnKeyType="done"
                  textAlign='center'
                />
              </View>
            </View>

            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: colors.yellowColor }]}>Fats</Text>
              <View style={[styles.qtyContainer, { backgroundColor: colors.innerBoxes }]}>
                <TextInput
                  style={[styles.qtyInput, {color: colors.text}]}
                  value={goals.fats}
                  onChangeText={(text) => handleInputChange('fats', text)}
                  keyboardType="numeric"
                  placeholder="0g"
                  placeholdercolor={colors.text+222222}
                  clearTextOnFocus={true}
                  returnKeyType="done"
                  textAlign='center'
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: 'transparent' }]}
          onPress={saveGoals}>
          <AntDesign name="save" size={24} color={colors.accent} />
          <Text style={[styles.buttonText, { color: colors.accent }]}>Save Goals</Text>
        </TouchableOpacity>
      </View>
        <FlatList
          data={micronutrientGroups}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          ListFooterComponent={() => (
            <TouchableOpacity 
              style={[styles.resetButton, { backgroundColor: colors.boxes }]}
              onPress={resetToDefault}>
              <Text style={[styles.resetButtonText, { color: colors.accent }]}>Reset to Default Values</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    marginBottom: 8, // Reduced from 16 to 8
  },
  topGraphic: {
    gap: 16,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  graphContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '50%',
  },
  macroInfoContainer: {
    flex: 1,
    gap: 8,
    maxWidth: '50%',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  macroLabel: {
    fontSize: 15,
    fontWeight: '600',
    width: '35%',
    marginRight: 4,
  },
  qtyContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  qtyInput: {
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    marginTop: 16,
    gap: 8,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: 75,
    borderRadius: 20,
    padding: 10,
    fontSize: 16,
    alignItems: 'center',
  },
  saveButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutrientLabel: {
    fontSize: 14,
    flex: 1,
  },
  nutrientInput: {
    width: 80,
    borderRadius: 15,
    padding: 8,
    fontSize: 14,
  },
  list: {
  },
  resetButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 5,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});