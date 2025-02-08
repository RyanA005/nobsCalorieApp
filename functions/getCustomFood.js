const getCustomFoodData = async (database, name) => {
    try {
        const customFood = await database.getAllAsync('SELECT * FROM customfoods WHERE name = ?', [name]);
        if (customFood && customFood.length > 0) {
            return customFood[0];
        }
        return null;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
};

export default getCustomFoodData