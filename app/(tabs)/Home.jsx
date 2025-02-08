import { View, Text, StyleSheet} from 'react-native'
import React from 'react'
import { useAppTheme } from '../../hooks/colorScheme';
const Home = () => {
  const colors = useAppTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={{color: colors.text}}>Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home