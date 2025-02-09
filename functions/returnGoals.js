import AsyncStorage from "@react-native-async-storage/async-storage";

export const getGoalsforDay = async () => {
    const savedGoals = await AsyncStorage.getItem("userGoals");
    const goals = savedGoals ? JSON.parse(savedGoals) : {};

    return {
        calories: parseInt(goals.dailyCalories) || 0,
        protein: parseInt(goals.protein) || 0,
        carbs: parseInt(goals.carbs) || 0,
        fat: parseInt(goals.fats) || 0,
    };
}