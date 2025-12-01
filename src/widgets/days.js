import * as SunCalc from 'suncalc';
import {
  DOT_DAWN,
  DOT_DAY,
  DOT_NIGHT,
  DOT_OFF,
  DOT_ON,
  DOT_SIZE_PX,
  DOT_SPACING_PX,
  getMatrix,
} from '../matrix.js';
import { getSymbolChainWidth, getSymbolsFromString } from './utils/symbols.js';
import { weatherSymbols } from './utils/symbols.definitions.js';
import { getEventsOnDate } from './utils/events.js';

const HIGHTLIGHT_COLOR = 'hsl(64,100%,46%)';

const CURRENT_DAY_WIDTH_DOTS = 48;
const OTHER_DAY_WIDTH_DOTS = 24;
const DAY_HEIGHT_DOTS = 15;
const PADDING_DOTS = 1;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const DAYS_RENDERED = 5;

const WEEKDAY_NAMES = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

function getTodayTime() {
  return Math.floor(new Date().getTime() / DAY_IN_MS) * DAY_IN_MS;
}

let currentDay = null;
const sunriseTimes = new Array(DAYS_RENDERED);

const latLon = [48.8566, 2.3522]; // Paris coordinates

function recomputeSunriseTimes() {
  const todayTime = getTodayTime();
  if (currentDay === todayTime) {
    return;
  }

  currentDay = todayTime;

  for (let i = 0; i < DAYS_RENDERED; i++) {
    sunriseTimes[i] = SunCalc.getTimes(
      currentDay + DAY_IN_MS * 0.5 + i * DAY_IN_MS,
      latLon[0],
      latLon[1],
    );
  }
}

let dragging = false;
let dragShiftPx = 0;

/**
 * @type {Widget}
 */
export const daysWidget = {
  render(context) {
    recomputeSunriseTimes();

    if (!dragging) {
      dragShiftPx -= dragShiftPx * 0.3;
      if (Math.abs(dragShiftPx) < 2) {
        dragShiftPx = 0;
      }
    }

    const matrix = getMatrix();

    matrix.fillDots(0, 18, matrix.width, DAY_HEIGHT_DOTS + 6, DOT_OFF);

    const today = new Date();
    const ratioDayAdvancement = (today.getTime() % DAY_IN_MS) / DAY_IN_MS;
    let currentDotX =
      Math.round(matrix.width / 2) -
      Math.round(CURRENT_DAY_WIDTH_DOTS * ratioDayAdvancement) +
      matrix.getDotFromPixel(dragShiftPx);
    const currentDotY = 24;

    for (let i = 0; i < DAYS_RENDERED; i++) {
      const currentDate = new Date(today.getTime() + i * DAY_IN_MS);

      const dayWidth = i === 0 ? CURRENT_DAY_WIDTH_DOTS : OTHER_DAY_WIDTH_DOTS;
      this.renderDayBlock(
        currentDotX,
        currentDotY,
        dayWidth,
        context,
        i === 0 ? ratioDayAdvancement : -1,
        sunriseTimes[i],
      );
      const dayName = WEEKDAY_NAMES[currentDate.getDay()];
      const dayNameSymbols = getSymbolsFromString(dayName);
      matrix.applySymbolChain(
        dayNameSymbols,
        Math.min(
          currentDotX + dayWidth - getSymbolChainWidth(dayNameSymbols) - 2,
          Math.max(0, currentDotX),
        ),
        currentDotY - 6,
      );

      // 3 weather points per day
      this.renderDayWeather(currentDotX, currentDotY, dayWidth);

      const events = getEventsOnDate(currentDate);
      this.renderDayAppointments(
        currentDotX,
        currentDotY,
        dayWidth,
        context,
        currentDate,
        events,
        i === 0,
      );

      currentDotX += dayWidth + PADDING_DOTS;
    }
  },

  /**
   * @param {number} baseX
   * @param {number} baseY
   * @param {number} dayWidth
   * @param {CanvasRenderingContext2D} context
   * @param {number} dayAdvancementRatio
   * @param {Object} sunriseTimes
   */
  renderDayBlock(
    baseX,
    baseY,
    dayWidth,
    context,
    dayAdvancementRatio,
    sunriseTimes,
  ) {
    const matrix = getMatrix();

    const nightEndRow = Math.round(
      dayWidth * ((sunriseTimes.nightEnd.getTime() % DAY_IN_MS) / DAY_IN_MS),
    );
    const nightStartRow = Math.round(
      dayWidth * ((sunriseTimes.night.getTime() % DAY_IN_MS) / DAY_IN_MS),
    );
    const sunriseRow = Math.round(
      dayWidth *
        ((sunriseTimes.goldenHourEnd.getTime() % DAY_IN_MS) / DAY_IN_MS),
    );
    const sunsetRow = Math.round(
      dayWidth * ((sunriseTimes.goldenHour.getTime() % DAY_IN_MS) / DAY_IN_MS),
    );

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
        let dotValue = DOT_DAY;
        if (i <= nightEndRow || i >= nightStartRow) {
          dotValue = DOT_NIGHT;
        } else if (i <= sunriseRow || i >= sunsetRow) {
          dotValue = DOT_DAWN;
        }
        matrix.setDotValue(baseX + i, baseY + j, dotValue);
      }
    }

    if (dayAdvancementRatio < 0) {
      return;
    }

    // current time indicator
    const baseCoords = matrix.getPixelFromDotPosition(
      context,
      baseX + dayWidth * dayAdvancementRatio,
      baseY,
    );
    baseCoords[0] += DOT_SIZE_PX / 2 + DOT_SPACING_PX / 2;
    context.fillStyle = HIGHTLIGHT_COLOR;
    const dayHeightPx = matrix.getPixelFromDot(DAY_HEIGHT_DOTS);
    context.beginPath();
    context.moveTo(baseCoords[0], baseCoords[1] + dayHeightPx + 10);
    context.lineTo(baseCoords[0] + 10, baseCoords[1] + dayHeightPx);
    context.lineTo(baseCoords[0], baseCoords[1] + dayHeightPx - 10);
    context.lineTo(baseCoords[0] - 10, baseCoords[1] + dayHeightPx);
    context.closePath();
    context.fill();
  },

  /**
   * @param {number} baseX
   * @param {number} baseY
   * @param {number} dayWidth
   */
  renderDayWeather(baseX, baseY, dayWidth) {
    const matrix = getMatrix();
    const weatherDotY = baseY + 1;
    const weatherIconWidth = weatherSymbols.baseWidth;
    const weatherIconShift = Math.round(weatherIconWidth / 2);

    const weatherIconCount = dayWidth > 40 ? 3 : 1;
    const weatherDotXOffset = Math.round(dayWidth / weatherIconCount / 2);

    // TEMP
    const weather = 'cloud';
    const temp = -90;
    const tempSymbols = getSymbolsFromString(temp.toFixed(0));

    for (let i = 0; i < weatherIconCount; i++) {
      const symbolX = baseX + weatherDotXOffset * (1 + i * 2);
      matrix.applySymbol(
        weatherSymbols.symbols[weather],
        symbolX - weatherIconShift,
        weatherDotY,
        false,
      );
      const tempSymbolsShift = Math.round(getSymbolChainWidth(tempSymbols) / 2);
      matrix.applySymbolChain(
        tempSymbols,
        symbolX - tempSymbolsShift - 1,
        weatherDotY + 8,
        false,
      );
    }
  },

  renderDayAppointments(
    baseX,
    baseY,
    dayWidth,
    context,
    currentDateStart,
    events,
    showEventTime,
  ) {
    const matrix = getMatrix();
    const dayWidthPx = matrix.getPixelFromDot(dayWidth);
    const eventsOrigin = matrix.getPixelFromDotPosition(
      context,
      baseX,
      baseY + 17,
    );
    context.font = '18px sans-serif';
    for (let i = 0; i < events.length; i++) {
      const eventOriginX = eventsOrigin[0];
      const eventOriginY = eventsOrigin[1] + 20 * i;
      const event = events[i];
      const eventStartPx = event.startDayRatio * dayWidthPx;
      const eventEndPx = event.endDayRatio * dayWidthPx;
      const titleWidthPx = context.measureText(event.title).width;
      context.fillStyle = 'hsl(47, 84%, 82%)';

      if (!showEventTime) {
        context.fillText(event.title, eventOriginX, eventOriginY - 2);
        continue;
      }

      const textOriginX = eventOriginX + eventStartPx - 14 - titleWidthPx; // text on the left of the time bar
      context.fillText(event.title, textOriginX, eventOriginY - 2);
      context.fillStyle = HIGHTLIGHT_COLOR;
      context.strokeStyle = HIGHTLIGHT_COLOR;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(eventOriginX + eventStartPx, eventOriginY - 14);
      context.lineTo(eventOriginX + eventEndPx, eventOriginY - 14);
      context.lineTo(eventOriginX + eventEndPx + 8, eventOriginY - 6);
      context.lineTo(eventOriginX + eventEndPx, eventOriginY + 2);
      context.lineTo(eventOriginX + eventStartPx, eventOriginY + 2);
      context.lineTo(eventOriginX + eventStartPx - 8, eventOriginY - 6);
      context.lineTo(eventOriginX + eventStartPx, eventOriginY - 14);
      context.closePath();
      context.fill();
      // context.strokeRect(
      //   eventOriginX + eventStartPx,
      //   eventsOrigin[1] - 18,
      //   0,
      //   eventOriginY - eventsOrigin[1] + 8,
      // );
      // context.strokeRect(
      //   eventOriginX + eventEndPx,
      //   eventsOrigin[1] - 18,
      //   0,
      //   eventOriginY - eventsOrigin[1] + 8,
      // );
    }
  },

  pointerDown(context, x, y) {
    const dotPos = getMatrix().getDotPositionFromPixel(context, x, y);
    if (dotPos[1] < 18) {
      return;
    }
    dragging = true;
  },

  pointerMove(context, x, y, prevX, prevY) {
    if (!dragging) {
      return;
    }
    dragShiftPx += x - prevX;
  },

  pointerUp(context, x, y) {
    dragging = false;
  },
};
