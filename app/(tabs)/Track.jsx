import { View, StyleSheet, FlatList, TextInput, Text } from 'react-native'
import React from 'react'
import FoodItem from '@/components/FoodItem'

import { useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

import { useSQLiteContext } from 'expo-sqlite';

import { SearchFood } from '../../functions/SearchFood'
import { useAppTheme } from '../../hooks/colorScheme';

export default function Track({ navigation }) {
  const colors = useAppTheme();

  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [search, setSearch] = useState('');

  const searchCustomFoods = async (searchTerm) => {
    try {
      const results = await database.getAllAsync("SELECT * FROM customfoods");
      const matchingResults = results.filter(item => 
        item.name.toLowerCase().trim().includes(searchTerm.toLowerCase().trim())
      );
      return matchingResults;
    } catch (error) {
      console.error("Error searching custom foods:", error);
      return [];
    }
  };

  // Unified search function
  const performSearch = async (searchTerm) => {
    // Don't search empty strings
    if (!searchTerm?.trim()) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }

    const apiResults = await SearchFood(searchTerm);
    const customResults = await searchCustomFoods(searchTerm);
    
    const modifiedCustomResults = customResults.map(item => ({
      ...item,
      id: `custom_${item.id}`
    }));
    
    const combinedResults = [...modifiedCustomResults, ...apiResults];
    setSearchResults(combinedResults);
    setNoResults(combinedResults.length === 0);
  };

  const ItemSeparator = () => (
    <View style={{ height: 5 }} />
  );

  const getItemLayout = (data, index) => ({
    length: 80, // Approximate height of each item
    offset: 80 * index,
    index,
  });

  const database = useSQLiteContext();

return (
  <View style={[styles.container, {backgroundColor: colors.background}]}>
    <View style={[styles.card, {backgroundColor: colors.boxes}]}>
      <TextInput 
        value={search} 
        onChangeText={setSearch}
        onSubmitEditing={() => performSearch(search)}
        returnKeyType="search"
        placeholder="Search for Foods..." 
        placeholderTextColor={colors.text + '80'}
        style={[styles.input, {color: colors.text}]} 
      />
    </View>

    <View style={[styles.buttonContainer, {backgroundColor: colors.background}]}> 
      <View style={[styles.buttonCard, {backgroundColor: colors.boxes}]}>
        <AntDesign.Button 
          style={styles.button}
          name="search1" 
          onPress={() => performSearch(search)}
          backgroundColor="transparent"
          color={colors.accent}>
          Search
        </AntDesign.Button>
      </View>

      <View style={[styles.buttonCard, {backgroundColor: colors.boxes}]}>
        <AntDesign.Button 
          style={styles.button}
          name="scan1" 
          onPress={() => navigation.navigate('Scan')}
          backgroundColor="transparent"
          color={colors.accent}>
          Scan
        </AntDesign.Button>
      </View>
      
      <View style={[styles.buttonCard, {backgroundColor: colors.boxes}]}>
        <AntDesign.Button 
          style={styles.button}
          name="addfile" 
          onPress={() => navigation.navigate('QuickAdd')}
          backgroundColor="transparent"
          color={colors.accent}>
          Quick Add
        </AntDesign.Button>
      </View>
    </View>

    {noResults && (
      <Text style={[styles.noResults, {color: colors.text}]}>
        No results found...
      </Text>
    )}
      <FlatList
        data={searchResults} // Using state-managed results
        keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
        renderItem={({item}) => <FoodItem item={item} />}
        ItemSeparatorComponent={ItemSeparator}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        contentContainerStyle={{paddingHorizontal: 5}}
      />
    </View>)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 65,
  },
  input: {
    padding: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    justifyContent: 'center',
    minWidth: 100,
    height: 50,
    paddingHorizontal: 15,
  },
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  buttonCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  noResults: {
    fontSize: 16,
    marginTop: 50,
    textAlign: 'center',
  },
})