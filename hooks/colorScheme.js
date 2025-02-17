import { Colors } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

let currentColorScheme = 'light'; // Default theme
let isInitialized = false;
let subscribers = new Set();

const THEME_STORAGE_KEY = '@app_theme';

function notifySubscribers() {
    subscribers.forEach(callback => callback(Colors[currentColorScheme]));
}

// Initialize theme and return initial value synchronously
export function useAppTheme() {
    if (!isInitialized) {
        // Load theme asynchronously if not already initialized
        AsyncStorage.getItem(THEME_STORAGE_KEY)
            .then(savedTheme => {
                if (savedTheme && savedTheme !== currentColorScheme) {
                    currentColorScheme = savedTheme;
                    notifySubscribers();
                }
                isInitialized = true;
            })
            .catch(error => {
                console.error('Error loading theme:', error);
                isInitialized = true;
            });
    }
    return Colors[currentColorScheme];
}

export async function updateApp(newScheme) {
    if (newScheme === currentColorScheme) return;
    
    currentColorScheme = newScheme;
    try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newScheme);
        notifySubscribers();
    } catch (error) {
        console.error('Error saving theme:', error);
    }
}

export function getCurrentScheme() {
    return currentColorScheme;
}

export function subscribeToTheme(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}
