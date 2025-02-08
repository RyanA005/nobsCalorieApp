import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/Colors';
import { useAppTheme } from '../../hooks/colorScheme';

export default function Metrics() {
  const colors = useAppTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={{color: colors.text}}>Metrics Screen</Text>
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

