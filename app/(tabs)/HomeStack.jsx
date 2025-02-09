import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import FoodPage from '../FoodPage';
import QuickAdd from '../QuickAdd';
import Scan from '../Scan';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
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
        options={{ headerShown: true }}
      />
      <Stack.Screen 
        name="Scan" 
        component={Scan}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}
