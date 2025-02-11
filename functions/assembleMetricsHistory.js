import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        if (!userId) {
            console.error('Missing userId parameter');
            return [];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Ensure we have data for the past 7 days minimum
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        let allMetrics = [];
        try {
            const metricsRef = collection(FIREBASE_DB, "users", userId, "metrics");
            const querySnapshot = await getDocs(metricsRef);
            
            allMetrics = querySnapshot.docs
                .map(doc => {
                    try {
                        const data = doc.data();
                        let date = null;
                        
                        if (data.date?.toDate) {
                            date = data.date.toDate();
                        } else if (data.date instanceof Date) {
                            date = data.date;
                        } else if (typeof data.date === 'string') {
                            date = new Date(data.date);
                        } else {
                            date = new Date(doc.id);
                        }

                        if (!date || isNaN(date.getTime())) return null;

                        return {
                            ...data,
                            date,
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
                    } catch (e) {
                        console.warn('Error processing document:', doc.id, e);
                        return null;
                    }
                })
                .filter(Boolean)
                .sort((a, b) => a.date - b.date);

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
            console.log('Filled metrics:', filledMetrics);
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
