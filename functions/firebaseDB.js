import { doc, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore"; 
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

export const storeInBulk = async (userId, content) => {
    if (!userId || !content) {
      console.error('Missing required parameters for storeInBulk');
      throw new Error('Missing required parameters for storeInBulk');
    }
  
    const uid = userId.uid;
  
    // Determine current quarter (Q1, Q2, Q3, or Q4)
    const today = new Date();
    const year = today.getFullYear();
    const quarter = `Q${Math.ceil((today.getMonth() + 1) / 3)}-${year}`; // e.g., "Q1-2025"
  
    // Create a document reference in the quarterlySummaries collection
    const quarterRef = doc(FIREBASE_DB, "quarterlySummaries", `${uid}_${quarter}`);
  
    try {
      // Fetch existing quarter document
      const quarterDoc = await getDoc(quarterRef);
      let existingData = quarterDoc.exists() ? quarterDoc.data().data : {};
  
      // Merge new entries into existing data
      content.forEach(entry => {
        existingData[entry.day] = {
          goal: entry.goal,
          actual: entry.actual
        };
      });
  
      // Write back to Firestore in the quarterlySummaries collection
      if (quarterDoc.exists()) {
        await updateDoc(quarterRef, { data: existingData });
      } else {
        await setDoc(quarterRef, { userId: uid, quarter, data: existingData });
      }
      console.log("Quarterly data updated successfully in quarterlySummaries collection.");
  
      // Now, also store the quarterly summary in the user's metrics collection for easy retrieval.
      // Here the doc ID is set to the quarter string (e.g., "Q1-2025").
      const userMetricsQuarterRef = doc(FIREBASE_DB, "users", uid, "metrics", quarter);
      await setDoc(
        userMetricsQuarterRef, 
        { userId: uid, quarter, data: existingData }, 
        { merge: true }
      );
      console.log("Quarterly data stored in user's metrics collection successfully.");
  
    } catch (error) {
      console.error("Error updating quarterly data:", error);
    }
  };
  
// checks current date and updates firebase with metrics if needed
// checkDayAndUpdate(FIREBASE_AUTH.currentUser, db, date);
export const checkDayAndUpdate = async (userId, db, date) => {
    if (!userId || !db || !date) {
        console.error('Missing required parameters for checkDayAndUpdate');
        throw new Error('Missing required parameters for checkDayAndUpdate');
    }
    else {
        let twoDaysAgo = date;
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        twoDaysAgo.setHours(0, 0, 0, 0); // two days ago from passed in date(today)

        console.log('Two days ago:', twoDaysAgo);

        const result = await db.getAllAsync("SELECT day FROM foodhistory ORDER BY day DESC LIMIT 1;");
        if (!result.length) {
            console.warn("No food history found, skipping update.");
            return;
        }
        let mostRecentDayLogged = new Date(result[0].day);

        console.log('Most recent day logged:', mostRecentDayLogged);

        if (mostRecentDayLogged > twoDaysAgo) {
            console.log('no need to update');
        }
        else { // ex) mostRecentDayLogged = feb 9, twoDaysAgo = feb 10
            console.log('update needed');
            // calculate time skip
            let Difference_In_Time = mostRecentDayLogged.getTime() - twoDaysAgo.getTime();
            let Difference_In_Days = Math.abs(Math.round(Difference_In_Time / (1000 * 3600 * 24)));
            console.log("Total number of days between dates:" + twoDaysAgo.toDateString() + " and " + mostRecentDayLogged.toDateString() + " is: " + Difference_In_Days + " days");

            // push days onto firebase
            let docInsert = [];
            const totalDays = Difference_In_Days + 1; // since we're including both endpoints
            
            for (let i = 0; i < totalDays; i++) {
              let day = new Date(twoDaysAgo);
              day.setDate(day.getDate() + i);
            
              const newEntry = {
                day: day.toISOString().split('T')[0],
                goal: await getGoalsforDay(),
                actual: await getMetricsForDay(db, day)
              };
            
              docInsert.push(newEntry);
            
              console.log('docInsert:', docInsert[i]);
            }
            
            if (docInsert.length > 0) {
                await storeInBulk(userId, docInsert);
            } else {
                console.warn("No new data to insert.");
            }
        }
    }
}