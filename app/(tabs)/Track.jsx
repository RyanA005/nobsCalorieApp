import { View, StyleSheet, FlatList, TextInput, Text } from 'react-native'
import React, { useEffect, useCallback } from 'react'
import FoodItem from '@/components/FoodItem'

import { useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';

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
  <View style={[styles.container, {marginTop: 50}]}>
    <TextInput 
      value={search} 
      onChangeText={setSearch}
      onSubmitEditing={() => performSearch(search)}
      returnKeyType="search"
      placeholder="Search for Foods" 
      style={[styles.input, {backgroundColor: colors.boxes, color: colors.text}]} 
    />

    <View style={styles.buttonContainer}> 
      <AntDesign.Button 
        style={styles.button}
        name="search1" 
        onPress={() => performSearch(search)}
        backgroundColor={colors.boxes}
        color={colors.accent}>
        Search
      </AntDesign.Button>

      <AntDesign.Button 
        style={styles.button}
        name="scan1" 
        onPress={() => navigation.navigate('Scan')}
        backgroundColor={colors.boxes}
        color={colors.accent}>
        Scan
      </AntDesign.Button>
      
      <AntDesign.Button 
        style={styles.button}
        name="addfile" 
        onPress={() => navigation.navigate('QuickAdd')}
        backgroundColor={colors.boxes}
        color={colors.accent}>
        Quick Add
      </AntDesign.Button>
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
    padding: 10,
    gap: 10,
  },
  input: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',},
  button: {
    justifyContent: 'center',
    minWidth: '100',
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-evenly'
  },
  noResults: {
    fontSize: 16,
    marginTop: 50,
    textAlign: 'center',
  },
})