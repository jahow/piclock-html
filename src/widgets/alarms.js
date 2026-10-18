import {
  DOT_DAWN,
  DOT_DAY,
  DOT_NIGHT,
  DOT_ON,
  DOT_WARNING,
  getMatrix,
} from '../matrix.js';
import { getRatioOfTimeInDay } from './utils/misc.js';
import { getSunriseTimes } from './utils/sunrise.js';
import { getSymbolFromString } from './utils/symbols.js';
import { textSymbols } from './utils/symbols.definitions.js';

const DAY_HEIGHT_DOTS = 33;
const DAY_WIDTH_DOTS = 7;
const PADDING_DOTS = 2;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const DAYS_RENDERED = 7;

const DAY_LETTERS = ['l', 'm', 'm', 'j', 'v', 's', 'd'];

function getTodayTime() {
  return Math.floor(new Date().getTime() / DAY_IN_MS) * DAY_IN_MS;
}

let dragging = false;
let dragShiftCounter = 0;
let dragShiftPx = 0;

/**
 * @type {Widget}
 */
export const alarmsWidget = {
  render(context) {
    const matrix = getMatrix();

    if (!getSunriseTimes()) {
      return;
    }

    for (let i = 0; i < 7; i++) {
      this.renderDayBlock(
        4 + i * (DAY_WIDTH_DOTS + PADDING_DOTS),
        8,
        context,
        getSymbolFromString(DAY_LETTERS[i]),
      );
    }
  },

  /**
   * @param {number} baseX
   * @param {number} baseY
   * @param {CanvasRenderingContext2D} context
   * @param {Symbol} symbol
   */
  renderDayBlock(baseX, baseY, context, symbol) {
    const matrix = getMatrix();
    const sunriseTimes = getSunriseTimes();

    const nightEndRow = Math.round(
      DAY_HEIGHT_DOTS * getRatioOfTimeInDay(sunriseTimes.nightEnd),
    );
    const nightStartRow = Math.round(
      DAY_HEIGHT_DOTS * getRatioOfTimeInDay(sunriseTimes.night),
    );
    const sunriseRow = Math.round(
      DAY_HEIGHT_DOTS * getRatioOfTimeInDay(sunriseTimes.sunrise),
    );
    const sunsetRow = Math.round(
      DAY_HEIGHT_DOTS * getRatioOfTimeInDay(sunriseTimes.sunset),
    );

    for (let i = 0; i < DAY_WIDTH_DOTS; i++) {
      for (let j = 0; j < DAY_HEIGHT_DOTS; j++) {
        if (
          (i === 0 && j === 0) ||
          (i === DAY_WIDTH_DOTS - 1 && j === 0) ||
          (i === 0 && j === DAY_HEIGHT_DOTS - 1) ||
          (i === DAY_WIDTH_DOTS - 1 && j === DAY_HEIGHT_DOTS - 1)
        ) {
          continue; // skip corners
        }
        let dotValue = DOT_DAY;
        if (j <= nightEndRow || j >= nightStartRow) {
          dotValue = DOT_NIGHT;
        } else if (j <= sunriseRow || j >= sunsetRow) {
          dotValue = DOT_DAWN;
        }
        matrix.setDotValue(baseX + i, baseY + j, dotValue);
      }
    }

    // day name
    matrix.applySymbol(
      symbol,
      baseX + Math.floor(DAY_WIDTH_DOTS / 2 - symbol.width / 2),
      baseY - 6,
      false,
      DOT_ON,
    );

    matrix.applySymbol(
      textSymbols.symbols.delete,
      baseX + 1,
      baseY + 1 + DAY_HEIGHT_DOTS,
      false,
      DOT_WARNING,
    );
  },

  pointerDown(context, x, y) {},

  pointerMove(context, x, y, prevX, prevY) {},

  pointerUp(context, x, y) {},
};
