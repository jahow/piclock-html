import { clockSymbols } from './utils/symbols.definitions.js';
import { DOT_WARNING, getMatrix } from '../matrix.js';

const PADDING_DOTS = 1;
const CHAR_SPACING_DOTS = 3;

const DOTS_WIDTH =
  clockSymbols.symbols['0'].width +
  CHAR_SPACING_DOTS +
  clockSymbols.symbols['0'].width +
  CHAR_SPACING_DOTS +
  clockSymbols.symbols[':'].width +
  CHAR_SPACING_DOTS +
  clockSymbols.symbols['0'].width +
  CHAR_SPACING_DOTS +
  clockSymbols.symbols['0'].width;
const DOTS_HEIGHT = clockSymbols.height + PADDING_DOTS * 2;

let topDotClicked = false;
let bottomDotClicked = false;
let lastDotClickedTime = -1;

/**
 * @type {Widget}
 */
export const clockWidget = {
  render(context) {
    const now = new Date();
    const hours = now.getHours().toString(10);
    const minutes = now.getMinutes().toString(10);
    const seconds = now.getSeconds().toString(10);
    const chars = [
      ...hours.padStart(2, '0'),
      seconds % 2 ? ':(top)' : ':(bottom)',
      ...minutes.padStart(2, '0'),
    ];

    context.fillStyle = 'white';

    const matrix = getMatrix();

    let currentDotX = Math.round((matrix.width - DOTS_WIDTH) / 2);
    let currentDotY = 1;

    for (let i = 0; i < chars.length; i++) {
      const symbol = clockSymbols.symbols[chars[i]];
      getMatrix().applySymbol(symbol, currentDotX, currentDotY);
      currentDotX += symbol.width + CHAR_SPACING_DOTS;
    }

    if (lastDotClickedTime > 0 && Date.now() - lastDotClickedTime > 1000) {
      topDotClicked = false;
      bottomDotClicked = false;
      lastDotClickedTime = -1;
    }
    if (topDotClicked) {
      matrix.fillDots(39, 4, 3, 3, DOT_WARNING);
    }
    if (bottomDotClicked) {
      matrix.fillDots(39, 10, 3, 3, DOT_WARNING);
    }
  },

  pointerDown(context, x, y) {
    if (getMatrix().hitTestDot(context, x, y, 39, 4, 3, 3)) {
      topDotClicked = true;
    } else if (getMatrix().hitTestDot(context, x, y, 39, 10, 3, 3)) {
      bottomDotClicked = true;
    }
    if (bottomDotClicked && topDotClicked) {
      window.parent.close();
    }
    lastDotClickedTime = Date.now();
  },
};
