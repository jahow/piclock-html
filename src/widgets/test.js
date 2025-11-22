import { getValue } from './utils/misc';

const TWO_PI = Math.PI * 2;
const PI = Math.PI;
const HALF_PI = Math.PI * 0.5;

/**
 * @param {VariableNumber} centerX
 * @param {VariableNumber} centerY
 * @param {VariableNumber} radius
 * @return {Widget}
 */
export function testWidget(centerX, centerY, radius) {
  return {
    render(x, y) {
      const currentAngle = ((Date.now() / 3000) % 1) * TWO_PI - PI;
      const deltaX = x - getValue(centerX);
      const deltaY = y - getValue(centerY);
      const angle = Math.atan2(-deltaY, deltaX);
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      return dist <= getValue(radius) &&
        (dist === 0 ||
          Math.abs(angle - currentAngle) < HALF_PI ||
          Math.abs(angle - currentAngle + TWO_PI) < HALF_PI ||
          Math.abs(angle - currentAngle - TWO_PI) < HALF_PI)
        ? 1
        : 0;
    },
    update() {},
    extent() {
      return {
        minX: -Infinity,
        minY: -Infinity,
        maxX: Infinity,
        maxY: Infinity,
      };
    },
  };
}
