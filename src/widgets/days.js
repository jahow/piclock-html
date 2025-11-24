import { DOT_DAY, DOT_ON, getMatrix } from '../matrix.js';

const CURRENT_DAY_WIDTH_DOTS = 28;
const OTHER_DAY_WIDTH_DOTS = 16;
const DAY_HEIGHT_DOTS = 8;
const PADDING_DOTS = 2;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const DAYS_RENDERED = 5;

/**
 * @type {Widget}
 */
export const daysWidget = {
  render(context) {
    const matrix = getMatrix();

    const ratioDayAdvancement = (new Date().getTime() % DAY_IN_MS) / DAY_IN_MS;
    let currentDotX =
      Math.floor(matrix.width / 2) -
      Math.round(CURRENT_DAY_WIDTH_DOTS * ratioDayAdvancement);
    const currentDotY = 28;

    for (let i = 0; i < DAYS_RENDERED; i++) {
      const dayWidth = i === 0 ? CURRENT_DAY_WIDTH_DOTS : OTHER_DAY_WIDTH_DOTS;
      this.renderDay(
        currentDotX,
        currentDotY,
        dayWidth,
        i === 0 ? ratioDayAdvancement : -1,
      );
      currentDotX += dayWidth + PADDING_DOTS;
    }
  },

  renderDay(baseX, baseY, dayWidth, dayAdvancementRatio) {
    const matrix = getMatrix();
    const nthRowIsNow = Math.round(dayWidth * dayAdvancementRatio);

    for (let i = 0; i < dayWidth; i++) {
      for (let j = 0; j < DAY_HEIGHT_DOTS; j++) {
        if (
          (i === 0 && j === 0) ||
          (i === dayWidth - 1 && j === 0) ||
          (i === 0 && j === DAY_HEIGHT_DOTS - 1) ||
          (i === dayWidth - 1 && j === DAY_HEIGHT_DOTS - 1)
        ) {
          continue; // skip corners
        }
        const dotValue = i === nthRowIsNow ? DOT_ON : DOT_DAY;
        matrix.setDotValue(baseX + i, baseY + j, dotValue);
      }
    }
  },
};
