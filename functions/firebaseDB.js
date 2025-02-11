import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig';
import { getGoalsforDay } from './returnGoals';
import { getMetricsForDay } from './returnMetrics';


// Store metrics for a given day in Firebase
// storeMetrics(FIREBASE_AUTH.currentUser, db, date);
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
        
        //console.log('Historical metrics stored successfully:', docContent);
        //console.log('Metrics stored at:', formattedDate);

    } catch (error) {
        console.error('Error storing metrics:', error);
        throw error;
    }
};
