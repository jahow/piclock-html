import { getMatrix } from '../../matrix.js';

/**
 * @param {number} topX
 * @param {number} topY
 * @param {number} size
 * @param {DotValue} dotValue
 */
export function renderCircle(topX, topY, size, dotValue) {
  const matrix = getMatrix();
  const radius = size / 2 - 0.5;
  const radiusLowerSq = (radius - 0.1) * (radius - 0.1);
  const radiusHigherSq = (radius + 0.5) * (radius + 0.5);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const distSq = Math.pow(i - radius, 2) + Math.pow(j - radius, 2);
      if (distSq > radiusLowerSq && distSq < radiusHigherSq) {
        matrix.setDotValue(topX + i, topY + j, dotValue);
      }
    }
  }
}
