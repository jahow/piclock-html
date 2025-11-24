const DOT_SIZE_PX = 8;
const DOT_SPACING_PX = 2;

const DOT_COLOR = 'hsl(35,84%,60%)';

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
     * @type {number[]}
     */
    this.dots = new Array(widthDot * heightDot).fill(0);

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
   */
  applySymbol(symbol, xPosition, yPosition) {
    for (let y = 0; y < symbol.height; y++) {
      for (let x = 0; x < symbol.width; x++) {
        const symbolIndex = y * symbol.width + x;
        const targetValue = symbol.dots[symbolIndex];
        this.setDotValue(xPosition + x, yPosition + y, targetValue);
      }
    }
  }

  /**
   * @param {number} xPosition
   * @param {number} yPosition
   * @param {number} value
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
    const currentValue = this.dots[matrixIndex];

    if (currentValue === value) {
      this.dotChanged[matrixIndex] = false;
      return;
    }

    this.dotChanged[matrixIndex] = true;
    this.anyDotChanged = true;

    const difference = value - currentValue;
    if (currentValue < value) {
      this.dots[matrixIndex] = Math.min(currentValue + difference * 0.25, 1);
    } else if (currentValue > value) {
      this.dots[matrixIndex] = Math.max(currentValue + difference * 0.125, 0);
    }
    if (this.dots[matrixIndex] < 0.01) this.dots[matrixIndex] = 0;
    if (this.dots[matrixIndex] > 0.99) this.dots[matrixIndex] = 1;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  render(context) {
    const baseX = (context.canvas.width - this.widthPx) / 2;
    const baseY = (context.canvas.height - this.heightPx) / 2;

    if (this.anyDotChanged) {
      for (let j = 0; j < this.dots.length; j++) {
        if (!this.dotChanged[j] && !this.firstRender) continue; // we're forcing an initial render of all dots

        const ratio = this.dots[j];

        const offsetX =
          baseX + (j % this.width) * (DOT_SIZE_PX + DOT_SPACING_PX);
        const offsetY =
          baseY + Math.floor(j / this.width) * (DOT_SIZE_PX + DOT_SPACING_PX);
        context.fillStyle = `black`;
        context.fillRect(offsetX, offsetY, DOT_SIZE_PX, DOT_SIZE_PX);

        const fullRadius = DOT_SIZE_PX / 2;
        const smallRadius = fullRadius;
        const radius = smallRadius + (fullRadius - smallRadius) * ratio;

        const value = Math.round((0.05 + ratio * 0.95) * 82);
        context.fillStyle = `hsl(47, 84%, ${value}%)`;
        // context.fillStyle = DOT_COLOR;
        context.beginPath();
        context.roundRect(
          offsetX + fullRadius - radius,
          offsetY + fullRadius - radius,
          radius * 2,
          radius * 2,
          2,
        );
        context.fill();
        console.log('drawing dot');
      }
    }

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
