import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig';
import { getGoalsforDay } from './returnGoals';
import { getMetricsForDay } from './returnMetrics';
import { addDoc } from 'firebase/firestore';

export const storeTodaysMetrics = async (userId, metrics) => {
    if (!userId) {
        throw new Error('Missing required parameter: userId');
    }

    const uid = userId.uid;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const docContent = {
        actual: metrics,
        date: today,
        lastUpdated: new Date()
    }

    // Create document reference with date as ID
    const metricsDocRef = doc(FIREBASE_DB, "users", uid, "metrics", today);
    await setDoc(metricsDocRef, docContent, { merge: true });
    
    console.log('Today\'s metrics stored successfully:', docContent);
};

// Original storeMetrics function for historical data
export const storeMetrics = async (userId, db, date) => {
    try {
        if (!userId || !db || !date) {
            throw new Error('Missing required parameters: userId, db, and date are required');
        }

        const goals = await getGoalsforDay();
        const metrics = await getMetricsForDay(db, date);

        const uid = userId.uid;
        const formattedDate = new Date(date).toISOString().split('T')[0];

        const docContent = {
            goals: goals,
            actual: metrics,
        }

        // Create document reference with date as ID
        const metricsDocRef = doc(FIREBASE_DB, "users", uid, "metrics", formattedDate);
        await setDoc(metricsDocRef, docContent, { merge: true });
        
        console.log('Historical metrics stored successfully:', docContent);

    } catch (error) {
        console.error('Error storing metrics:', error);
        throw error;
    }
};
