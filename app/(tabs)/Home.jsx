import { View, Text, StyleSheet} from 'react-native'
import React from 'react'
import { useAppTheme } from '../../hooks/colorScheme';


import PercentCompletionGraph from "../../components/PercentCompletionGraph";
import MicroNutrientDisplayElement from "../../components/MicroNutrientDisplayElement";
import MetricsGraphElement from "../../components/MetricsGraphElement";
import MacroSplitGraph from "../../components/MacroSplitGraph";
import HorizontalBarChart from "../../components/HorizontalBarChart";

import LoggedFoodItem from "../../components/LoggedFoodItem";
import FoodItem from "../../components/FoodItem";

import { useState } from 'react';
import DaySelector from "../../components/DaySelector";

const Home = () => {
  const [day, setDay] = useState(0);
  const colors = useAppTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={{color: colors.text}}>Home Screen</Text>

      <PercentCompletionGraph values={{name: 'Test', current: 10, total: 20, color: 'red'}} />
      <MicroNutrientDisplayElement values={{name: 'Test', current: 10, total: 20, unit: 'mg', color: 'blue'}} />
      <MetricsGraphElement values={[10, 20, 'green', 5, 5]} />
      <MacroSplitGraph values={{calories: 100, protein: 10, carb: 20, fat: 30}} />
      <HorizontalBarChart values={{name: 'Test', current: 10, total: 20, color: 'red'}} />

      <LoggedFoodItem item={{name: 'Test', qty: 100, baseQty: 100, cal: 100, protein: 10, carb: 20, fat: 30}} index={0} iscustom={false} fromQuickAdd={false} />
      <FoodItem item={{name: 'Test', qty: 100, baseQty: 100, cal: 100, protein: 10, carb: 20, fat: 30}} />

      <DaySelector onDayChange={(day) => console.log(day)} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home