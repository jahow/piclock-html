const DOT_SIZE_PX = 8;
const DOT_SPACING_PX = 2;

export const DOT_OFF = /** @type {DotValue} */ (0);
export const DOT_NIGHT = /** @type {DotValue} */ (1);
export const DOT_DAWN = /** @type {DotValue} */ (2);
export const DOT_DAY = /** @type {DotValue} */ (3);
export const DOT_ON = /** @type {DotValue} */ (4);
export const DOT_OVERLAY = /** @type {DotValue} */ (5);

/**
 * @typedef {DOT_OFF|DOT_ON|DOT_NIGHT|DOT_DAY|DOT_DAWN|DOT_OVERLAY} DotValue
 */

/**
 * @param {DotValue} dotValue
 * @return {string} color
 */
function getDotColor(dotValue) {
  switch (dotValue) {
    case DOT_OFF:
      return 'hsl(41,76%,5%)';
    case DOT_NIGHT:
      return 'hsl(236,15%,20%)';
    case DOT_DAWN:
      return 'hsl(22,46%,30%)';
    case DOT_DAY:
      return 'hsl(39,25%,33%)';
    case DOT_ON:
      return 'hsl(47, 84%, 82%)';
    case DOT_OVERLAY:
      return 'hsl(64,100%,87%)';
  }
}

/**
 * @param {DotValue} valueFrom
 * @param {DotValue} valueTo
 * @param {number} ratio
 * @return {string} color
 */
function interpolateDotValues(valueFrom, valueTo, ratio) {
  const start = getDotColor(valueFrom);
  const end = getDotColor(valueTo);
  if (ratio === 0) return start;
  if (ratio === 1) return end;
  const ratioInPc = Math.round(ratio * 100);
  const ratioOutPc = 100 - ratioInPc;
  return `color-mix(in srgb, ${start} ${ratioOutPc}%, ${end} ${ratioInPc}%)`;
}

class DotMatrix {
  /**
   * @param {number} widthDot
   * @param {number} heightDot
   */
  constructor(widthDot, heightDot) {
    this.width = widthDot;
    this.height = heightDot;

    /**
     * @private
     */
    this.firstRender = true;

    /**
     * @private
     * @type {DotValue[]}
     */
    this.dotValuesFrom = new Array(widthDot * heightDot).fill(DOT_OFF);

    /**
     * @private
     * @type {DotValue[]}
     */
    this.dotValuesTo = new Array(widthDot * heightDot).fill(DOT_OFF);

    /**
     * @private
     * @type {number[]}
     */
    this.dotValuesInterpolationRatio = new Array(widthDot * heightDot).fill(1);

    /**
     * @private
     * @type {boolean[]}
     */
    this.dotChanged = new Array(widthDot * heightDot).fill(true);

    /**
     * @private
     */
    this.anyDotChanged = true;

    this.widthPx = widthDot * (DOT_SIZE_PX + DOT_SPACING_PX) - DOT_SPACING_PX;
    this.heightPx = heightDot * (DOT_SIZE_PX + DOT_SPACING_PX) - DOT_SPACING_PX;
  }

  /**
   * the symbol should have the same width and height as the original parameters
   * @param {Symbol} symbol
   * @param {number} xPosition
   * @param {number} yPosition
   * @param {boolean} clearBackground
   */
  applySymbol(symbol, xPosition, yPosition, clearBackground = true) {
    for (let y = 0; y < symbol.height; y++) {
      for (let x = 0; x < symbol.width; x++) {
        const symbolIndex = y * symbol.width + x;
        const targetValue = symbol.dots[symbolIndex];
        if (!targetValue && !clearBackground) {
          continue;
        }
        this.setDotValue(
          xPosition + x,
          yPosition + y,
          targetValue ? DOT_ON : DOT_OFF,
        );
      }
    }
  }

  /**
   * draw symbols one after the other with a padding of 1 dot
   * @param {Symbol[]} symbols
   * @param {number} xPosition
   * @param {number} yPosition
   * @param {boolean} clearBackground
   */
  applySymbolChain(symbols, xPosition, yPosition, clearBackground = true) {
    let startX = xPosition;
    for (let i = 0; i < symbols.length; i++) {
      this.applySymbol(symbols[i], startX, yPosition, clearBackground);
      startX += symbols[i].width + 1;
    }
  }

  /**
   * @param {number} xPosition
   * @param {number} yPosition
   * @param {DotValue} value
   */
  setDotValue(xPosition, yPosition, value) {
    if (
      xPosition < 0 ||
      xPosition >= this.width ||
      yPosition < 0 ||
      yPosition >= this.height
    ) {
      return;
    }

    const matrixIndex = yPosition * this.width + xPosition;
    const fromValue = this.dotValuesFrom[matrixIndex];
    const toValue = this.dotValuesTo[matrixIndex];
    let ratio = this.dotValuesInterpolationRatio[matrixIndex];
    let currentValue = fromValue + (toValue - fromValue) * ratio;

    if (currentValue === value && ratio === 1) {
      // this.dotChanged[matrixIndex] = false;
      return;
    }

    if (this.dotChanged[matrixIndex]) {
      // the dot was already changed in that frame; simply change the target
      this.dotValuesTo[matrixIndex] = value;
    }

    this.dotChanged[matrixIndex] = true;
    this.anyDotChanged = true;

    if (value !== this.dotValuesTo[matrixIndex]) {
      // new transition
      this.dotValuesInterpolationRatio[matrixIndex] = 0;
      this.dotValuesFrom[matrixIndex] = toValue;
      this.dotValuesTo[matrixIndex] = value;
      currentValue = toValue;
      ratio = 0;
    }

    const ratioDelta =
      currentValue < value ? (1 - ratio) * 0.25 : (1 - ratio) * 0.125;
    let newRatio = ratio + ratioDelta;
    if (newRatio < 0.01) newRatio = 0;
    if (newRatio > 0.99) newRatio = 1;

    this.dotValuesInterpolationRatio[matrixIndex] = newRatio;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  render(context) {
    const baseX = (context.canvas.width - this.widthPx) / 2;
    const baseY = (context.canvas.height - this.heightPx) / 2;

    let rendered = 0;
    if (this.anyDotChanged) {
      for (let j = 0; j < this.dotValuesTo.length; j++) {
        if (!this.dotChanged[j] && !this.firstRender) continue; // we're forcing an initial render of all dots

        const fromValue = this.dotValuesFrom[j];
        const toValue = this.dotValuesTo[j];
        const ratio = this.dotValuesInterpolationRatio[j];

        const offsetX =
          baseX + (j % this.width) * (DOT_SIZE_PX + DOT_SPACING_PX);
        const offsetY =
          baseY + Math.floor(j / this.width) * (DOT_SIZE_PX + DOT_SPACING_PX);
        context.fillStyle = `black`;
        context.fillRect(offsetX, offsetY, DOT_SIZE_PX, DOT_SIZE_PX);

        const fullRadius = DOT_SIZE_PX / 2;
        // const smallRadius = fullRadius;
        const radius = fullRadius;

        context.fillStyle = interpolateDotValues(fromValue, toValue, ratio);
        context.beginPath();
        context.roundRect(
          offsetX + fullRadius - radius,
          offsetY + fullRadius - radius,
          radius * 2,
          radius * 2,
          DOT_SPACING_PX,
        );
        context.fill();
        rendered++;
      }
    }

    console.log(`rendered ${rendered} dots`);

    // after render
    this.firstRender = false;
    this.dotChanged.fill(false);
    this.anyDotChanged = false;
  }
}

let matrix = null;

/**
 * @param {CanvasRenderingContext2D} context
 */
export function createMatrix(context) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  const widthDot = Math.floor(width / (DOT_SIZE_PX + DOT_SPACING_PX));
  const heightDot = Math.floor(height / (DOT_SIZE_PX + DOT_SPACING_PX));
  matrix = new DotMatrix(widthDot, heightDot);
}

/**
 * @return {DotMatrix}
 */
export function getMatrix() {
  return matrix;
}
