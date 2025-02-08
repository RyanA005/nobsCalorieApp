import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

export function useAppTheme() {
    const colorScheme = useColorScheme();
    return Colors[colorScheme ?? 'dark'];
}
