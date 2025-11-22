import { getValue } from './utils/misc';

const STROKE = 1;
const FILL = 0.3;

/**
 * @param {VariableNumber} minX
 * @param {VariableNumber} maxX
 * @param {VariableNumber} minY
 * @param {VariableNumber} maxY
 * @return {Widget}
 */
export function graphWidget(minX, maxX, minY, maxY) {
  const alpha = Math.random();
  const beta = Math.random();

  return {
    render(x, y) {
      const maxYValue = getValue(maxY);
      const minYValue = getValue(minY);
      const height = maxYValue - minYValue;

      if (
        x < getValue(minX) ||
        x > getValue(maxX) ||
        y < minYValue ||
        y > maxYValue
      ) {
        return 0;
      }
      const value = height * 0.5 * (1 + Math.sin(x * alpha));
      if (maxYValue - y > value) {
        return 0;
      }
      return maxYValue - y < value - 1 ? FILL : STROKE;
    },
    update() {},
    extent() {
      return {
        minX: getValue(minX),
        minY: getValue(minY),
        maxX: getValue(maxX),
        maxY: getValue(maxY),
      };
    },
  };
}
