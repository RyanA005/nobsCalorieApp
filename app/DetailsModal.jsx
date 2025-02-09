import { useState, useEffect } from 'react';
import { Modal, View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MicroNutrientDisplayElement from '../components/MicroNutrientDisplayElement';
import { AntDesign } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { getFoodData } from '../functions/getFoodData';
import { useAppTheme } from '../hooks/colorScheme';

export default function DetailsModal({ isVisible, onClose, day }) {  // Add day to props

    const colors = useAppTheme();

    const [goals, setGoals] = useState({});

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

    const database = useSQLiteContext();

    useEffect(() => {
        if (isVisible) {
            loadGoals();
            loadCurrentValues();
        }
    }, [isVisible, day]); // Add day to dependencies

    const [currentValues, setCurrentValues] = useState({
        transFat: 0,
        satFat: 0,
        polyFat: 0,
        monoFat: 0,
        netCarbs: 0,
        sugar: 0,
        fiber: 0,
        cholesterol: 0,
        sodium: 0,
        calcium: 0,
        magnesium: 0,
        phosphorus: 0,
        potassium: 0,
        iron: 0,
        copper: 0,
        zinc: 0,
        manganese: 0,
        selenium: 0,
        vitaminA: 0,
        vitaminD: 0,
        vitaminE: 0,
        vitaminK: 0,
        vitaminC: 0,
        vitaminB1: 0,
        vitaminB12: 0,
        vitaminB2: 0,
        vitaminB3: 0,
        vitaminB5: 0,
        vitaminB6: 0,
        folate: 0,
    });

    const loadCurrentValues = async () => {
        try {
            const foodDB = await database.getAllAsync('SELECT * FROM foodhistory');
            let newValues = {
                transFat: 0,
                satFat: 0,
                polyFat: 0,
                monoFat: 0,
                netCarbs: 0,
                sugar: 0,
                fiber: 0,
                cholesterol: 0,
                sodium: 0,
                calcium: 0,
                magnesium: 0,
                phosphorus: 0,
                potassium: 0,
                iron: 0,
                copper: 0,
                zinc: 0,
                manganese: 0,
                selenium: 0,
                vitaminA: 0,
                vitaminD: 0,
                vitaminE: 0,
                vitaminK: 0,
                vitaminC: 0,
                vitaminB1: 0,
                vitaminB12: 0,
                vitaminB2: 0,
                vitaminB3: 0,
                vitaminB5: 0,
                vitaminB6: 0,
                folate: 0,
            };

            // Filter for current day before processing
            const dayFoods = foodDB.filter(item => item.day === day);

            for (const item of dayFoods) {
                try {
                    const food = await getFoodData(item.name, database);
                    if (food) {
                        Object.keys(newValues).forEach(key => {
                            newValues[key] = +newValues[key] + +((food[key]*(item.qty/100)) || 0);
                        });
                    }
                } catch (foodError) {
                    console.error('Error fetching food data:', foodError);
                }
            }
            setCurrentValues(newValues);
        } catch (error) {
            console.error('Error loading current values:', error);
        }
    };

    const createNutrientData = () => {
        return [
            { title: 'Fats Breakdown', items: [
                { label: 'Trans Fat', value: ((currentValues.transFat)).toFixed(0), unit: 'g', goalTotal: goals.transFat},
                { label: 'Saturated Fat', value: ((currentValues.satFat)).toFixed(0), unit: 'g', goalTotal: goals.saturatedFat},
                { label: 'Polyunsaturated Fat', value: ((currentValues.polyFat)).toFixed(0), unit: 'g', goalTotal: goals.polyunsaturatedFat},
                { label: 'Monounsaturated Fat', value: ((currentValues.monoFat)).toFixed(0), unit: 'g', goalTotal: goals.monounsaturatedFat},
            ]},
            { title: 'Carbohydrates Breakdown', items: [
                //{ label: 'Net Carbs', value: ((currentValues.netCarbs)).toFixed(0), unit: 'g', goalTotal: goals.netCarbs},
                { label: 'Sugar', value: ((currentValues.sugar)).toFixed(0), unit: 'g', goalTotal: goals.sugar},
                { label: 'Fiber', value: ((currentValues.fiber)).toFixed(0), unit: 'g', goalTotal: goals.fiber},
            ]},
            { title: 'Cholesterol', items: [
                { label: 'Cholesterol', value: ((currentValues.cholesterol) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.cholesterol},
            ]},
            { title: 'Essential Minerals', items: [
                { label: 'Sodium', value: ((currentValues.sodium) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.sodium},
                { label: 'Calcium', value: ((currentValues.calcium) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.calcium},
                { label: 'Magnesium', value: ((currentValues.magnesium) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.magnesium},
                { label: 'Phosphorus', value: ((currentValues.phosphorus) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.phosphorus},
                { label: 'Potassium', value: ((currentValues.potassium) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.potassium},
            ]},
            { title: 'Trace Minerals', items: [
                { label: 'Iron', value: ((currentValues.iron) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.iron},
                { label: 'Copper', value: ((currentValues.copper) * 1000000).toFixed(0), unit: 'mcg', goalTotal: goals.copper},
                { label: 'Zinc', value: ((currentValues.zinc) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.zinc},
                { label: 'Manganese', value: ((currentValues.manganese) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.manganese},
                { label: 'Selenium', value: ((currentValues.selenium) * 1000000).toFixed(0), unit: 'mcg', goalTotal: goals.selenium},
            ]},
            { title: 'Fat Soluble Vitamins', items: [
                { label: 'Vitamin A', value: ((currentValues.vitaminA) * 1000000).toFixed(0), unit: 'mcg', goalTotal: goals.vitaminA},
                { label: 'Vitamin D', value: ((currentValues.vitaminD) * 1000000).toFixed(0), unit: 'mcg', goalTotal: goals.vitaminD},
                { label: 'Vitamin E', value: ((currentValues.vitaminE) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.vitaminE},
                { label: 'Vitamin K', value: ((currentValues.vitaminK) * 1000000).toFixed(0), unit: 'mcg', goalTotal: goals.vitaminK},
            ]},
            { title: 'Water Soluble Vitamins', items: [
                { label: 'Vitamin C', value: ((currentValues.vitaminC) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.vitaminC},
                { label: 'Vitamin B1', value: ((currentValues.vitaminB1) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.vitaminB1},
                { label: 'Vitamin B12', value: ((currentValues.vitaminB12) * 1000000).toFixed(0), unit: 'mcg', goalTotal: goals.vitaminB12},
                { label: 'Vitamin B2', value: ((currentValues.vitaminB2) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.vitaminB2},
                { label: 'Vitamin B3', value: ((currentValues.vitaminB3) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.vitaminB3},
                { label: 'Vitamin B5', value: ((currentValues.vitaminB5) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.vitaminB5},
                { label: 'Vitamin B6', value: ((currentValues.vitaminB6) * 1000).toFixed(0), unit: 'mg', goalTotal: goals.vitaminB6},
                { label: 'Folate', value: ((currentValues.folate) * 1000000).toFixed(0), unit: 'mcg', goalTotal: goals.folate},
            ]},
        ];
    };

    return (
        <Modal animationType="slide" visible={isVisible}>
            <View style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={[styles.header, { backgroundColor: colors.boxes }]}>
                    <TouchableOpacity 
                        onPress={onClose} 
                        style={styles.closeButton}
                    >
                        <Text style={[styles.buttonText, { color: colors.accent }]} numberOfLines={1}>Close</Text>
                        <AntDesign name="down" size={24} color={colors.accent} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={createNutrientData()} 
                    renderItem={({ item }) => (
                        <View style={[styles.nutrientSection, { backgroundColor: colors.boxes }]}>
                            <Text style={[styles.sectionTitle, { color: colors.accent }]} numberOfLines={1}>{item.title}</Text>
                            {item.items.map((nutrient, index) => (
                                <MicroNutrientDisplayElement 
                                    key={index} 
                                    values={{
                                        name: nutrient.label, 
                                        current: nutrient.value, 
                                        unit: nutrient.unit, 
                                        total: nutrient.goalTotal, 
                                        color: 'grey'
                                    }} 
                                />
                            ))}
                        </View>
                    )}
                    contentContainerStyle={styles.list}
                    keyExtractor={(_, index) => index.toString()}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        paddingTop: 60,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingTop: 66,
        zIndex: 1,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    nutrientSection: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    list: {
        padding: 8,
        paddingTop: 80,
    },
});
