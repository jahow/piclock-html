import { clockSymbols } from './utils/symbols.definitions.js';

class CharMatrixState {
  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;

    /**
     * @type {number[]}
     */
    this.state = new Array(width * height).fill(-1);

    /**
     * @type {boolean[]}
     */
    this.stateChanged = new Array(width * height).fill(false);
  }

  /**
   * the symbol should have the same width and height as the original parameters
   * @param {Symbol} symbol
   */
  applySymbol(symbol) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        const targetValue = symbol.pixels[index];
        const currentValue = this.state[index];

        if (currentValue === -1) {
          this.state[index] = targetValue;
          this.stateChanged[index] = true;
          continue;
        }

        if (currentValue === targetValue) {
          this.stateChanged[index] = false;
          continue;
        }

        this.stateChanged[index] = true;

        if (currentValue < targetValue) {
          this.state[index] = Math.min(currentValue + 0.2, 1);
        } else if (currentValue > targetValue) {
          this.state[index] = Math.max(currentValue - 0.1, 0);
        }
      }
    }
  }
}

const charsState = [
  new CharMatrixState(clockSymbols.symbols['0'].width, clockSymbols.height), // hours
  new CharMatrixState(clockSymbols.symbols['0'].width, clockSymbols.height),
  new CharMatrixState(clockSymbols.symbols[':'].width, clockSymbols.height), // separator
  new CharMatrixState(clockSymbols.symbols['0'].width, clockSymbols.height), // minutes
  new CharMatrixState(clockSymbols.symbols['0'].width, clockSymbols.height),
];

const DOT_SIZE = 10;
const DOT_SPACING = 4;
const CHAR_SPACING = 2 * (DOT_SIZE + DOT_SPACING);
const TOTAL_WIDTH =
  charsState.reduce(
    (prev, curr) => prev + curr.width * (DOT_SIZE + DOT_SPACING),
    0,
  ) +
  CHAR_SPACING * (charsState.length - 1);

/**
 * @type {Widget}
 */
export const clockWidget = {
  render(context) {
    const baseX = context.canvas.width / 2 - TOTAL_WIDTH / 2;
    const baseY = 150;

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

    let baseOffsetX = baseX;

    for (let i = 0; i < chars.length; i++) {
      const charState = charsState[i];
      charState.applySymbol(clockSymbols.symbols[chars[i]]);

      for (let j = 0; j < charState.state.length; j++) {
        if (!charState.stateChanged[j]) continue;

        let value = charState.state[j];
        value = 0.1 + value * 0.9;
        value = Math.round(value * 100);
        context.fillStyle = `hsl(0, 0%, ${value}%)`;

        const offsetX =
          baseOffsetX + (j % charState.width) * (DOT_SIZE + DOT_SPACING);
        const offsetY =
          baseY + Math.floor(j / charState.width) * (DOT_SIZE + DOT_SPACING);
        context.fillRect(offsetX, offsetY, DOT_SIZE, DOT_SIZE);
      }

      baseOffsetX += charState.width * (DOT_SIZE + DOT_SPACING) + CHAR_SPACING;
    }
  },
};
