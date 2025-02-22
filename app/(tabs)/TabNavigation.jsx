import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AntDesign } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react';
import { useAppTheme, subscribeToTheme } from '../../hooks/colorScheme';

import Home from './Home';
import Track from './Track';
import Metrics from './Metrics';
import Settings from './Settings';

import FoodPage from '../FoodPage';
import QuickAdd from '../QuickAdd';
import Scan from '../Scan';

import Goals from '../Goals';
import DetailsModal from '../DetailsModal';

import Payments from '../Payments';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabScreens({ navigation }) {
  const [colors, setColors] = useState(useAppTheme());
  const rootNavigation = useRef(navigation);

  useEffect(() => {
    const unsubscribe = subscribeToTheme(newColors => {
      setColors(newColors);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.boxes, borderTopWidth: 0 },
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Track"
        component={Track}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="form" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Metrics"
        component={Metrics}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="areachart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="setting" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function TabNavigation() {
  const [colors, setColors] = useState(useAppTheme());
  
  useEffect(() => {
    const unsubscribe = subscribeToTheme(newColors => {
      setColors(newColors);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ 
      headerTintColor: colors.accent,
      headerTitleStyle: { color: colors.accent },
      headerStyle: { backgroundColor: colors.boxes }
    }}>
      <Stack.Screen 
        name="TabScreens" 
        component={TabScreens} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FoodPage" 
        component={FoodPage}
        options={{ headerShown: true }}
      />
      <Stack.Screen 
        name="QuickAdd" 
        component={QuickAdd}
        options={{ headerShown: true, headerBackTitle: 'Back' }}
      />
      <Stack.Screen 
        name="Scan" 
        component={Scan}
        options={{ headerShown: true, headerBackTitle: 'Back' }}
      />
      <Stack.Screen 
        name="Goals" 
        component={Goals}
        options={{ headerShown: true, title: 'Goals' , headerBackTitle: 'Home' }}
      />
      <Stack.Screen 
        name="Payments" 
        component={Payments}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
