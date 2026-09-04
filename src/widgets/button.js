import { DOT_ON, getMatrix } from '../matrix.js';
import { largeIconSymbols } from './utils/symbols.definitions.js';

/**
 * @param {number} posX
 * @param {number} posY
 * @param {Symbol} icon
 * @param {() => void} onActivate
 * @return {Widget}
 */
export function createButtonWidget(posX, posY, icon, onActivate) {
  let active = false;
  return {
    render(context) {
      const matrix = getMatrix();
      const buttonIcon = active
        ? largeIconSymbols.symbols.buttonActive
        : largeIconSymbols.symbols.button;
      matrix.applySymbol(buttonIcon, posX, posY, true);
      matrix.applySymbol(
        icon,
        posX + 1,
        posY + 1,
        false,
        active ? DOT_ON : undefined,
      );
    },

    pointerDown(context, x, y) {
      const dotPos = getMatrix().getDotPositionFromPixel(context, x, y);
      if (
        dotPos[1] >= posY &&
        dotPos[1] <= posY + 9 &&
        dotPos[0] >= posX &&
        dotPos[0] <= posX + 9
      ) {
        active = true;
      } else {
        active = false;
      }
    },

    pointerUp(context, x, y) {
      const dotPos = getMatrix().getDotPositionFromPixel(context, x, y);
      if (
        dotPos[1] >= posY &&
        dotPos[1] <= posY + 9 &&
        dotPos[0] >= posX &&
        dotPos[0] <= posX + 9 &&
        active
      ) {
        onActivate();
      }
      active = false;
    },
  };
}
