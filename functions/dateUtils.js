import AsyncStorage from '@react-native-async-storage/async-storage';

const loadGoals = async () => {
    try {
        const goalsStr = await AsyncStorage.getItem('userGoals');
        if (goalsStr) {
            const parsedGoals = JSON.parse(goalsStr);
            //console.log("Goals loaded - Protein:", parsedGoals.protein, "Calories:", parsedGoals.dailyCalories);
            return parsedGoals;
        }
        console.log("No goals found, using defaults");
        return { dailyCalories: 2100, protein: 150 }; // reasonable defaults 
    } catch (error) {
        console.error("Error loading goals:", error);
        return { dailyCalories: 2100, protein: 150 };
    }
};
const date = new Date();

const yesterday = new Date();
yesterday.setDate(date.getDate() - 1);
const twoDaysAgo = new Date();
twoDaysAgo.setDate(date.getDate() - 2);

const becomeNextDay = async (db) => {
    try {
        console.log("Becoming next day...");
        const foodData = await db.getAllAsync("SELECT * FROM foodhistory WHERE day = ?", [twoDaysAgo.toDateString()]);
        //console.log("Two Days Ago:", foodData);

        if (!foodData || foodData.length === 0) {
            console.log("No food data found");
            await db.runAsync(
                "INSERT INTO metrics (date, calories, protein, caloriesgoal, proteingoal) Values (?, ?, ?, ?, ?);", 
                [
                    twoDaysAgo.toDateString(),
                    0,
                    0,
                    0,
                    goals.protein
                ]
            );
            return;
        }

        const goals = await loadGoals();

        let totalCalories = 0;
        let totalProtein = 0;

        foodData
        .filter(item => item.day === 0)
        .forEach(item => {
          const multiplier = item.qty / (item.baseQty || 100);
          totalCalories += Number(item.cal) * multiplier || 0;
          totalProtein += Number(item.protein) * multiplier || 0;
        });

        console.log(`DATA FOUND! - Calories: ${totalCalories}/${goals.dailyCalories}, Protein: ${totalProtein}/${goals.protein}`);
        
        await db.runAsync(
            "INSERT INTO metrics (date, calories, protein, caloriesgoal, proteingoal) Values (?, ?, ?, ?, ?);", 
            [
                date.toDateString(),
                Math.round(totalCalories),
                Math.round(totalProtein),
                goals.dailyCalories,
                goals.protein
            ]
        );
    } catch (error) {
        console.error("Error becoming next day: ", error);
    }

    try {
        //console.log("Deleted old items items from foodhistory"); // ADD THIS
    } catch (error) {console.log(error)}
};

export default becomeNextDay;