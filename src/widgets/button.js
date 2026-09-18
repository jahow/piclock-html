import { DOT_ON, getMatrix } from '../matrix.js';
import { iconSymbols, largeIconSymbols } from './utils/symbols.definitions.js';

/**
 * @param {number} posX
 * @param {number} posY
 * @param {Symbol} icon
 * @param {() => void} onActivate
 * @return {Widget}
 */
export function createButtonWidget(
  posX,
  posY,
  icon,
  onActivate,
  small = false,
  clearBackground = true,
) {
  let active = false;
  const buttonSize = small ? 7 : 9;

  return {
    render(context) {
      const matrix = getMatrix();
      let buttonIcon = active
        ? largeIconSymbols.symbols.buttonActive
        : largeIconSymbols.symbols.button;
      if (small) {
        buttonIcon = active
          ? iconSymbols.symbols.buttonActive
          : iconSymbols.symbols.button;
      }
      matrix.applySymbol(buttonIcon, posX, posY, clearBackground);
      matrix.applySymbol(
        icon,
        posX + (small ? 0 : 1),
        posY + (small ? 0 : 1),
        false,
        active ? DOT_ON : undefined,
      );
    },

    pointerDown(context, x, y) {
      if (
        getMatrix().hitTestDot(
          context,
          x,
          y,
          posX,
          posY,
          buttonSize,
          buttonSize,
        )
      ) {
        active = true;
      } else {
        active = false;
      }
    },

    pointerUp(context, x, y) {
      if (
        getMatrix().hitTestDot(
          context,
          x,
          y,
          posX,
          posY,
          buttonSize,
          buttonSize,
        ) &&
        active
      ) {
        onActivate();
      }
      active = false;
    },
  };
}
