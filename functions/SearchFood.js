const API_URL = 'https://ralport.pythonanywhere.com';
//https://www.pythonanywhere.com/user/ralport/files/home/ralport/mysite/flask_app.py?edit

export const SearchFood = async (searchKey) => {
  if (!searchKey.trim()) {
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/?input=${searchKey.trim()}`);
    const result = await response.json();
    
    if (Array.isArray(result)) {
      return result.map(item => ({
        name: item[0],
        cat: item[1],
        cal: item[2],
      }));
    }
    return [];
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export default SearchFood;