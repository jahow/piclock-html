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
      return 'hsl(190,24%,28%)';
    case DOT_DAY:
      return 'hsl(163,33%,36%)';
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
     * @type {DotValue[]}
     */
    this.dotValuesLastRequested = new Array(widthDot * heightDot).fill(DOT_OFF);

    /**
     * @private
     * @type {boolean[]}
     */
    this.dotValuesChanged = new Array(widthDot * heightDot).fill(false);

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

    this.dotValuesLastRequested[matrixIndex] = value;
    this.dotValuesChanged[matrixIndex] = true;
    this.anyDotChanged = true;
  }

  /**
   * @param {number} xPosition
   * @param {number} yPosition
   * @param {number} rectWidth
   * @param {number} rectHeight
   * @param {DotValue} value
   */
  fillDots(xPosition, yPosition, rectWidth, rectHeight, value) {
    for (let y = 0; y < rectHeight; y++) {
      for (let x = 0; x < rectWidth; x++) {
        this.setDotValue(xPosition + x, yPosition + y, value);
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {number} dotX
   * @param {number} dotY
   * @return {number[]} pixel coordinates
   */
  getPixelFromDotPosition(context, dotX, dotY) {
    const baseX = (context.canvas.width - this.widthPx) / 2;
    const baseY = (context.canvas.height - this.heightPx) / 2;
    const pixelX = baseX + this.getPixelFromDot(dotX);
    const pixelY = baseY + this.getPixelFromDot(dotY);
    return [pixelX, pixelY];
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {number} pixelX
   * @param {number} pixelY
   * @return {number[]} dot coordinates
   */
  getDotPositionFromPixel(context, pixelX, pixelY) {
    const baseX = (context.canvas.width - this.widthPx) / 2;
    const baseY = (context.canvas.height - this.heightPx) / 2;
    const dotX = this.getDotFromPixel(pixelX - baseX);
    const dotY = this.getDotFromPixel(pixelY - baseY);
    return [dotX, dotY];
  }

  /**
   * @param {number} pixelValue
   * @return {number} dot value
   */
  getDotFromPixel(pixelValue) {
    return Math.round(pixelValue / (DOT_SIZE_PX + DOT_SPACING_PX));
  }

  /**
   * @param {number} dotValue
   * @return {number} dot value
   */
  getPixelFromDot(dotValue) {
    return dotValue * (DOT_SIZE_PX + DOT_SPACING_PX);
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
        let ratio = this.dotValuesInterpolationRatio[j];
        const fromValue = this.dotValuesFrom[j];
        let toValue = this.dotValuesTo[j];
        const changed = this.dotValuesChanged[j];
        const lastRequestedValue = this.dotValuesLastRequested[j];

        if (changed && lastRequestedValue !== toValue) {
          toValue = lastRequestedValue;
          this.dotValuesTo[j] = toValue;
          if (ratio === 1) {
            ratio = 0;
          }
        }

        const dotStable = ratio === 1;
        if (dotStable && !this.firstRender) continue; // we're forcing an initial render of all dots

        // update dot transition ratio
        const ratioDelta =
          fromValue < toValue ? (1 - ratio) * 0.25 : (1 - ratio) * 0.15;
        ratio += ratioDelta;
        if (ratio > 0.99) {
          ratio = 1;
          this.dotValuesFrom[j] = toValue; // we're storing toValue in fromValue when the transition is complete
        }
        this.dotValuesInterpolationRatio[j] = ratio;

        // render dot
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

    console.log(`drawn ${rendered} new dots`);

    // after render
    this.firstRender = false;
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
