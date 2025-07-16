// Метрики для Axylon

/**
 * Максимальная просадка (от любого локального пика до дна после него, абсолютное значение)
 */
export function calcDrawdown(series: number[]): number {
  if (!series || series.length === 0) return 0;
  let maxDrawdown = 0;
  let peak = series[0];
  for (let i = 0; i < series.length; i++) {
    if (series[i] > peak) {
      peak = series[i];
    }
    let minAfterPeak = series[i];
    for (let j = i + 1; j < series.length; j++) {
      if (series[j] < minAfterPeak) {
        minAfterPeak = series[j];
      }
      const drawdown = minAfterPeak - peak;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
    }
  }
  return maxDrawdown;
} 