import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import FoodPage from '../FoodPage';
import QuickAdd from '../QuickAdd';
import Scan from '../Scan';

import { useAppTheme } from '../../hooks/colorScheme';

const Stack = createNativeStackNavigator();

export default function HomeStack() {

  const colors = useAppTheme();

  return (
    <Stack.Navigator>

      <Stack.Screen 
        name="Home" 
        component={Home}
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
        options={{ headerShown: true, headerBackTitle: 'Back'}}
      />
      <Stack.Screen 
        name="Scan" 
        component={Scan}
        options={{ headerShown: true, headerBackTitle: 'Back'}}
        
      />
    </Stack.Navigator>
  );
}
