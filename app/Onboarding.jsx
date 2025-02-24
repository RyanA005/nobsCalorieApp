import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';

import { useAppTheme } from '../hooks/colorScheme';
import FeaturesSlideshow from '../components/FeaturesSlideshow'

import React from 'react'

const Onboarding = () => {

  const [colors, setColors] = useState(useAppTheme());
  
  return (
    <View style={[styles.container, {backgroundColor: colors.backgroundColor}]}>

      <FeaturesSlideshow/>

      <View style={[styles.intro, {}]}>
      <Text style={[styles.subtitle, {color:colors.text}]}>You're too intelligent for all the BS</Text>

      <TouchableOpacity
      style={styles.getStartedBtn}
      >
      <Text style={[styles.actionText, {color:colors.accent}]}>Get Started</Text>
      <AntDesign 
                  name="right"
                  size={24}
                  color={colors.accent}
                />
      </TouchableOpacity>
      </View> 
    </View>
  )
}

export default Onboarding

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 'auto',
    justifyContent: 'center'
  },
  intro: {
    gap: 10,
  },
  getStartedBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'semibold'
  }
})