import { clockSymbols } from './utils/symbols.definitions.js';

class MatrixState {
  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.firstRender = true;

    /**
     * @type {number[]}
     */
    this.pixels = new Array(width * height).fill(0);

    /**
     * @type {boolean[]}
     */
    this.pixelChanged = new Array(width * height).fill(true);

    this.anyPixelChanged = true;
  }

  /**
   * the symbol should have the same width and height as the original parameters
   * @param {Symbol} symbol
   * @param {number} xPosition
   * @param {number} yPosition
   */
  applySymbol(symbol, xPosition, yPosition) {
    for (let y = 0; y < symbol.height; y++) {
      for (let x = 0; x < symbol.width; x++) {
        const symbolIndex = y * symbol.width + x;
        const matrixIndex = (yPosition + y) * this.width + (xPosition + x);
        const targetValue = symbol.pixels[symbolIndex];
        const currentValue = this.pixels[matrixIndex];

        if (currentValue === targetValue) {
          this.pixelChanged[matrixIndex] = false;
          continue;
        }

        this.pixelChanged[matrixIndex] = true;
        this.anyPixelChanged = true;

        if (currentValue < targetValue) {
          this.pixels[matrixIndex] = Math.min(currentValue + 0.2, 1);
        } else if (currentValue > targetValue) {
          this.pixels[matrixIndex] = Math.max(currentValue - 0.05, 0);
        }
      }
    }
  }

  afterRender() {
    this.firstRender = false;
    this.pixelChanged.fill(false);
    this.anyPixelChanged = false;
  }
}

const PADDING_DOTS = 1;
const CHAR_SPACING_DOTS = 2;
const matrixState = new MatrixState(
  clockSymbols.symbols['0'].width +
    CHAR_SPACING_DOTS +
    clockSymbols.symbols['0'].width +
    CHAR_SPACING_DOTS +
    clockSymbols.symbols[':'].width +
    CHAR_SPACING_DOTS +
    clockSymbols.symbols['0'].width +
    CHAR_SPACING_DOTS +
    clockSymbols.symbols['0'].width +
    PADDING_DOTS * 2,
  clockSymbols.height + PADDING_DOTS * 2,
);

const DOT_SIZE_PX = 8;
const DOT_SPACING_PX = 2;
const TOTAL_WIDTH_PX = matrixState.width * (DOT_SIZE_PX + DOT_SPACING_PX);

/**
 * @type {Widget}
 */
export const clockWidget = {
  render(context) {
    const baseX = (context.canvas.width - TOTAL_WIDTH_PX) / 2;
    const baseY = 10;

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

    let currentDotX = PADDING_DOTS;

    // we only draw symbols on second render to have a proper first state
    if (!matrixState.firstRender) {
      for (let i = 0; i < chars.length; i++) {
        const symbol = clockSymbols.symbols[chars[i]];
        matrixState.applySymbol(symbol, currentDotX, PADDING_DOTS);
        currentDotX += symbol.width + CHAR_SPACING_DOTS;
      }
    }

    if (matrixState.anyPixelChanged) {
      for (let j = 0; j < matrixState.pixels.length; j++) {
        if (!matrixState.pixelChanged[j]) continue;

        const ratio = matrixState.pixels[j];
        const value = Math.round((0.15 + ratio * 0.85) * 100);

        const offsetX =
          baseX + (j % matrixState.width) * (DOT_SIZE_PX + DOT_SPACING_PX);
        const offsetY =
          baseY +
          Math.floor(j / matrixState.width) * (DOT_SIZE_PX + DOT_SPACING_PX);
        context.fillStyle = `black`;
        context.fillRect(offsetX, offsetY, DOT_SIZE_PX, DOT_SIZE_PX);

        const fullRadius = DOT_SIZE_PX / 2;
        const smallRadius = DOT_SIZE_PX / 10;

        context.fillStyle = `hsl(0, 0%, ${value}%)`;
        context.beginPath();
        context.ellipse(
          offsetX + fullRadius,
          offsetY + fullRadius,
          smallRadius + (fullRadius - 0.5 - smallRadius) * ratio,
          fullRadius - 0.5,
          Math.PI * 0.25,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
    }

    matrixState.afterRender();
  },
};
