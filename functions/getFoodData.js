import getCustomFoodData from '../utils/databaseUtils';

const API_URL = 'https://ralport.pythonanywhere.com';

export const getFoodData = async(name, database) => {

  if (!name) {
    throw new Error('Name parameter is required');
  }

  try {
    const encodedName = encodeURIComponent(name);
    const response = await fetch(`${API_URL}/key?singleval=${encodedName}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const item = await response.json();
    //console.log('API Response:', item);
    
    if (Array.isArray(item) && item.length > 0) {
      const foodData = {
        name: item[0],
        cat: item[1],
        cal: item[2],
        protein: item[3],
        carbs: item[4],
        fats: item[5],
        transFat: item[6],
        satFat: item[7],
        polyFat: item[8],
        monoFat: item[9],
        netCarbs: item[10],
        sugar: item[11],
        fiber: item[12],
        cholesterol: item[13],
        sodium: item[14],
        calcium: item[15],
        magnesium: item[16],
        phosphorus: item[17],
        potassium: item[18],
        iron: item[19],
        copper: item[20],
        zinc: item[21],
        manganese: item[22],
        selenium: item[23],
        vitaminA: item[24],
        vitaminD: item[25],
        vitaminE: item[26],
        vitaminK: item[27],
        vitaminC: item[28],
        vitaminB1: item[29],
        vitaminB12: item[30],
        vitaminB2: item[31],
        vitaminB3: item[32],
        vitaminB5: item[33],
        vitaminB6: item[34],
        folate: item[35]
      };
      return foodData;
    }
    throw new Error('No data found');
  } catch (error) {
    console.log('Error retrieving data from API for', name,':', error);
    try {
        const custom = await getCustomFoodData(database, name);
        if (custom) {
            console.log("found", name, "in custom foods: data:", custom);
            return custom;
        }
        throw new Error('No custom food found');
    } catch(error) {
        console.log('couldnt find', name, "in custom foods: error:", error);
        throw error;
    }
  }
}

export default getFoodData;