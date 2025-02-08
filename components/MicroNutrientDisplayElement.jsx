import React from "react";
import { View, StyleSheet, Text } from "react-native";

import { useAppTheme } from '../hooks/colorScheme';


const MicroNutrientDisplayElement = ({ values }) => {
    const colors = useAppTheme();

    const { name, current, total, unit, color } = values;
    //console.log(values);
    const multiplier = (current / total);
    const totalLen = 90;

    const percent = Math.round(100 * current/total);
    //if (isNaN(percent)) console.log('NaN:', current, total);
    return (
        <View style={[styles.graphWrapper, { paddingVertical: 5, gap: 5 }]}>
            <View style={{flexDirection: 'row', flex: 2}}>
                <View style={{width: 60,}}>
                {percent <= 1000 && <Text style={{color: colors.text, fontWeight: 'bold', marginVertical: 'auto'}}>{percent}%</Text>}
                {percent > 1000 && <Text style={{color: colors.text, fontWeight: 'bold', marginVertical: 'auto'}}>+999%</Text>}
                </View>
                <View style={[styles.container, {width: totalLen}]}>
                <View style={[styles.barChartContainer, { width: totalLen, backgroundColor: colors.innerBoxes}]}>
                    <View
                    style={[styles.bar, { width: (totalLen * multiplier) , backgroundColor: color}]}
                    />
                </View>
            </View>
        </View>
            <View style={{flexDirection: 'row', flex: 2.4, justifyContent: 'flex-end'}}>
                <Text style={{color: colors.text, fontWeight: 'bold', textAlign: 'right'}}>  
                    {name}: {current.toString().length > 7 ? current.toString().substring(0, 7) + '...' : current}/{total}{unit}
                </Text>
            </View>
        </View>
    );
}

export default MicroNutrientDisplayElement;

const styles = StyleSheet.create({
    container: {
        gap: 20,
        flex: 1,
        flexDirection: "row",
    },
    graphWrapper: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    text: {
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
