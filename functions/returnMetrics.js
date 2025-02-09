export const getMetricsForDay = async (db, date) => {
    try {
        if (!db || !date) {
            return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        const formattedDate = date.toDateString();
        //console.log('Fetching metrics for:', formattedDate);

        try {
            const results = await db.getAllAsync(
              "SELECT * FROM foodhistory WHERE day = ?", [formattedDate]
            );
            //console.log('Loaded food data:', results);
            let metrics = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            results.forEach(item => {
                const multiplier = item.qty / (item.baseQty || 100);
                metrics.calories += Number(item.cal) * multiplier || 0;
                metrics.protein += Number(item.protein) * multiplier || 0;
                metrics.carbs += Number(item.carb) * multiplier || 0;
                metrics.fat += Number(item.fat) * multiplier || 0;
            });
            return metrics;
          } catch (error) {
            console.error('Error loading food data:', error);
          }
    } catch (error) {
        console.error('Error fetching metrics:', error);
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
};