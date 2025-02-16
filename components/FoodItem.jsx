import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAppTheme } from '../hooks/colorScheme';

const FoodItem = ({ item }) => {

  //console.log(item);
  const isCustom = (!item.cat) ? "1" : "0"; // if item has category it is not custom

  const colors = useAppTheme();

  const navigation = useNavigation();

  // activeOpacity={0.5}
  // underlayColor={'transparent'}

  return ( 
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate("FoodPage", { 
          name: item.name, 
          iscustom: isCustom, 
          calories: item.cal, 
          protein: item.protein || 0, 
          carb: item.carb || 0, 
          fat: item.fat || 0, 
          qty: item.qty || 100,
          baseQty: item.qty
        })}
        activeOpacity={0.8}
        underlayColor={'transparent'}
      >
    <View style={[styles.container, { backgroundColor: colors.boxes }]}>
      <View>
        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.name} {isCustom == 1 ? <AntDesign name="star" size={12} color={colors.accent}/> : null}</Text>
        <Text style={{ color: colors.text }}>{isCustom == "0" ? item.cat : "Custom"}, {item.cal} Calories</Text>
      </View>
      <AntDesign 
        title="Add"
        AntDesign name="pluscircleo" 
        size={24} color={colors.accent} backgroundColor={colors.boxes}
      />
            </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  }
});

export default FoodItem;
