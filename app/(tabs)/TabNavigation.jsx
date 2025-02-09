import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AntDesign } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/colorScheme';
import { useRef } from 'react';

import Home from './Home';
import Track from './Track';
import Metrics from './Metrics';
import Settings from './Settings';

import FoodPage from '../FoodPage';
import QuickAdd from '../QuickAdd';
import Scan from '../Scan';

import Goals from '../Goals';
import DetailsModal from '../DetailsModal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabScreens({ navigation }) {
  const colors = useAppTheme();
  const rootNavigation = useRef(navigation);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.boxes }
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
  const colors = useAppTheme();
  
  return (
    <Stack.Navigator screenOptions={{ 
      headerTintColor: colors.accent,
      headerTitleStyle: { color: colors.accent }
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
    </Stack.Navigator>
  );
}
