import { StyleSheet, Text, View, TextInput, Alert, FlatList, Animated } from 'react-native'
import React, { useLayoutEffect, useState, useEffect, useRef } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { getFoodData } from '../functions/getFoodData';
import MacroSplitGraph from '../components/MacroSplitGraph';
import MicroNutrientDisplayElement from '../components/MicroNutrientDisplayElement';
import DaySelector from '../components/DaySelector';

import { useAppTheme } from '../hooks/colorScheme';

export default function FoodPage() {
  const colors = useAppTheme();

  const navigation = useNavigation();
  const route = useRoute();

  const { name, id, qty: initialQty, iscustom, fromQuickAdd, fromIndex, calories, protein, carb, fat } = route.params;
  const [editMode, setEditMode] = useState(fromIndex&&!fromQuickAdd ? true : false);
  const [isCustom, setIsCustom] = useState(iscustom == 1 ? true : false)
  const [customAdjustmentPage, setCustomAdjustmentPage] = useState(fromQuickAdd == 1 ? true : false);
  //console.log("isCustom:", isCustom, ", editMode:", editMode, ", customAdjustmentPage:", customAdjustmentPage);

  const [qty, setQty] = useState(initialQty ? initialQty.toString() : '100g');
  const [foodData, setFoodData] = useState({});
  const [goals, setGoals] = useState({});
  const [multiplier, setMultiplier] = useState(1);
  const [day , setDay] = useState(2);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: name,
      titleStyle: { fontSize: 20 },
      headerBackTitle: 'Back',
      headerTintColor: colors.accent,
    });
  }, [navigation, name]);
  useEffect(() => {
    retriveFoodData();
    loadGoals();
  }, [name]);

  useEffect(() => {
    const currentQty = parseInt(qty);
    const baseQty = isCustom ? foodData.baseQty : 100;
    if (baseQty && currentQty) {
      const newMultiplier = currentQty / baseQty;
      //console.log(`Updating multiplier: currentQty=${currentQty}, baseQty=${baseQty}, multiplier=${newMultiplier}`);
      setMultiplier(newMultiplier);
    }
  }, [qty, foodData.baseQty, isCustom]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    const str = Number(num).toFixed(1);
    return str.replace(/\.?0+$/, '');
  };

  const retriveFoodData = async () => {
    if(isCustom) {
      try {
        const result = await database.getFirstAsync(
          "SELECT * FROM customfoods WHERE name = ?;",
          [name]
        );
        if(result) {
          const baseQty = result.qty;          
          const foodDataObj = {
            name: result.name,
            qty: qty,
            cal: result.cal,
            protein: result.protein,
            carbs: result.carb,
            fats: result.fat,
            iscustom: 1,
            baseQty: result.qty
          };
          setFoodData(foodDataObj);
          //console.log("retrieved ->", foodDataObj);
          setMultiplier(qty / baseQty);
        }
      } catch (error) {
        console.error("Error fetching custom food:", error);
      }
    } else {
      const results = await getFoodData(name);
      const foodDataObj = {
        ...results,
        baseQty: 100  // Regular foods always use 100g as base
      };
      setFoodData(foodDataObj);
      //console.log("retrieved ->", foodDataObj.name, foodDataObj.baseQty, foodDataObj.cal, foodDataObj.protein, foodDataObj.carbs, foodDataObj.fats);
    }
  };
  const database = useSQLiteContext();

  const logFood = async () => {
    const workingQty = parseInt(qty);
    if(workingQty <= 0 || isNaN(workingQty)) {
      Alert.alert("Error", "Please delete or enter a valid quantity", [{ text: "OK" }]);
      return;
    }
    if(customWasEdited) {
      Alert.alert("Save changes before logging food");
      return;
    }

    const baseQty = isCustom ? foodData.baseQty : 100;
    const currentDate = new Date();
    const targetDate = new Date(currentDate);
    targetDate.setDate(currentDate.getDate() - (2 - day)); // Convert UI day (1,2,3) to offset (-1,0,1))
    
    // Store base values for non-custom foods, and calculated values for custom foods
    const foodValues = isCustom ? {
      cal: foodData.cal,
      protein: foodData.protein,
      carbs: foodData.carbs,
      fats: foodData.fats
    } : {
      cal: foodData.cal,
      protein: foodData.protein,
      carbs: foodData.carbs,
      fats: foodData.fats
    };

    if(!editMode) {
      try {
        await database.runAsync(
          "INSERT INTO foodhistory (name, qty, baseQty, cal, protein, carb, fat, iscustom, day) Values (?, ?, ?, ?, ?, ?, ?, ?, ?);", 
          [
            name, 
            workingQty,
            baseQty,
            foodValues.cal,
            foodValues.protein,
            foodValues.carbs,
            foodValues.fats,
            isCustom ? 1 : 0,
            targetDate.toDateString()
          ]
        );
        navigation.goBack();
      }
      catch (error) {
        console.log(error);
      }
    } else { // in edit mode
      try {
        await database.runAsync(
          "UPDATE foodhistory SET name = ?, qty = ?, baseQty = ?, cal = ?, protein = ?, carb = ?, fat = ?, iscustom = ? WHERE id = ?;", 
          [
            name, 
            workingQty,
            baseQty,
            foodValues.cal,
            foodValues.protein,
            foodValues.carbs,
            foodValues.fats,
            isCustom ? 1 : 0,
            id
          ]
        );
        console.log("successfully EDITED", name, "with qty", workingQty);
        navigation.goBack();
      }
      catch (error) {
        console.log(error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await database.runAsync("DELETE FROM foodhistory WHERE id = ?;", [id]);
      console.log("Deleted item", id);
      navigation.goBack();
    } catch (error) {console.log(error)}
  }
  const handleCustomDelete = async (name) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this custom food? This will also delete it from your recent log.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              // Try deleting from foodhistory first
              const deleteHistoryResult = await database.runAsync(
                "DELETE FROM foodhistory WHERE name = ? AND iscustom = 1;",
                [name]
              );
              //console.log("Foodhistory delete result:", deleteHistoryResult);

              // Then delete from customfoods
              const deleteCustomResult = await database.runAsync(
                "DELETE FROM customfoods WHERE name = ?;",
                [name]
              );
              //console.log("Customfoods delete result:", deleteCustomResult);

              // Verify the deletions
              const historyCheck = await database.getFirstAsync(
                "SELECT COUNT(*) as count FROM foodhistory WHERE name = ? AND iscustom = 1;",
                [name]
              );
              const customCheck = await database.getFirstAsync(
                "SELECT COUNT(*) as count FROM customfoods WHERE name = ?;",
                [name]
              );
              
              //console.log("Remaining in history:", historyCheck?.count);
              //console.log("Remaining in customfoods:", customCheck?.count);

              if (historyCheck?.count === 0 && customCheck?.count === 0) {
                Alert.alert(
                  "Success",
                  "Custom food deleted successfully",
                  [{ text: "OK", onPress: () => navigation.goBack() }]
                );
              } else {
                throw new Error("Deletion verification failed");
              }
            } catch (error) {
              console.error("Error in deletion:", error);
              Alert.alert(
                "Error",
                "Failed to delete food item completely. Please try again."
              );
            }
          },
          style: "destructive"
        }
      ]
    );
  }
  const updateCustomFood = async () => {
    const customProtein = ProteinQty || foodData.protein;
    const customCarbs = CarbQty || foodData.carbs;
    const customFats = FatQty || foodData.fats;
    const customCalories = (customProtein * 4) + (customCarbs * 4) + (customFats * 9);

    console.log("Updating custom food:", name, customCalories, customProtein, customCarbs, customFats);

    console.log("Alternates:", ProteinQty, CarbQty, FatQty);

    Alert.alert(
      "Confirm Update",
      "Are you sure you want to update this custom food? This will also update it in your recent log.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Update",
          onPress: async () => {
    try {
      database.runAsync("UPDATE customfoods SET cal = ?, protein = ?, carb = ?, fat = ? WHERE name = ?;", 
      [
        customCalories,
        customProtein,
        customCarbs,
        customFats,
        name
      ]);
      console.log("sucessfully EDITED custom food ->", name);
      database.runAsync("UPDATE foodhistory SET cal = ?, protein = ?, carb = ?, fat = ? WHERE name = ? AND iscustom = 1;",
      [
        customCalories,
        customProtein,
        customCarbs,
        customFats,
        name
      ]);
      alert("Changes saved");
      navigation.goBack();
    }
    catch (error) {
      console.log(error);
      alert("Error saving changes");
    }
    setCustomWasEdited(false);
    retriveFoodData();
  }, style  : "destructive"
  }]);
}
  const goToPage = () => {
    if(customWasEdited) {
      Alert.alert("Make sure to save changes before logging food");
      return;
    }
    navigation.navigate('FoodPage', {name: name, id: id, qty: qty, calories: calories*multiplier, protein: protein*multiplier, carb: carb*multiplier, fat: fat*multiplier, iscustom: "1"});
  }
  const changeQty = () => {
    const value = qty === '' ? '100' : qty;
    setQty(value);
  };
  const [customWasEdited, setCustomWasEdited] = useState(false);
  const [ProteinQty, setProteinQty] = useState(foodData.protein?.toString());
  const [CarbQty, setCarbQty] = useState(foodData.carbs?.toString());
  const [FatQty, setFatQty] = useState(foodData.fats?.toString());
  const [customQty, setCustomQty] = useState(initialQty)

  const changeProteinQty = () => {
    const value = ProteinQty === '' ? foodData.protein : parseFloat(ProteinQty);
    setProteinQty(value.toString());
    console.log("change qty to", value);
    setCustomWasEdited(true);
  }
  const changeCarbQty = () => {
    const value = CarbQty === '' ? foodData.carbs : parseFloat(CarbQty);
    setCarbQty(value.toString());
    console.log("change qty to", value);
    setCustomWasEdited(true);
  }
  const changeFatQty = () => {
    const value = FatQty === '' ? foodData.fats : parseFloat(FatQty);
    setFatQty(value.toString());
    console.log("change qty to", value);
    setCustomWasEdited(true);
  }
  const loadGoals = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('userGoals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };
  const createNutrientData = () => {
    return [
      { title: 'Fats Breakdown', items: [
        { label: 'Trans Fat', value: Math.round((foodData.transFat * multiplier) * 10) / 10, unit: 'g', goalTotal: goals.transFat},
        { label: 'Saturated Fat', value: Math.round((foodData.satFat * multiplier) * 10) / 10, unit: 'g', goalTotal: goals.saturatedFat},
        { label: 'Polyunsaturated Fat', value: Math.round((foodData.polyFat * multiplier) * 10) / 10, unit: 'g', goalTotal: goals.polyunsaturatedFat},
        { label: 'Monounsaturated Fat', value: Math.round((foodData.monoFat * multiplier) * 10) / 10, unit: 'g', goalTotal: goals.monounsaturatedFat},
      ]},
      { title: 'Carbohydrates Breakdown', items: [
        { label: 'Sugar', value: Math.round((foodData.sugar * multiplier) * 10) / 10, unit: 'g', goalTotal: goals.sugar},
        { label: 'Fiber', value: Math.round((foodData.fiber * multiplier) * 10) / 10, unit: 'g', goalTotal: goals.fiber},
      ]},
      { title: 'Cholesterol', items: [
        { label: 'Cholesterol', value: Math.round((foodData.cholesterol * multiplier) * 1000), unit: 'mg', goalTotal: goals.cholesterol},
      ]},
      { title: 'Essential Minerals', items: [
        { label: 'Sodium', value: Math.round((foodData.sodium * multiplier) * 1000), unit: 'mg', goalTotal: goals.sodium},
        { label: 'Calcium', value: Math.round((foodData.calcium * multiplier) * 1000), unit: 'mg', goalTotal: goals.calcium},
        { label: 'Magnesium', value: Math.round((foodData.magnesium * multiplier) * 1000), unit: 'mg', goalTotal: goals.magnesium},
        { label: 'Phosphorus', value: Math.round((foodData.phosphorus * multiplier) * 1000), unit: 'mg', goalTotal: goals.phosphorus},
        { label: 'Potassium', value: Math.round((foodData.potassium * multiplier) * 1000), unit: 'mg', goalTotal: goals.potassium},
      ]},
      { title: 'Trace Minerals', items: [
        { label: 'Iron', value: Math.round((foodData.iron * multiplier) * 1000), unit: 'mg', goalTotal: goals.iron},
        { label: 'Copper', value: Math.round((foodData.copper * multiplier) * 1000000), unit: 'mcg', goalTotal: goals.copper},
        { label: 'Zinc', value: Math.round((foodData.zinc * multiplier) * 1000), unit: 'mg', goalTotal: goals.zinc},
        { label: 'Manganese', value: Math.round((foodData.manganese * multiplier) * 1000), unit: 'mg', goalTotal: goals.manganese},
        { label: 'Selenium', value: Math.round((foodData.selenium * multiplier) * 1000000), unit: 'mcg', goalTotal: goals.selenium},
      ]},
      { title: 'Fat Soluble Vitamins', items: [
        { label: 'Vitamin A', value: Math.round((foodData.vitaminA * multiplier) * 1000000), unit: 'mcg', goalTotal: goals.vitaminA},
        { label: 'Vitamin D', value: Math.round((foodData.vitaminD * multiplier) * 1000000), unit: 'mcg', goalTotal: goals.vitaminD},
        { label: 'Vitamin E', value: Math.round((foodData.vitaminE * multiplier) * 1000), unit: 'mg', goalTotal: goals.vitaminE},
        { label: 'Vitamin K', value: Math.round((foodData.vitaminK * multiplier) * 1000000), unit: 'mcg', goalTotal: goals.vitaminK},
      ]},
      { title: 'Water Soluble Vitamins', items: [
        { label: 'Vitamin C', value: Math.round((foodData.vitaminC * multiplier) * 1000), unit: 'mg', goalTotal: goals.vitaminC},
        { label: 'Vitamin B1', value: Math.round((foodData.vitaminB1 * multiplier) * 1000), unit: 'mg', goalTotal: goals.vitaminB1},
        { label: 'Vitamin B12', value: Math.round((foodData.vitaminB12 * multiplier) * 1000000), unit: 'mcg', goalTotal: goals.vitaminB12},
        { label: 'Vitamin B2', value: Math.round((foodData.vitaminB2 * multiplier) * 1000), unit: 'mg', goalTotal: goals.vitaminB2},
        { label: 'Vitamin B3', value: Math.round((foodData.vitaminB3 * multiplier) * 1000), unit: 'mg', goalTotal: goals.vitaminB3},
        { label: 'Vitamin B5', value: Math.round((foodData.vitaminB5 * multiplier) * 1000), unit: 'mg', goalTotal: goals.vitaminB5},
        { label: 'Vitamin B6', value: Math.round((foodData.vitaminB6 * multiplier) * 1000), unit: 'mg', goalTotal: goals.vitaminB6},
        { label: 'Folate', value: Math.round((foodData.folate * multiplier) * 1000000), unit: 'mcg', goalTotal: goals.folate},
      ]},
    ];
  };
  const values = customAdjustmentPage ? {
    calories: ((parseFloat(ProteinQty || foodData.protein) * 4) + (parseFloat(CarbQty || foodData.carbs) * 4) + (parseFloat(FatQty || foodData.fats) * 9)),
    protein: parseFloat(ProteinQty || foodData.protein),
    carb: parseFloat(CarbQty || foodData.carbs),
    fat: parseFloat(FatQty || foodData.fats)
  } : {
    calories: foodData.cal * multiplier,
    protein: foodData.protein * multiplier,
    carb: foodData.carbs * multiplier,
    fat: foodData.fats * multiplier,
  };
  // console.log("fromQuickAdd:", customAdjustmentPage, ", editMode:", editMode);
  // console.log("values: ", values, "multiplier: ", multiplier);
  // console.log("parsedData: ", ProteinQty, CarbQty, FatQty);


  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: colors.background }]}>
      {!fromQuickAdd && (
        <View style={[styles.card, styles.topGraphic, { backgroundColor: colors.boxes }]}>
          <View style={styles.graphContainer}>
            <MacroSplitGraph values={values}/>
          </View>
          <View style={styles.macroInfoContainer}>
            <MacroRow label="Protein" value={formatNumber(values.protein)} color={colors.greenColor} />
            <MacroRow label="Carbs" value={formatNumber(values.carb)} color={colors.blueColor} />
            <MacroRow label="Fats" value={formatNumber(values.fat)} color={colors.yellowColor} />
            <View style={[styles.qtyContainer, { backgroundColor: colors.innerBoxes }]}>
              <TextInput 
                value={qty} 
                onChangeText={setQty}
                onEndEditing={changeQty}
                placeholder="100"
                defaultValue="100"
                clearTextOnFocus={true}
                keyboardType="numeric"
                returnKeyType="done"
                style={[styles.qtyInput, {color: colors.text}]}
              />
              <Text style={[styles.unitText, { color: colors.text }]}>g</Text>
            </View>
          </View>
        </View>
      )}
      {fromQuickAdd && <View style={[styles.card, styles.topGraphic, { backgroundColor: colors.boxes }]}> 
        <View style={{flexDirection: "column", alignItems: "center", gap: 5}}>
          <MacroSplitGraph values={values}/>
          <Text style={{color: colors.text}}>Mass: {foodData.qty}g</Text>
        </View>
        <View style={{flexDirection: "column", gap: 5}}>
          <View style={[{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 5}]}>
            <Text style={[{color: colors.greenColor, fontSize: 16, fontWeight: 'bold'}]}>Protein </Text>
            <View style={[styles.qtyContainer, { backgroundColor: colors.innerBoxes, padding:-5 }]}>
            <TextInput
              value={ProteinQty} 
              onChangeText={setProteinQty}
              onEndEditing={changeProteinQty}
              placeholder={''}
              defaultValue={foodData.protein?.toString() || ''}
              clearTextOnFocus={true}
              keyboardType="numeric"
              returnKeyType="done"
              style={[styles.input, {backgroundColor: colors.innerBoxes, color: colors.text, textAlign: 'center', fontSize: 16}]} />
              <Text style={[styles.unitText, { color: colors.text }]}>g</Text>
              </View>
          </View>
          <View style={[{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 5}]}>
            <Text style={[{color: colors.blueColor, fontSize: 16, fontWeight: 'bold'}]}>Carbs </Text>
            <View style={[styles.qtyContainer, { backgroundColor: colors.innerBoxes, padding:-5  }]}>
            <TextInput
              value={CarbQty} 
              onChangeText={setCarbQty}
              onEndEditing={changeCarbQty}
              placeholder={''}
              defaultValue={foodData.carbs?.toString() || ''}
              clearTextOnFocus={true}
              keyboardType="numeric"
              returnKeyType="done"
              style={[styles.input, {backgroundColor: colors.innerBoxes, color: colors.text, textAlign: 'center', fontSize: 16}]} />
              <Text style={[styles.unitText, { color: colors.text }]}>g</Text>
            </View>
          </View>
          <View style={[{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 5}]}>
            <Text style={[{color: colors.yellowColor, fontSize: 16, fontWeight: 'bold'}]}>Fats </Text>
            <View style={[styles.qtyContainer, { backgroundColor: colors.innerBoxes, padding:-5  }]}>
            <TextInput
              value={FatQty} 
              onChangeText={setFatQty}
              onEndEditing={changeFatQty}
              placeholder={''}
              defaultValue={foodData.fats?.toString() || ''}
              clearTextOnFocus={true}
              keyboardType="numeric"
              returnKeyType="done"
              style={[styles.input, {backgroundColor: colors.innerBoxes, color: colors.text, textAlign: 'center', fontSize: 16}]} />
              <Text style={[styles.unitText, { color: colors.text }]}>g</Text>
              </View>
          </View>
        </View>
      </View>}

      {customWasEdited && <View style={[styles.card, { backgroundColor: colors.boxes, marginBottom: 16 }]}>
        <AntDesign.Button
          style={[styles.button, {}]}
          name="check"
          onPress={() => updateCustomFood()}
          backgroundColor={colors.boxes}
          color={colors.accent}>
          Save Changes
        </AntDesign.Button>
      </View>}

      {!isCustom && <View style={[styles.detailsContainer, { height: '60%'}]}>
        <FlatList
          data={createNutrientData()}
          renderItem={({ item }) => (
            <View style={[styles.nutrientSection, { backgroundColor: colors.boxes }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{item.title}</Text>
              {item.items.map((nutrient, index) => (
                <MicroNutrientDisplayElement key={index} values={{name: nutrient.label, current: nutrient.value, unit: nutrient.unit, total: nutrient.goalTotal, color: 'grey'}} />
              ))}
            </View>
          )}
          contentContainerStyle={styles.list}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>}

      <View style={[styles.buttonContainer, styles.card, { backgroundColor: colors.boxes }]}> 
        <View style={styles.buttonWrapper}>
          {fromQuickAdd &&
            <View style={[styles.innerButtonCard, {backgroundColor: colors.boxes}]}>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => handleCustomDelete(name)}
                style={styles.actionButton}
              >
                <AntDesign name="star" size={24} color={colors.accent} />
                <Text style={{color: colors.accent, fontSize: 16, textAlign: "center"}}>Delete Food</Text>
              </TouchableOpacity>
            </View>
          }

          {!editMode&&!fromQuickAdd &&
            <DaySelector 
              onDayChange={(value) => {
                setDay(value);
                console.log("day set to", value);
              }} 
            />
          }
          
          {editMode &&
            <View style={[styles.innerButtonCard, {backgroundColor: colors.boxes}]}>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => handleDelete(id)}
                style={styles.actionButton}
              >
                <AntDesign name="delete" size={24} color={colors.accent} />
                <Text style={{color: colors.accent, fontSize: 16}}>Delete From Log</Text>
              </TouchableOpacity>
            </View>
          }

          <View style={[styles.innerButtonCard, {backgroundColor: colors.boxes}]}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {fromQuickAdd ? goToPage() : logFood()}}
              style={styles.actionButton}
            >
              <AntDesign name="pluscircleo" size={24} color={colors.accent} />
              <Text style={{color: colors.accent, fontSize: 16}}>
                {editMode ? "Save Changes" : "Add to Log"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

  </Animated.View>);
  }

const MacroRow = ({ label, value, color }) => (
  <View style={styles.macroRow}>
    <Text style={[styles.macroLabel, { color }]} numberOfLines={1}>{label}</Text>
    <View style={styles.macroValueContainer}>
      <Text style={[styles.macroValue, { color }]} numberOfLines={1}>{value}g</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
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
  topGraphic: {
    gap: 16,
    marginBottom: 16,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
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
    paddingLeft: 8,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    maxWidth: '100%',
  },
  macroLabel: {
    fontSize: 15,
    fontWeight: '600',
    width: '35%',  // Reduced from 40%
    marginRight: 4,
  },
  macroValueContainer: {
    flex: 1,
    alignItems: 'flex-end',
    overflow: 'hidden',
    maxWidth: '60%',  // Added maximum width
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '700',
    maxWidth: '100%',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 4,
    marginTop: 8,
    opacity: 0.8,
  },
  qtyInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    padding: 12,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36, // Add more padding at bottom
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  innerButtonCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: '40%',
    maxWidth: '50%',
  },
  nutrientSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  detailsContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 80, // Add space for fixed button container
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    minWidth: 75,
    textAlign: 'center',
  },
  list: {
  },
})