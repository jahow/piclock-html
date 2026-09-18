import { DOT_DAWN, DOT_NIGHT, DOT_OFF, getMatrix } from '../matrix.js';
import { veryLargeIconSymbols } from './utils/symbols.definitions.js';

/**
 * @param {number} posX
 * @param {number} posY
 * @param {() => boolean} isActive
 * @return {Widget}
 */
export function createRippleAnimationWidget(posX, posY, isActive) {
  let frameCounter = 0;
  let animationRatio = 5;

  return {
    render(context) {
      if (!isActive()) return;
      const matrix = getMatrix();

      let icon;
      const size = veryLargeIconSymbols.baseWidth;
      const animStep = frameCounter / (16 * animationRatio);
      if (animStep < 0.4) {
        icon = veryLargeIconSymbols.symbols.ripple1;
      } else if (animStep < 0.8) {
        icon = veryLargeIconSymbols.symbols.ripple2;
      }

      if (!!icon) {
        const value = animStep < 0.6 && animStep > 0.2 ? DOT_DAWN : DOT_NIGHT;
        matrix.applySymbol(icon, posX, posY, true, value);
      } else {
        matrix.fillDots(posX, posY, size, size, DOT_OFF);
      }
      frameCounter = (frameCounter + 1) % (16 * animationRatio);
    },
  };
}
