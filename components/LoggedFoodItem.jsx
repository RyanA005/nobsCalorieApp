import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAppTheme } from '../hooks/colorScheme';

const formatNumber = (num) => {
  const str = Number(num).toFixed(1);
  return str.replace(/\.?0+$/, '');
};

const LoggedFoodItem = ({ item, index, iscustom, fromQuickAdd }) => {
  const colors = useAppTheme();
  const navigation = useNavigation();

  const currentQty = parseInt(item.qty);
  const baseQty = parseInt(item.baseQty || 100);
  const multiplier = currentQty / baseQty;

  // Calculate the actual values using the multiplier
  const calculatedValues = {
    calories: Math.round(Number(item.cal || 0) * multiplier),
    protein: Number(item.protein || 0) * multiplier,
    carb: Number(item.carb || 0) * multiplier,
    fat: Number(item.fat || 0) * multiplier
  };

  //console.log("item:", item);

  const handlePress = () => {
    //console.log("passing params:", item.name, item.qty);
    if(!iscustom) {
      navigation.navigate("FoodPage", {
          id: item.id,
          name: item.name,
          qty: item.qty || 100,
          iscustom: iscustom,
          fromQuickAdd: fromQuickAdd,
          fromIndex: true,
      });
    }
    else {
      //console.log("passing params:", item.name, item.qty);
      navigation.navigate("FoodPage", {
          id: item.id,
          name: item.name,
          qty: item.qty || 100,
          iscustom: iscustom,
          fromQuickAdd: fromQuickAdd,
          fromIndex: true,
          calories: item.cal,
          protein: item.protein,
          carb: item.carb,
          fat: item.fat
      });
    }
  };

  return ( 
    <View style={[styles.container, { backgroundColor: colors.boxes }]}>
      <View style={{ justifyContent: 'center', flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: 'bold' }}> 
          {item.name} - {currentQty}g - {formatNumber(calculatedValues.calories)} Calories {iscustom ? <AntDesign name="star" size={12} color={colors.accent}/> : null}
        </Text>
        <Text style={{ color: colors.text }}>{formatNumber(calculatedValues.protein)}g Protein, {formatNumber(calculatedValues.carb)}g Carb, {formatNumber(calculatedValues.fat)}g Fat 
        </Text>
      </View>
      <AntDesign.Button 
        onPress={handlePress}
        title="edit"
        name="edit"
        size={24} 
        color={colors.accent} 
        backgroundColor={colors.boxes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
    borderRadius: 10,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  }
});

export default LoggedFoodItem;