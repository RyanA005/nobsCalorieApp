import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { useAppTheme } from "../hooks/colorScheme";


const HorizontalBarChart = ({ values }) => {
  const colors = useAppTheme();

    const { name, current, total, color } = values;
    const multiplier = (current / total);
    const totalLen = 160;
    return (
        <View style={[styles.container, {width: totalLen}]}>
        <View style={[styles.barChartContainer, { width: totalLen, backgroundColor: colors.innerBoxes}]}>
            <View
              style={[styles.bar, { width: (totalLen * multiplier) , backgroundColor: color}]}
            />
        </View>
        <Text style={{color:colors.text, fontWeight: 'bold', marginVertical: 'auto'}}>{name}:{Math.round(current)}/{total} {multiplier >= 1 ? <AntDesign name='check' size={14} /> : ''}</Text> 
        </View>
    );
}

export default HorizontalBarChart;

const styles = StyleSheet.create({
    container: {
      justifyContent: "space-around",
      flex: 1,
      margin: 10,

    },
    graphWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        position: "absolute",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 18,
    },
    barChartContainer: {
        height: 20,
        borderRadius: 10,
        overflow: 'hidden'
    },
    bar: {
        height: 20,
    }
});
