import {
  DOT_DAWN,
  DOT_DAY,
  DOT_MUTED,
  DOT_NIGHT,
  DOT_OFF,
  DOT_ON,
  DOT_OVERLAY,
  DOT_SIZE_PX,
  DOT_SPACING_PX,
  getDotColor,
  getMatrix,
} from '../matrix.js';
import { getSymbolChainWidth, getSymbolsFromString } from './utils/symbols.js';
import {
  iconSymbols,
  largeIconSymbols,
  weatherSymbols,
} from './utils/symbols.definitions.js';
import { getEventsOnDate, refreshEvents } from './utils/events.js';
import { getLatitudeLongitude } from './utils/location.js';
import { getForecast, refreshWeatherForecast } from './utils/weather.js';
import { getRatioOfTimeInDay } from './utils/misc.js';
import { renderCircle } from './utils/shapes.js';

const HIGHLIGHT_COLOR = getDotColor(DOT_OVERLAY);

/**
 * @type {Widget}
 */
export const buttonRadioWidget = {
  render(context) {
    const matrix = getMatrix();
    // renderCircle(2, 4, 9, DOT_MUTED);
    matrix.applySymbol(largeIconSymbols.symbols.button, 2, 4, false);
    matrix.applySymbol(iconSymbols.symbols.radio, 3, 5, false);
  },

  pointerDown(context, x, y) {
    // const dotPos = getMatrix().getDotPositionFromPixel(context, x, y);
    // if (dotPos[1] < 18) {
    //   return;
    // }
    // dragging = true;
  },

  pointerMove(context, x, y, prevX, prevY) {
    // if (!dragging) {
    //   return;
    // }
    // dragShiftPx += x - prevX;
  },

  pointerUp(context, x, y) {
    // dragging = false;
  },
};
