export const calculateAwards = (metrics) => {
  if (!metrics.length) return { streak: 0, totalDays: 0, perfectDays: 0, averageAccuracy: 0 };

  // Filter out empty days before calculations
  const daysWithData = metrics.filter(metric => 
    metric.actual.calories > 0 || metric.actual.protein > 0
  );

  const sortedMetrics = [...daysWithData].sort((a, b) => new Date(b.date) - new Date(a.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreak = 0;
  let previousDate = null;

  // Calculate current streak starting from most recent day
  for (const metric of sortedMetrics) {
    const currentDate = new Date(metric.date);
    currentDate.setHours(0, 0, 0, 0);

    // Skip empty days
    if (metric.actual.calories === 0 && metric.actual.protein === 0) {
      break;
    }

    // For first entry
    if (!previousDate) {
      // If first entry is not today or yesterday or two days ago, break
      const daysDiff = Math.floor((today - currentDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 2) break;
      currentStreak = 1;
      previousDate = currentDate;
      continue;
    }

    // Check if dates are consecutive
    const daysDiff = Math.floor((previousDate - currentDate) / (1000 * 60 * 60 * 24));
    if (daysDiff !== 1) break;

    currentStreak++;
    previousDate = currentDate;
  }

  // Rest of award calculations
  let stats = {
    perfectDays: 0,
    accuracySum: 0,
    validDays: 0
  };

  // Calculate perfect days and accuracy
  sortedMetrics.forEach(metric => {
    stats.validDays++;

    // Perfect days calculation (within 10% of goals)
    const calorieAccuracy = metric.actual.calories / metric.goals.calories;
    const proteinAccuracy = metric.actual.protein / metric.goals.protein;
    
    if (calorieAccuracy >= 0.9 && calorieAccuracy <= 1.1 &&
        proteinAccuracy >= 0.9 && proteinAccuracy <= 1.1) {
      stats.perfectDays++;
    }

    // Accuracy calculation
    const dayProteinAccuracy = Math.min(metric.actual.protein / metric.goals.protein, 1) * 100;
    const dayCalorieAccuracy = Math.min(metric.actual.calories / metric.goals.calories, 1) * 100;
    stats.accuracySum += (dayProteinAccuracy + dayCalorieAccuracy) / 2;
  });

  return {
    streak: currentStreak,
    totalDays: daysWithData.length, // Only count days with actual data
    perfectDays: stats.perfectDays,
    averageAccuracy: stats.validDays > 0 ? Math.round(stats.accuracySum / stats.validDays) : 0
  };
};
