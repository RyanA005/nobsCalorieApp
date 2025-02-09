import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import { useLayoutEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSQLiteContext } from 'expo-sqlite'
import { AntDesign } from '@expo/vector-icons'

import MacroSplitGraph from '../components/MacroSplitGraph';
import LoggedFoodItem from '../components/LoggedFoodItem'

import { useAppTheme } from '../hooks/colorScheme';

const QuickAdd = ({ navigation }) => {
  const colors = useAppTheme();
    
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [qty, setQty] = useState('');

    const [multiplier, setMultiplier] = useState(1);

    const values = {
        protein: parseInt(protein) || 0,
        carb: parseInt(carbs) || 0,
        fat: parseInt(fats) || 0,
        calories: (protein*4 + carbs*4 + fats*9) || 0
    }

    const getCalories = (protein, carbs, fats) => {
      return ((protein || 0) * 4) + ((carbs || 0) * 4) + ((fats || 0) * 9);
    }

    const [customFoodData, setCustomFoodData] = useState([]);
    const database = useSQLiteContext();
    const insertIntoDB = async (name, calories, protein, carbs, fats, qty) => {
      if (!name) {
        alert("Name is required");
        return;
      }
      if (qty <= 1) {
        alert("Weight must be greater than 1");
        return;
      }
      try {
        await database.runAsync(
          "INSERT INTO customfoods (name, qty, cal, protein, carb, fat) VALUES (?, ?, ?, ?, ?, ?);", 
          [
            name,
            parseInt(qty) || 100,
            getCalories(protein, carbs, fats),
            parseInt(protein) || 0,
            parseInt(carbs) || 0,
            parseInt(fats) || 0
          ]
        );
        clearFields();
        await fetchCustomFood();
        console.log("successfully added", name, "to customfoods");
      }
      catch (error) {
        console.log(error);
        alert("Error adding food, make sure to use a unique name");
      }
    }
    const fetchCustomFood = async () => {
      try {
        //console.log("Attempting to fetch custom foods...");
        if (!database) {
          console.error("Database is not initialized");
          return;
        }

        const results = await database.getAllAsync("SELECT * FROM customfoods;");
        //console.log("Raw SQL results:", JSON.stringify(results));
        
        if (Array.isArray(results)) {
          //console.log("Number of items fetched:", results.length);
          setCustomFoodData(results);
          setMultiplier(customFoodData.qty/100 || 1)
        } else {
          console.error("Results is not an array:", typeof results);
        }
      }
      catch (error) {
        console.error("Error fetching data:", error);
        setCustomFoodData([]);
      }
    }

    useEffect(() => {
      fetchCustomFood(); // Initial load
      const unsubscribe = navigation.addListener('focus', fetchCustomFood);
      return unsubscribe;
    }, [navigation]);

    React.useEffect(() => {
      //console.log("customFoodData updated:", customFoodData.length, "items");
    }, [customFoodData]);

    const displayData = customFoodData.map(item => (
      {
      ...item,
      qty: item.qty,
      cal: item.cal * (100 / item.qty),
      protein: item.protein * (100 / item.qty),
      carb: item.carb * (100 / item.qty),
      fat: item.fat * (100 / item.qty),
    }));

    const clearFields = () => {
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      setQty('');
    }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.boxes }]}>
        <View style={styles.inputRow}>
          <View style={[styles.nameInputContainer, { backgroundColor: colors.innerBoxes, flex: 1 }]}>
            <TextInput
              style={[styles.nameInput, {color: colors.text}]}
              placeholder="Food Name"
              value={foodName}
              onChangeText={setFoodName}
              placeholdercolor={colors.text+222222}
              returnKeyType='done'
            />
          </View>
          <View style={[styles.qtyMainContainer, { backgroundColor: colors.innerBoxes, flex: 1, marginLeft: 8 }]}>
            <TextInput
              style={[styles.qtyInput, {color: colors.text}]}
              placeholder="100g"
              value={qty}
              onChangeText={setQty}
              placeholdercolor={colors.text+222222}
              keyboardType="numeric"
              returnKeyType='done'
            />
          </View>
        </View>

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
                  placeholder="0g"
                  value={protein}
                  onChangeText={setProtein}
                  placeholdercolor={colors.text+222222}
                  keyboardType="numeric"
                  returnKeyType='done'
                />
              </View>
            </View>
            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: colors.blueColor }]}>Carbs</Text>
              <View style={[styles.qtyContainer, { backgroundColor: colors.innerBoxes }]}>
                <TextInput
                  style={[styles.qtyInput, {color: colors.text}]}
                  placeholder="0g"
                  value={carbs}
                  onChangeText={setCarbs}
                  placeholdercolor={colors.text+222222}
                  keyboardType="numeric"
                  returnKeyType='done'
                />
              </View>
            </View>
            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: colors.yellowColor }]}>Fats</Text>
              <View style={[styles.qtyContainer, { backgroundColor: colors.innerBoxes }]}>
                <TextInput
                  style={[styles.qtyInput, {color: colors.text}]}
                  placeholder="0g"
                  value={fats}
                  onChangeText={setFats}
                  placeholdercolor={colors.text+222222}
                  keyboardType="numeric"
                  returnKeyType='done'
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => insertIntoDB(foodName, parseInt(calories), parseInt(protein), parseInt(carbs), parseInt(fats), parseInt(qty))}
          style={[styles.actionButton, { backgroundColor: 'transparent'}]}
        >
          <AntDesign name="pluscircleo" size={24} color={colors.accent} />
          <Text style={{color: colors.accent, fontSize: 16, fontWeight: 'bold'}}>
            Add New Food
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={displayData}
          ListHeaderComponent={displayData.length > 0 ? () => (
            <Text style={{color: colors.text, fontSize: 18, textAlign: 'center', marginBottom: 10}}>
              Custom Foods
            </Text>
          ) : null}
          renderItem={({item, index}) => (
            <LoggedFoodItem 
              item={item}
              index={index}
              iscustom={1}
              fromQuickAdd={1}
            />
          )}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={{
            padding: 5,
            gap: 5,
          }}
          ListEmptyComponent={() => (
            <Text style={{
              color: colors.text,
              textAlign: 'center',
              padding: 20,
              fontSize: 16
            }}>
              No custom foods added yet
            </Text>
          )}
        />
      </View>
    </View>
  )
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
    nameInputContainer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    qtyMainContainer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    qtyInput: {
        fontSize: 16,
        fontWeight: '600',
        padding: 8,
        textAlign: 'center',
    },
    nameInput: {
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
    listContainer: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
});

export default QuickAdd;