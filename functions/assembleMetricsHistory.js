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

const getMetricsForDay = async (db, date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date provided to getMetricsForDay:', date);
        return null;
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    try {
        const dateString = startOfDay.toDateString();
        console.log('Searching for date:', dateString);
        
        // Modified query to properly sum up all items for the day
        const foodDB = await db.getAllAsync(
            `SELECT 
                SUM(CAST((cal * qty / CASE WHEN baseQty = 0 OR baseQty IS NULL THEN 100 ELSE baseQty END) AS FLOAT)) as totalCal,
                SUM(CAST((protein * qty / CASE WHEN baseQty = 0 OR baseQty IS NULL THEN 100 ELSE baseQty END) AS FLOAT)) as totalProtein,
                SUM(CAST((carb * qty / CASE WHEN baseQty = 0 OR baseQty IS NULL THEN 100 ELSE baseQty END) AS FLOAT)) as totalCarb,
                SUM(CAST((fat * qty / CASE WHEN baseQty = 0 OR baseQty IS NULL THEN 100 ELSE baseQty END) AS FLOAT)) as totalFat
            FROM foodhistory 
            WHERE day = ?`,
            [dateString]
        );

        if (!Array.isArray(foodDB) || !foodDB[0]) {
            console.warn('Invalid foodDB result:', foodDB);
            return await createEmptyMetrics(startOfDay);
        }

        console.log('Day totals:', foodDB[0]); // Debug log

        const totals = {
            calories: Math.round(Number(foodDB[0].totalCal) || 0),
            protein: Math.round(Number(foodDB[0].totalProtein) || 0),
            carbs: Math.round(Number(foodDB[0].totalCarb) || 0),
            fat: Math.round(Number(foodDB[0].totalFat) || 0)
        };

        const emptyMetrics = await createEmptyMetrics(startOfDay);
        
        return {
            date: startOfDay,
            actual: totals,
            goals: emptyMetrics.goals
        };
    } catch (error) {
        console.error('Error in getMetricsForDay:', error);
        return await createEmptyMetrics(startOfDay);
    }
};

export const assembleMetricsHistory = async (userId, db) => {
    try {
        if (!userId || !db) {
            console.error('Missing required parameters:', { userId: !!userId, db: !!db });
            return [];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Ensure we have data for the past 7 days minimum
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // -6 because today counts as 1

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Get yesterday and today's metrics first
        const [yesterdayMetrics, todayMetrics] = await Promise.all([
            getMetricsForDay(db, yesterday),
            getMetricsForDay(db, today)
        ]);

        let historicalMetrics = [];
        try {
            const metricsRef = collection(FIREBASE_DB, "users", userId, "metrics");
            const querySnapshot = await getDocs(
                query(metricsRef, where('date', '<', Timestamp.fromDate(yesterday)))
            );
            
            historicalMetrics = querySnapshot.docs
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
                .filter(Boolean);
        } catch (e) {
            console.warn('Error fetching historical metrics:', e);
        }

        // Combine all metrics with recent ones taking precedence
        const allMetrics = [
            ...historicalMetrics,
            yesterdayMetrics,
            todayMetrics
        ].filter(metric => 
            metric && 
            metric.date instanceof Date && 
            !isNaN(metric.date.getTime())
        ).sort((a, b) => a.date - b.date);

        // Fill gaps and ensure minimum 7 days
        if (allMetrics.length > 0) {
            const filledMetrics = [];
            // Use either the earliest date from data or 7 days ago, whichever is earlier
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
