import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { G, Circle } from "react-native-svg";

import { useAppTheme } from '../hooks/colorScheme';

const MacroSplitGraph = ({ values }) => {

    const colors = useAppTheme();

    const { calories, protein, carb, fat} = values;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    // Calculate calories from each macro
    const proteinCals = protein * 4;
    const carbCals = carb * 4;
    const fatCals = fat * 9;
    const totalCals = proteinCals + carbCals + fatCals;

    const proteinLength = (proteinCals / totalCals) * circumference;
    const carbLength = (carbCals / totalCals) * circumference;
    const fatLength = (fatCals / totalCals) * circumference;

    return (
        <View style={styles.container}>
            <View style={styles.graphWrapper}>
                <Svg height="160" width="160" viewBox="0 0 180 180">
                    <G rotation={-90} originX="90" originY="90">
                        {totalCals === 0 ? (
                            // Render single grey circle when no data
                            <Circle
                                cx="50%"
                                cy="50%"
                                r={radius}
                                stroke="#808080"
                                fill="transparent"
                                strokeWidth="21"
                            />
                        ) : (
                            // Render macro split circles when there's data
                            <>
                                <Circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke={colors.innerBoxes}
                                    fill="transparent"
                                    strokeWidth="20"
                                />
                                <Circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke={colors.greenColor}
                                    fill="transparent"
                                    strokeWidth="21"
                                    strokeDasharray={`${proteinLength} ${circumference - proteinLength}`}
                                    strokeDashoffset="0"
                                />
                                <Circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke={colors.blueColor}
                                    fill="transparent"
                                    strokeWidth="21"
                                    strokeDasharray={`${carbLength} ${circumference - carbLength}`}
                                    strokeDashoffset={-proteinLength}
                                />
                                <Circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke={colors.yellowColor}
                                    fill="transparent"
                                    strokeWidth="21"
                                    strokeDasharray={`${fatLength} ${circumference - fatLength}`}
                                    strokeDashoffset={-(proteinLength + carbLength)}
                                />
                            </>
                        )}
                    </G>
                </Svg>
                <View style={styles.textContainer}>
                    <Text style={[styles.text, {color: colors.text, fontSize: 16}]}>Calories:</Text>
                    <View style={styles.calorieContainer}>
                        <Text 
                            numberOfLines={1} 
                            ellipsizeMode="tail"
                            style={[styles.calorieText, {color: colors.text}]}>
                            {Math.round(calories)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default MacroSplitGraph

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 150,

    //backgroundColor: "white",

    justifyContent: "center",
    alignItems: "center",
  },
  graphWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    position: "absolute",
    alignItems: 'center',
    width: '65%',  // Reduced from 80%
  },
  calorieContainer: {
    maxWidth: '100%',
    overflow: 'hidden',
    paddingHorizontal: 4,
  },
  calorieText: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
    maxWidth: '100%',
  },
  text: {
    textAlign: "center",
    fontWeight: "600",
  },
});


// const values = {
//   calories: foodData.cal * multiplier,
//   protein: foodData.protein * multiplier,
//   carb: foodData.carbs * multiplier,
//   fat: foodData.fats * multiplier,
// };

// <View style={{}}>
//   <MacroSplitGraph values={values}/>
// </View>

// import MacroSplitGraph from '@/components/MacroSplitGraph';