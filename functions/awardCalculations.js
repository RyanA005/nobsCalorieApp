export const calculateAwards = (metrics) => {
  if (!metrics.length) return { streak: 0, totalDays: 0, perfectDays: 0, averageAccuracy: 0 };

  const sortedMetrics = [...metrics].sort((a, b) => new Date(b.date) - new Date(a.date));
  const today = new Date();
  const twoDaysAgo = new Date(today.setDate(today.getDate() - 2));
  const lastDate = new Date(sortedMetrics[0].date);

  let stats = {
    streak: lastDate.toDateString() === twoDaysAgo.toDateString() ? 1 : 0,
    perfectDays: 0,
    accuracySum: 0
  };

  sortedMetrics.forEach((metric, index) => {
    const currentDate = new Date(metric.date);
    const expectedDate = new Date(twoDaysAgo);
    expectedDate.setDate(twoDaysAgo.getDate() - index);

    // Streak calculation
    if (stats.streak > 0 && 
        currentDate.toDateString() === expectedDate.toDateString() &&
        (metric.protein > 0 || metric.calories > 0)) {
      stats.streak++;
    }

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
    streak: stats.streak - 1, // Adjust for initial 1
    totalDays: metrics.length,
    perfectDays: stats.perfectDays,
    averageAccuracy: Math.round(stats.accuracySum / metrics.length)
  };
};
