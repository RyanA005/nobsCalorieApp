import { collection, getDocs, query } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

// Set up listener for food history changes
DeviceEventEmitter.addListener('foodHistoryChanged', async () => {
    try {
        await AsyncStorage.removeItem('cachedMetrics');
        console.log('Metrics cache cleared due to food history change');
    } catch (error) {
        console.warn('Failed to clear metrics cache:', error);
    }
});

const createEmptyMetrics = async (date) => {
    const savedGoals = await AsyncStorage.getItem('userGoals');
    const goals = savedGoals ? JSON.parse(savedGoals) : {};
    return {
        date,
        actual: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        goals: {
            calories: parseInt(goals.dailyCalories) || 0,
            protein: parseInt(goals.protein) || 0,
            carbs: parseInt(goals.carbs) || 0,
            fat: parseInt(goals.fats) || 0
        }
    };
};

export const assembleMetricsHistory = async (userId) => {
    try {
        // Try to get cached data first
        try {
            const cachedData = await AsyncStorage.getItem('cachedMetrics');
            if (cachedData) {
                const parsedCache = JSON.parse(cachedData);
                if (Array.isArray(parsedCache) && parsedCache.length > 0) {
                    const hydratedCache = parsedCache.map(metric => ({
                        ...metric,
                        date: new Date(metric.date)
                    }));
                    console.log("Retrieved cached metrics");
                    return hydratedCache;
                }
            }
        } catch (cacheError) {
            console.warn("Cache retrieval failed:", cacheError);
            // Clear corrupted cache
            await AsyncStorage.removeItem('cachedMetrics');
        }

        if (!userId) {
            console.error('Missing userId parameter');
            return [];
        }

        console.log("Fetching metrics from firebase");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        let allMetrics = [];
        try {
            const metricsRef = collection(FIREBASE_DB, "users", userId, "metrics");
            const q = query(metricsRef);
            const querySnapshot = await getDocs(q);

            allMetrics = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    date: new Date(doc.id),
                    actual: {
                        calories: Number(data.actual?.calories) || 0,
                        protein: Number(data.actual?.protein) || 0,
                        carbs: Number(data.actual?.carbs) || 0,
                        fat: Number(data.actual?.fat) || 0
                    },
                    goals: {
                        calories: Number(data.goals?.calories) || 0,
                        protein: Number(data.goals?.protein) || 0,
                        carbs: Number(data.goals?.carbs) || 0,
                        fat: Number(data.goals?.fat) || 0
                    }
                };
            });

        } catch (e) {
            console.warn('Error fetching metrics:', e);
        }

        // Fill gaps and ensure minimum 7 days
        if (allMetrics.length > 0) {
            const filledMetrics = [];
            const startDate = new Date(Math.min(
                sevenDaysAgo.getTime(),
                allMetrics[0].date.getTime()
            ));
            const endDate = today;

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const currentDate = new Date(d);
                const existingMetric = allMetrics.find(m => {
                    if (!m || !m.date) return false;
                    return m.date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0];
                });
                
                filledMetrics.push(
                    existingMetric || 
                    await createEmptyMetrics(new Date(currentDate))
                );
            }
            console.log("Retrieved metrics from firebase");
            //console.log(filledMetrics);

            try {
                // Ensure the data is serializable before caching
                const metricsToCache = filledMetrics.map(metric => ({
                    ...metric,
                    date: metric.date.toISOString() // Convert Date to ISO string for reliable serialization
                }));
                await AsyncStorage.setItem('cachedMetrics', JSON.stringify(metricsToCache));
            } catch (cacheError) {
                console.warn("Failed to cache metrics:", cacheError);
            }
            return filledMetrics;
        }

        // If no data exists, return 7 days of empty metrics
        const emptyWeek = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            emptyWeek.unshift(await createEmptyMetrics(date));
        }
        return emptyWeek;
    } catch (error) {
        console.error("Error assembling metrics history:", error);
        return [];
    }
};
