import React, { memo, useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useAppTheme } from '../hooks/colorScheme';

const MetricsGraphElement = memo(({ values }) => {
  const colors = useAppTheme();

  const [current, goal, color, barWidth, maxPossible] = values;

  const metrics = useMemo(() => {
    const maxHeight = 180;
    const barHeight = Math.min((goal / maxPossible) * maxHeight, maxHeight);
    const fillRatio = current / goal;
    const rawFillHeight = fillRatio * barHeight;
    const overflow = current > goal;
    const fillHeight = overflow ? barHeight : rawFillHeight;
    const overflowHeight = overflow ? Math.min((rawFillHeight - barHeight), maxHeight - barHeight) : 0;

    return {
      barHeight,
      fillHeight,
      overflowHeight,
      overflow,
    };
  }, [current, goal, maxPossible]);

  return (
    <View style={[styles.graphWrapper, { width: barWidth }]}>
      <View style={[styles.barContainer, {
        width: barWidth,
        height: metrics.barHeight,
        backgroundColor: colors.innerBoxes,
      }]}>
        <View style={[styles.fillBar, {
          width: barWidth,
          height: metrics.fillHeight,
          backgroundColor: color,
        }]}>
          {metrics.overflow && (
            <View style={[styles.overflowBar, {
              backgroundColor: color,
              width: barWidth,
              height: metrics.overflowHeight + 10,
              top: -metrics.overflowHeight,
            }]} />
          )}
        </View>
      </View>
    </View>
  );
});

MetricsGraphElement.displayName = 'MetricsGraphElement';

export default MetricsGraphElement;

const styles = StyleSheet.create({
  graphWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column-reverse',
  },
  barContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
  },
  fillBar: {
    borderRadius: 5,
    justifyContent: 'flex-end',
    opacity: 1,
  },
  overflowBar: {
    zIndex: -1,
    position: 'absolute',
    opacity: 0.25,
    borderRadius: 10,
  }
});
