import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useAppTheme } from '../hooks/colorScheme'

const Scan = () => {
  const colors = useAppTheme();
  
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={{color: colors.text}}>Scan Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default Scan
