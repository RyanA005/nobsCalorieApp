export const calculateAwards = (metrics) => {
  if (!metrics.length) return { streak: 0, totalDays: 0, perfectDays: 0, averageAccuracy: 0 };

  const sortedMetrics = [...metrics].sort((a, b) => new Date(b.date) - new Date(a.date));
  const today = new Date();
  const twoDaysAgo = new Date(today.setDate(today.getDate() - 2));

  let currentStreak = 0;
  let expectedDate = new Date(twoDaysAgo);
  let stats = {
    perfectDays: 0,
    accuracySum: 0
  };

  // Calculate current streak
  for (let i = 0; i < sortedMetrics.length; i++) {
    const metric = sortedMetrics[i];
    const currentDate = new Date(metric.date);
    
    if (i === 0 && currentDate.toDateString() !== twoDaysAgo.toDateString()) {
      break; // Break if first entry isn't from two days ago
    }

    if (currentDate.toDateString() === expectedDate.toDateString() &&
        (metric.protein > 0 || metric.calories > 0)) {
      currentStreak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break; // Break the streak if there's a gap
    }
  }

  // Rest of the calculations
  sortedMetrics.forEach(metric => {
    // Perfect days calculation
    if (Math.abs(metric.calories - metric.caloriesgoal) <= 100 &&
        Math.abs(metric.protein - metric.proteingoal) <= 25) {
      stats.perfectDays++;
    }

    // Accuracy calculation
    const proteinAccuracy = Math.min(metric.protein / metric.proteingoal, 1) * 100;
    const calorieAccuracy = Math.min(metric.calories / metric.caloriesgoal, 1) * 100;
    stats.accuracySum += (proteinAccuracy + calorieAccuracy) / 2;
  });

  return {
    streak: currentStreak,
    totalDays: metrics.length,
    perfectDays: stats.perfectDays,
    averageAccuracy: Math.round(stats.accuracySum / metrics.length)
  };
};
