import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import { AntDesign } from "@expo/vector-icons";

import { useAppTheme } from '../hooks/colorScheme';

const PercentCompletionGraph = ({ values }) => {

    const colors = useAppTheme();
  
    const { name, current, total, color } = values;
    const radius = 70;
    const circleCircumference = 2 * Math.PI * radius;

    // Cap the percentage at 100%
    const percentage = Math.min((current / total) * 100, 100);
    const strokeDashoffset = circleCircumference - (circleCircumference * percentage) / 100;

    return (
        <View style={styles.container}>
            <View style={styles.graphWrapper}>
                <Svg height="160" width="160" viewBox="0 0 180 180">
                    <G rotation={-90} originX="90" originY="90">
                        <Circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke= {colors.innerBoxes}
                            fill="transparent"
                            strokeWidth="10"
                        />
                        <Circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke= {color}
                            fill="transparent"
                            strokeWidth="11"
                            strokeDasharray={circleCircumference}
                            strokeDashoffset={strokeDashoffset}
                            overFlow = "hidden"
                        />
                    </G>
                </Svg>
                <View style={styles.textContainer}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.text, {color: colors.text}]}>{name}:</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.text, {color: colors.text}]}>{Math.round(current)}/{total}</Text>
                    <Text> {percentage >= 100 ? <AntDesign name='check' size={14} color={colors.text} /> : ''}</Text>
                </View>
            </View>
        </View>
    );
};

export default PercentCompletionGraph

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 150,

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
    width: 110, // Add fixed width to control text container size
  },
  text: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
    flexWrap: 'wrap',
    width: '100%', // Ensure text takes full width of container
  },
});
